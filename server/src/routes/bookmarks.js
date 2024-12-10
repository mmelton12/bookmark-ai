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
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { url } = req.body;
        console.log('Creating bookmark for URL:', url);

        // Get user's OpenAI API key
        const user = await User.findById(req.user.id).select('+openAiKey');
        const userApiKey = user?.openAiKey;

        try {
            // Fetch content from URL
            const { title, content, description } = await fetchContent(url);
            console.log('Content fetched successfully. Title:', title);

            try {
                // Analyze content using OpenAI with user's API key
                console.log('Sending content to OpenAI for analysis...');
                const { summary, tags } = await analyzeContent(url, content, userApiKey);
                console.log('OpenAI analysis complete. Tags:', tags);

                // Create bookmark with aiSummary field
                const bookmark = await Bookmark.create({
                    url,
                    title: title || url,
                    description: description || '',
                    aiSummary: summary || 'No summary available',
                    tags: Array.isArray(tags) ? tags : ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
                    user: req.user.id
                });

                console.log('Bookmark created successfully:', bookmark._id);
                res.status(201).json(bookmark);
            } catch (aiError) {
                console.error('OpenAI analysis failed:', aiError);
                console.error('Error details:', {
                    message: aiError.message,
                    response: aiError.response?.data,
                    status: aiError.response?.status
                });

                let warning = 'AI analysis partially failed. The bookmark was saved with limited analysis.';
                if (!userApiKey) {
                    warning = 'No OpenAI API key provided. Please add your API key in account settings.';
                }

                // Even if analysis fails, we should have received fallback tags from the service
                const { summary = 'AI analysis failed. Please try again later.', tags = ['error', 'failed', 'retry', 'tag4', 'tag5'] } = aiError.result || {};

                // Create bookmark with minimal data if AI analysis fails
                const bookmark = await Bookmark.create({
                    url,
                    title: title || url,
                    description: description || '',
                    aiSummary: summary,
                    tags: tags,
                    user: req.user.id,
                    warning
                });

                res.status(201).json({
                    ...bookmark.toObject(),
                    warning
                });
            }
        } catch (fetchError) {
            console.error('Content fetching failed:', fetchError);
            
            // Create bookmark with just the URL if content fetching fails
            const bookmark = await Bookmark.create({
                url,
                title: url,
                description: '',
                aiSummary: fetchError.message || 'Failed to fetch content. Please check the URL and try again.',
                tags: ['error', 'fetch-failed', 'invalid-url', 'tag4', 'tag5'],
                user: req.user.id
            });

            res.status(201).json({
                ...bookmark.toObject(),
                warning: 'Content fetching failed. The bookmark was saved but without content analysis.'
            });
        }
    } catch (error) {
        console.error('Bookmark creation failed:', error);
        res.status(500).json({
            message: error.message || 'Failed to create bookmark'
        });
    }
});

// @route   GET /api/bookmarks/tags
// @desc    Get all tags with their counts
// @access  Private
router.get('/tags', protect, async (req, res) => {
    try {
        // Aggregate to get tags and their counts
        const tagCounts = await Bookmark.aggregate([
            // Match documents for the current user
            { $match: { user: req.user._id } },
            // Unwind the tags array to create a document for each tag
            { $unwind: '$tags' },
            // Group by tag and count occurrences
            { 
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 }
                }
            },
            // Format the output
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    count: 1
                }
            },
            // Sort by count in descending order
            { $sort: { count: -1 } }
        ]);

        res.json(tagCounts);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({
            message: 'Failed to fetch tags'
        });
    }
});

// @route   GET /api/bookmarks
// @desc    Get all bookmarks for a user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Bookmark.countDocuments({ user: req.user.id });
        const bookmarks = await Bookmark.find({ user: req.user.id })
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
        res.status(500).json({
            message: 'Server error'
        });
    }
});

// @route   GET /api/bookmarks/search
// @desc    Search bookmarks by tags and text
// @access  Private
router.get('/search', protect, async (req, res) => {
    try {
        const { tags, query } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build search query
        const searchQuery = { user: req.user.id };

        // Add tag filter if provided
        if (tags && typeof tags === 'string') {
            const searchTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
            if (searchTags.length > 0) {
                searchQuery.tags = { $in: searchTags };
            }
        }

        // Add text search if provided
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
        res.status(500).json({
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/bookmarks/:id
// @desc    Delete a bookmark
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const bookmark = await Bookmark.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!bookmark) {
            return res.status(404).json({
                message: 'Bookmark not found'
            });
        }

        await bookmark.deleteOne();

        res.json({ message: 'Bookmark removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server error'
        });
    }
});

module.exports = router;
