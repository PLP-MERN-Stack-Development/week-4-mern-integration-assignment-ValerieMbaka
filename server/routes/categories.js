const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ name: 1 });
        
        res.json({
            success: true,
            count: categories.length,
            categories,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/categories/:idOrSlug
// @desc    Get a single category by ID or slug
// @access  Public
router.get('/:idOrSlug', async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        
        // Try to find by ID or slug
        const category = await Category.findOne({
            $or: [
                { _id: mongoose.Types.ObjectId.isValid(idOrSlug) ? idOrSlug : null },
                { slug: idOrSlug }
            ],
            isActive: true,
        });
        
        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }
        
        // Get posts in this category
        const posts = await Post.find({
                category: category._id,
                isPublished: true
            })
            .populate('author', 'name username profileImage')
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json({
            success: true,
            category,
            posts,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private (Admin only)
router.post(
    '/',
    [
        auth,
        [
            check('name', 'Category name is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to create categories' });
        }
        
        try {
            // Check if category already exists
            let category = await Category.findOne({ name: req.body.name });
            
            if (category) {
                return res.status(400).json({ success: false, error: 'Category already exists' });
            }
            
            // Create new category
            const newCategory = new Category({
                name: req.body.name,
                description: req.body.description,
                image: req.body.image,
                parentCategory: req.body.parentCategory || null,
            });
            
            // Save category
            category = await newCategory.save();
            
            res.status(201).json({ success: true, category });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, error: 'Server Error' });
        }
    }
);

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private (Admin only)
router.put(
    '/:id',
    [
        auth,
        [
            check('name', 'Category name is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to update categories' });
        }
        
        try {
            let category = await Category.findById(req.params.id);
            
            if (!category) {
                return res.status(404).json({ success: false, error: 'Category not found' });
            }
            
            // Update fields
            const {
                name,
                description,
                image,
                parentCategory,
                isActive,
            } = req.body;
            
            if (name) category.name = name;
            if (description) category.description = description;
            if (image) category.image = image;
            if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
            if (isActive !== undefined) category.isActive = isActive;
            
            // Save updated category
            await category.save();
            
            res.json({ success: true, category });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, error: 'Server Error' });
        }
    }
);

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Not authorized to delete categories' });
    }
    
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }
        
        // Check if category has posts
        const postCount = await Post.countDocuments({ category: category._id });
        
        if (postCount > 0) {
            return res.status(400).json({
                success: false,
                error: `Cannot delete category with ${postCount} posts. Reassign posts first.`,
            });
        }
        
        await category.remove();
        
        res.json({ success: true, message: 'Category removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
