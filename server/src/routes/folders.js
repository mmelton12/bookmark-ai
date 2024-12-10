const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Folder = require('../models/Folder');
const Bookmark = require('../models/Bookmark');
const router = express.Router();

// @route   POST /api/folders
// @desc    Create a new folder
// @access  Private
router.post('/', [
    protect,
    body('name').trim().notEmpty().withMessage('Folder name is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, parent, color, icon } = req.body;

        const folder = await Folder.create({
            name,
            description,
            parent,
            color,
            icon,
            user: req.user.id
        });

        res.status(201).json(folder);
    } catch (error) {
        console.error('Folder creation failed:', error);
        res.status(500).json({ message: 'Failed to create folder' });
    }
});

// @route   GET /api/folders
// @desc    Get all folders for a user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const folders = await Folder.find({ user: req.user.id })
            .populate('subfolders')
            .populate('bookmarks');

        // Organize folders into a tree structure
        const rootFolders = folders.filter(folder => !folder.parent);
        const folderMap = new Map(folders.map(folder => [folder._id.toString(), folder]));

        const buildTree = (folder) => {
            const folderObj = folder.toObject();
            folderObj.subfolders = folders
                .filter(f => f.parent?.toString() === folder._id.toString())
                .map(buildTree);
            return folderObj;
        };

        const folderTree = rootFolders.map(buildTree);

        res.json(folderTree);
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({ message: 'Failed to fetch folders' });
    }
});

// @route   PUT /api/folders/:id
// @desc    Update a folder
// @access  Private
router.put('/:id', [
    protect,
    body('name').trim().notEmpty().withMessage('Folder name is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const folder = await Folder.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        const { name, description, parent, color, icon } = req.body;

        // Prevent circular reference
        if (parent && parent.toString() === folder._id.toString()) {
            return res.status(400).json({ message: 'Folder cannot be its own parent' });
        }

        folder.name = name;
        folder.description = description;
        folder.parent = parent;
        folder.color = color;
        folder.icon = icon;

        await folder.save();

        res.json(folder);
    } catch (error) {
        console.error('Folder update failed:', error);
        res.status(500).json({ message: 'Failed to update folder' });
    }
});

// @route   DELETE /api/folders/:id
// @desc    Delete a folder
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const folder = await Folder.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // Move all bookmarks in this folder to root (null folder)
        await Bookmark.updateMany(
            { folder: folder._id },
            { $set: { folder: null } }
        );

        // Move all subfolders to root
        await Folder.updateMany(
            { parent: folder._id },
            { $set: { parent: null } }
        );

        await folder.deleteOne();

        res.json({ message: 'Folder removed' });
    } catch (error) {
        console.error('Folder deletion failed:', error);
        res.status(500).json({ message: 'Failed to delete folder' });
    }
});

module.exports = router;
