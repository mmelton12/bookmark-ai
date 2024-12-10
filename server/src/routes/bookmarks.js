const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Bookmark = require('../models/Bookmark');
const User = require('../models/User');
const { analyzeContent } = require('../services/openai');
const { fetchContent } = require('../utils/contentFetcher');
const router = express.Router();

// Original bookmark creation route remains unchanged
router.post('/', [
    protect,
    body('url').isURL().withMessage('Please provide a valid URL')
], async (req, res) => {
    // ... (keep existing implementation)
});

// @route   POST /api/bookmarks/bulk
// @desc    Bulk create/update/delete bookmarks
// @access  Private
router.post('/bulk', protect, async (req, res) => {
    try {
        const { action, bookmarkIds, data } = req.body;

        switch (action) {
            case 'move':
                // Move bookmarks to a folder
                await Bookmark.updateMany(
                    { _id: { $in: bookmarkIds }, user: req.user.id },
                    { $set: { folder: data.folderId || null } }
                );
                break;

            case 'tag':
                // Add tags to bookmarks
                await Bookmark.updateMany(
                    { _id: { $in: bookmarkIds }, user: req.user.id },
                    { $addToSet: { tags: { $each: data.tags } } }
                );
                break;

            case 'untag':
                // Remove tags from bookmarks
                await Bookmark.updateMany(
                    { _id: { $in: bookmarkIds }, user: req.user.id },
                    { $pullAll: { tags: data.tags } }
                );
                break;

            case 'delete':
                // Delete multiple bookmarks
                await Bookmark.deleteMany({
                    _id: { $in: bookmarkIds },
                    user: req.user.id
                });
                break;

            case 'favorite':
                // Toggle favorite status
                await Bookmark.updateMany(
                    { _id: { $in: bookmarkIds }, user: req.user.id },
                    { $set: { isFavorite: data.isFavorite } }
                );
                break;

            case 'category':
                // Update category
                await Bookmark.updateMany(
                    { _id: { $in: bookmarkIds }, user: req.user.id },
                    { $set: { category: data.category } }
                );
                break;

            default:
                return res.status(400).json({ message: 'Invalid bulk action' });
        }

        res.json({ message: 'Bulk operation completed successfully' });
    } catch (error) {
        console.error('Bulk operation failed:', error);
        res.status(500).json({ message: 'Failed to perform bulk operation' });
    }
});

// @route   GET /api/bookmarks/stats
// @desc    Get user's bookmark statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        // Get total bookmarks count
        const totalBookmarks = await Bookmark.countDocuments({ user: req.user.id });

        // Get unique tags count
        const bookmarks = await Bookmark.find({ user: req.user.id });
        const uniqueTags = new Set();
        bookmarks.forEach(bookmark => {
            if (bookmark.tags) {
                bookmark.tags.forEach(tag => uniqueTags.add(tag));
            }
        });
        const tagsCount = uniqueTags.size;

        res.json({
            totalBookmarks,
            tagsCount
        });
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Keep existing tags route
router.get('/tags', protect, async (req, res) => {
    // ... (keep existing implementation)
});

// Update the GET bookmarks route to support filtering by folder and favorites
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query based on filters
        const query = { user: req.user.id };

        // Filter by folder
        if ('folderId' in req.query) {
            query.folder = req.query.folderId || null; // null for root folder
        }

        // Filter by favorite
        if (req.query.favorite === 'true') {
            query.isFavorite = true;
        }

        // Filter by category
        if (req.query.category) {
            query.category = req.query.category;
        }

        const total = await Bookmark.countDocuments(query);
        const bookmarks = await Bookmark.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            data: bookmarks,
            total,
            page,
            limit,
            hasMore: total > skip + bookmarks.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update search route to include folder and favorite filters
router.get('/search', protect, async (req, res) => {
    try {
        const { tags, query, folderId, favorite, category } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build search query
        const searchQuery = { user: req.user.id };

        // Add folder filter
        if ('folderId' in req.query) {
            searchQuery.folder = folderId || null;
        }

        // Add favorite filter
        if (favorite === 'true') {
            searchQuery.isFavorite = true;
        }

        // Add category filter
        if (category) {
            searchQuery.category = category;
        }

        // Add tag filter
        if (tags && typeof tags === 'string') {
            const searchTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
            if (searchTags.length > 0) {
                searchQuery.tags = { $in: searchTags };
            }
        }

        // Add text search
        if (query && typeof query === 'string' && query.trim()) {
            searchQuery.$text = { $search: query.trim() };
        }

        const total = await Bookmark.countDocuments(searchQuery);
        let bookmarksQuery = Bookmark.find(searchQuery);

        // Add text score sorting if text search is being used
        if (query && typeof query === 'string' && query.trim()) {
            bookmarksQuery = bookmarksQuery
                .select({ score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } });
        } else {
            bookmarksQuery = bookmarksQuery.sort({ createdAt: -1 });
        }

        const bookmarks = await bookmarksQuery
            .skip(skip)
            .limit(limit);

        res.json({
            data: bookmarks,
            total,
            page,
            limit,
            hasMore: total > skip + bookmarks.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update bookmark route
router.put('/:id', protect, async (req, res) => {
    try {
        const bookmark = await Bookmark.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        const { folder, tags, isFavorite, category } = req.body;

        if (folder !== undefined) bookmark.folder = folder;
        if (tags !== undefined) bookmark.tags = tags;
        if (isFavorite !== undefined) bookmark.isFavorite = isFavorite;
        if (category !== undefined) bookmark.category = category;

        await bookmark.save();

        res.json(bookmark);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Keep existing delete route
router.delete('/:id', protect, async (req, res) => {
    // ... (keep existing implementation)
});

module.exports = router;
