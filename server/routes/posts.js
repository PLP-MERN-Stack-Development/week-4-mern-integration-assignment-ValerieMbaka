const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// @route   GET /api/posts
// @desc    Get all posts with pagination and filtering
// @access  Public
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build query
        const query = { isPublished: true };
        
        // Add category filter if provided
        if (req.query.category) {
            query.category = req.query.category;
        }
        
        // Execute query with pagination
        const posts = await Post.find(query)
            .populate('author', 'name username profileImage')
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        // Get total count for pagination
        const total = await Post.countDocuments(query);
        
        res.json({
            success: true,
            count: posts.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            posts,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/posts/:idOrSlug
// @desc    Get a single post by ID or slug
// @access  Public
router.get('/:idOrSlug', async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        
        // Try to find by ID or slug
        const post = await Post.findOne({
                $or: [
                    { _id: mongoose.Types.ObjectId.isValid(idOrSlug) ? idOrSlug : null },
                    { slug: idOrSlug }
                ]
            })
            .populate('author', 'name username profileImage')
            .populate('category', 'name slug')
            .populate('comments.user', 'name username profileImage');
        
        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        
        // Increment view count
        await post.incrementViewCount();
        
        res.json({ success: true, post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post(
    '/',
    [
        auth,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('content', 'Content is required').not().isEmpty(),
            check('category', 'Category is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        try {
            // Create new post
            const newPost = new Post({
                title: req.body.title,
                content: req.body.content,
                excerpt: req.body.excerpt,
                featuredImage: req.body.featuredImage,
                category: req.body.category,
                tags: req.body.tags,
                isPublished: req.body.isPublished || false,
                author: req.user.id,
            });
            
            // Save post
            const post = await newPost.save();
            
            res.status(201).json({ success: true, post });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, error: 'Server Error' });
        }
    }
);

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        
        // Check if user is the author or an admin
        if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to update this post' });
        }
        
        // Update fields
        const {
            title,
            content,
            excerpt,
            featuredImage,
            category,
            tags,
            isPublished,
        } = req.body;
        
        if (title) post.title = title;
        if (content) post.content = content;
        if (excerpt) post.excerpt = excerpt;
        if (featuredImage) post.featuredImage = featuredImage;
        if (category) post.category = category;
        if (tags) post.tags = tags;
        if (isPublished !== undefined) post.isPublished = isPublished;
        
        // Save updated post
        await post.save();
        
        res.json({ success: true, post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        
        // Check if user is the author or an admin
        if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this post' });
        }
        
        await post.remove();
        
        res.json({ success: true, message: 'Post removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/posts/:id/comments
// @desc    Add a comment to a post
// @access  Private
router.post(
    '/:id/comments',
    [
        auth,
        [check('content', 'Comment content is required').not().isEmpty()],
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        try {
            const post = await Post.findById(req.params.id);
            
            if (!post) {
                return res.status(404).json({ success: false, error: 'Post not found' });
            }
            
            // Add comment
            await post.addComment(req.user.id, req.body.content);
            
            // Get updated post with populated comments
            const updatedPost = await Post.findById(req.params.id)
                .populate('comments.user', 'name username profileImage');
            
            res.json({ success: true, post: updatedPost });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, error: 'Server Error' });
        }
    }
);

// @route   GET /api/posts/search
// @desc    Search posts
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.q;
        
        if (!searchQuery) {
            return res.status(400).json({ success: false, error: 'Search query is required' });
        }
        
        // Search in title, content, and tags
        const posts = await Post.find({
                isPublished: true,
                $or: [
                    { title: { $regex: searchQuery, $options: 'i' } },
                    { content: { $regex: searchQuery, $options: 'i' } },
                    { tags: { $in: [new RegExp(searchQuery, 'i')] } },
                ],
            })
            .populate('author', 'name username profileImage')
            .populate('category', 'name slug')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: posts.length,
            posts,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
