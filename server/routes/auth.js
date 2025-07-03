const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
    '/register',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('username', 'Username must be between 3 and 20 characters').isLength({ min: 3, max: 20 }),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
        check('name', 'Name is required').not().isEmpty(),
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        const { username, email, password, name, bio } = req.body;
        
        try {
            // Check if user already exists
            let user = await User.findOne({ $or: [{ email }, { username }] });
            
            if (user) {
                return res.status(400).json({
                    success: false,
                    error: 'User already exists with that email or username',
                });
            }
            
            // Create new user
            user = new User({
                username,
                email,
                password,
                name,
                bio,
            });
            
            // Save user to database
            await user.save();
            
            // Generate JWT token
            const token = user.generateAuthToken();
            
            // Return user data and token
            res.status(201).json({
                success: true,
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    profileImage: user.profileImage,
                },
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, error: 'Server Error' });
        }
    }
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        const { email, password } = req.body;
        
        try {
            // Find user by email
            const user = await User.findOne({ email }).select('+password');
            
            if (!user) {
                return res.status(400).json({ success: false, error: 'Invalid credentials' });
            }
            
            // Check if user is active
            if (!user.isActive) {
                return res.status(401).json({ success: false, error: 'Account is deactivated' });
            }
            
            // Check if password matches
            const isMatch = await user.matchPassword(password);
            
            if (!isMatch) {
                return res.status(400).json({ success: false, error: 'Invalid credentials' });
            }
            
            // Generate JWT token
            const token = user.generateAuthToken();
            
            // Return user data and token
            res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    profileImage: user.profileImage,
                },
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, error: 'Server Error' });
        }
    }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // User is already available in req.user from auth middleware
        res.json({
            success: true,
            user: req.user,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
    '/profile',
    [
        auth,
        [
            check('name', 'Name is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        try {
            const user = await User.findById(req.user.id);
            
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            
            // Update fields
            const { name, bio, profileImage } = req.body;
            
            if (name) user.name = name;
            if (bio !== undefined) user.bio = bio;
            if (profileImage) user.profileImage = profileImage;
            
            // Save updated user
            await user.save();
            
            res.json({
                success: true,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    bio: user.bio,
                    role: user.role,
                    profileImage: user.profileImage,
                },
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, error: 'Server Error' });
        }
    }
);

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put(
    '/password',
    [
        auth,
        [
            check('currentPassword', 'Current password is required').not().isEmpty(),
            check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
        ],
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        try {
            const { currentPassword, newPassword } = req.body;
            
            // Get user with password
            const user = await User.findById(req.user.id).select('+password');
            
            // Check if current password matches
            const isMatch = await user.matchPassword(currentPassword);
            
            if (!isMatch) {
                return res.status(400).json({ success: false, error: 'Current password is incorrect' });
            }
            
            // Set new password
            user.password = newPassword;
            
            // Save user with new password
            await user.save();
            
            res.json({ success: true, message: 'Password updated successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, error: 'Server Error' });
        }
    }
);

module.exports = router;