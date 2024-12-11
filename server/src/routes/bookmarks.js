const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Bookmark = require('../models/Bookmark');
const User = require('../models/User');
const { analyzeContent } = require('../services/openai');
const { fetchContent } = require('../utils/contentFetcher');
const { processTags } = require('../utils/tagNormalizer');
const router = express.Router();

// @route   POST /api/bookmarks
// @desc    Create a new bookmark
// @access  Private
router.post('/', [
    protect,
    body('url').isURL().withMessage('Please provide a valid URL')
], async (req, res) => {
    try {
        console.log('Starting bookmark creation process...');
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { url } = req.body;
        console.log('Creating bookmark for URL:', url);

        // Check for existing bookmark with same URL for this user
        const existingBookmark = await Bookmark.findOne({ 
            url: url,
            user: req.user.id 
        });

        if (existingBookmark) {
            console.log('Bookmark already exists for URL:', url);
            return res.status(400).json({
                message: 'This URL has already been bookmarked'
            });
        }

        // Get user with OpenAI key
        console.log('Fetching user OpenAI key...');
        const user = await User.findById(req.user.id).select('+openAiKey');
        if (!user.openAiKey) {
            console.log('No OpenAI key found for user');
            return res.status(400).json({
                message: 'OpenAI API key is required. Please add it in your account settings.'
            });
        }

        // Fetch content from URL
        console.log('Fetching content from URL...');
        let fetchedContent;
        try {
            fetchedContent = await fetchContent(url);
            console.log('Content fetched successfully:', {
                titleLength: fetchedContent.title.length,
                contentLength: fetchedContent.content.length
            });
        } catch (error) {
            console.error('Error fetching content:', error);
            return res.status(400).json({
                message: error.message || 'Failed to fetch content from URL'
            });
        }

        // Generate AI summary, tags, and determine category
        console.log('Analyzing content with OpenAI...');
        let analysisResult;
        try {
            analysisResult = await analyzeContent(url, fetchedContent.content, user.openAiKey);
            console.log('Content analysis complete:', {
                summaryLength: analysisResult.summary.length,
                tagsCount: analysisResult.tags.length,
                category: analysisResult.category,
                tags: analysisResult.tags
            });
        } catch (error) {
            console.error('Error analyzing content:', error);
            return res.status(500).json({
                message: 'Failed to analyze content'
            });
        }

        // Get all existing tags for the user
        const existingBookmarks = await Bookmark.find({ user: req.user.id });
        const existingTags = Array.from(new Set(
            existingBookmarks.flatMap(bookmark => bookmark.tags || [])
        ));

        // Process and normalize tags
        const normalizedTags = processTags(analysisResult.tags, existingTags);
        console.log('Normalized tags:', normalizedTags);

        // Create bookmark
        console.log('Creating bookmark in database with normalized tags:', normalizedTags);
        try {
            const bookmark = await Bookmark.create({
                url,
                title: fetchedContent.title,
                description: fetchedContent.description,
                aiSummary: analysisResult.summary,
                tags: normalizedTags,
                category: analysisResult.category,
                user: req.user.id
            });

            console.log('Bookmark created successfully:', {
                id: bookmark._id,
                title: bookmark.title,
                tags: bookmark.tags,
                category: bookmark.category
            });
            res.status(201).json(bookmark);
        } catch (error) {
            console.error('Error saving bookmark:', error);
            return res.status(500).json({
                message: 'Failed to save bookmark'
            });
        }
    } catch (error) {
        console.error('Unexpected error in bookmark creation:', error);
        res.status(500).json({
            message: error.message || 'Failed to create bookmark'
        });
    }
});

// Bulk operations route
router.post('/bulk', protect, async (req, res) => {
    try {
        const { action, bookmarkIds, data } = req.body;

        // Get all existing tags for the user before bulk operations
        const existingBookmarks = await Bookmark.find({ user: req.user.id });
        const existingTags = Array.from(new Set(
            existingBookmarks.flatMap(bookmark => bookmark.tags || [])
        ));

        switch (action) {
            case 'move':
                await Bookmark.updateMany(
                    { _id: { $in: bookmarkIds }, user: req.user.id },
                    { $set: { folder: data.folderId || null } }
                );
                break;

            case 'tag':
                // Normalize new tags before adding
                const normalizedNewTags = processTags(data.tags, existingTags);
                await Bookmark.updateMany(
                    { _id: { $in: bookmarkIds }, user: req.user.id },
                    { $addToSet: { tags: { $each: normalizedNewTags } } }
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
        if (tags !== undefined) {
            // Get all existing tags for the user
            const existingBookmarks = await Bookmark.find({ user: req.user.id });
            const existingTags = Array.from(new Set(
                existingBookmarks.flatMap(b => b.tags || [])
            ));
            // Process and normalize new tags
            bookmark.tags = processTags(tags, existingTags);
        }
        if (isFavorite !== undefined) bookmark.isFavorite = isFavorite;
        if (category !== undefined) bookmark.category = category;

        await bookmark.save();

        res.json(bookmark);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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

// Delete bookmark route
router.delete('/:id', protect, async (req, res) => {
    try {
        const bookmark = await Bookmark.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        res.json({ message: 'Bookmark removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
