const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Bookmark = require('../models/Bookmark');
const User = require('../models/User');
const { analyzeContent } = require('../services/openai');
const { fetchContent } = require('../utils/contentFetcher');
const router = express.Router();

// @route   POST /api/bookmarks
// @desc    Create a new bookmark
// @access  Private
router.post('/', [
    protect,
    body('url').isURL().withMessage('Please provide a valid URL')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { url } = req.body;

        // Check for existing bookmark with same URL for this user
        const existingBookmark = await Bookmark.findOne({ 
            url: url,
            user: req.user.id 
        });

        if (existingBookmark) {
            return res.status(400).json({
                message: 'This URL has already been bookmarked'
            });
        }

        // Get user with OpenAI key
        const user = await User.findById(req.user.id).select('+openAiKey');
        if (!user.openAiKey) {
            return res.status(400).json({
                message: 'OpenAI API key is required. Please add it in your account settings.'
            });
        }

        // Fetch content from URL
        const { title, content, description } = await fetchContent(url);

        // Generate AI summary and tags
        const { summary, tags } = await analyzeContent(url, content, user.openAiKey);

        // Create bookmark
        const bookmark = await Bookmark.create({
            url,
            title,
            description,
            aiSummary: summary,
            tags,
            user: req.user.id
        });

        res.status(201).json(bookmark);
    } catch (error) {
        console.error('Error creating bookmark:', error);
        res.status(500).json({
            message: error.message || 'Failed to create bookmark'
        });
    }
});

// Bulk operations route
router.post('/bulk', protect, async (req, res) => {
    try {
        const { action, bookmarkIds, data } = req.body;

        switch (action) {
            case 'move':
                await Bookmark.updateMany(
                    { _id: { $in: bookmarkIds }, user: req.user.id },
                    { $set: { folder: data.folderId || null } }
                );
                break;

            case 'tag':
                await Bookmark.updateMany(
                    { _id: { $in: bookmarkIds }, user: req.user.id },
                    { $addToSet: { tags: { $each: data.tags } } }
                );
                break;

            case 'untag':
                await Bookmark.updateMany(
                    { _id: { $in: bookmarkIds }, user: req.user.id },
                    { $pullAll: { tags: data.tags } }
                );
                break;

            case 'delete':
                await Bookmark.deleteMany({
                    _id: { $in: bookmarkIds },
                    user: req.user.id
                });
                break;

            case 'favorite':
                await Bookmark.updateMany(
                    { _id: { $in: bookmarkIds }, user: req.user.id },
                    { $set: { isFavorite: data.isFavorite } }
                );
                break;

            case 'category':
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

// Stats route
router.get('/stats', protect, async (req, res) => {
    try {
        const totalBookmarks = await Bookmark.countDocuments({ user: req.user.id });
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

// Tags route
router.get('/tags', protect, async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ user: req.user.id });
        const tagCounts = {};
        
        bookmarks.forEach(bookmark => {
            if (bookmark.tags) {
                bookmark.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        const tags = Object.entries(tagCounts).map(([name, count]) => ({
            name,
            count
        })).sort((a, b) => b.count - a.count);

        res.json(tags);
    } catch (error) {
        console.error('Failed to fetch tags:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get bookmarks route
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { user: req.user.id };

        if ('folderId' in req.query) {
            query.folder = req.query.folderId || null;
        }

        if (req.query.favorite === 'true') {
            query.isFavorite = true;
        }

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

// Search route
router.get('/search', protect, async (req, res) => {
    try {
        const { tags, query, folderId, favorite, category } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const searchQuery = { user: req.user.id };

        if ('folderId' in req.query) {
            searchQuery.folder = folderId || null;
        }

        if (favorite === 'true') {
            searchQuery.isFavorite = true;
        }

        if (category) {
            searchQuery.category = category;
        }

        if (tags && typeof tags === 'string') {
            const searchTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
            if (searchTags.length > 0) {
                searchQuery.tags = { $in: searchTags };
            }
        }

        if (query && typeof query === 'string' && query.trim()) {
            searchQuery.$text = { $search: query.trim() };
        }

        const total = await Bookmark.countDocuments(searchQuery);
        let bookmarksQuery = Bookmark.find(searchQuery);

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

// Delete bookmark route
router.delete('/:id', protect, async (req, res) => {
    try {
        const bookmark = await Bookmark.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        await bookmark.remove();
        res.json({ message: 'Bookmark removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
