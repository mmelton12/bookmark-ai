const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// @route   GET /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.get('/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        session: false 
    })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
    passport.authenticate('google', { 
        session: false,
        failureRedirect: '/login'
    }),
    (req, res) => {
        try {
            const token = req.user.getSignedJwtToken();
            const userData = {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                picture: req.user.picture,
                createdAt: req.user.createdAt
            };

            // Redirect to frontend with token and user data
            res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication failed`);
        }
    }
);

// @route   POST /api/auth/signup
// @desc    Register a user
// @access  Public
router.post('/signup', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        // Create user
        user = await User.create({
            email,
            password
        });

        // Create token
        const token = user.getSignedJwtToken();

        // Return user data without password
        const userData = {
            id: user._id,
            email: user.email,
            createdAt: user.createdAt
        };

        res.status(201).json({
            token,
            user: userData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server error'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').exists().withMessage('Password is required')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Create token
        const token = user.getSignedJwtToken();

        // Return user data without password
        const userData = {
            id: user._id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            createdAt: user.createdAt
        };

        res.json({
            token,
            user: userData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server error'
        });
    }
});

module.exports = router;
