import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePost } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { post, fetchPost, updatePost, categories, fetchCategories, loading } = usePost();
    const { user, isAdmin } = useAuth();
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        featuredImage: '',
        category: '',
        tags: '',
        isPublished: false,
    });
    
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    
    // Fetch post and categories on component mount
    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                fetchPost(id),
                fetchCategories(),
            ]);
            setIsLoaded(true);
        };
        
        loadData();
    }, [fetchPost, fetchCategories, id]);
    
    // Populate form when post is loaded
    useEffect(() => {
        if (post && isLoaded) {
            // Check if user is authorized to edit this post
            if (user._id !== post.author._id && !isAdmin) {
                navigate(`/posts/${post.slug}`);
                return;
            }
            
            setFormData({
                title: post.title || '',
                content: post.content || '',
                excerpt: post.excerpt || '',
                featuredImage: post.featuredImage || '',
                category: post.category._id || '',
                tags: post.tags ? post.tags.join(', ') : '',
                isPublished: post.isPublished || false,
            });
            
            // Set preview image if available
            if (post.featuredImage) {
                const imageUrl = post.featuredImage.startsWith('http')
                    ? post.featuredImage
                    : `/uploads/${post.featuredImage}`;
                setPreviewImage(imageUrl);
            }
        }
    }, [post, isLoaded, user, isAdmin, navigate]);
    
    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        
        // Clear error for this field
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
    };
    
    // Handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Here you would typically upload the file to your server
            // For now, we'll just set a preview and pretend it's uploaded
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setFormData({
                    ...formData,
                    featuredImage: file.name, // In a real app, this would be the URL returned from the server
                });
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Handle tags input
    const handleTagsChange = (e) => {
        setFormData({
            ...formData,
            tags: e.target.value,
        });
    };
    
    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        
        if (!formData.content.trim()) {
            newErrors.content = 'Content is required';
        }
        
        if (!formData.category) {
            newErrors.category = 'Category is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Process tags from comma-separated string to array
            const tagsArray = formData.tags
                ? formData.tags.split(',').map(tag => tag.trim())
                : [];
            
            // Update post
            const response = await updatePost(id, {
                ...formData,
                tags: tagsArray,
            });
            
            // Redirect to the updated post
            navigate(`/posts/${response.post.slug}`);
        } catch (err) {
            console.error('Failed to update post:', err);
            
            // Set form errors if they came from the server
            if (err.response?.data?.errors) {
                const serverErrors = {};
                err.response.data.errors.forEach(error => {
                    serverErrors[error.param] = error.msg;
                });
                setErrors(serverErrors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // If post is still loading, show loading indicator
    if (loading || !isLoaded) {
        return <div className="loading">Loading post...</div>;
    }
    
    // If post not found, show error
    if (!post) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>Post not found</p>
                <button onClick={() => navigate('/posts')} className="btn btn-primary">
                    Back to Posts
                </button>
            </div>
        );
    }
    
    return (
        <div className="edit-post-page">
            <div className="container">
                <h1>Edit Post</h1>
                
                <form className="post-form" onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={errors.title ? 'error' : ''}
                            placeholder="Enter post title"
                        />
                        {errors.title && <div className="error-message">{errors.title}</div>}
                    </div>
                    
                    {/* Content */}
                    <div className="form-group">
                        <label htmlFor="content">Content *</label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            className={errors.content ? 'error' : ''}
                            placeholder="Write your post content here..."
                            rows="10"
                        />
                        {errors.content && <div className="error-message">{errors.content}</div>}
                    </div>
                    
                    {/* Excerpt */}
                    <div className="form-group">
                        <label htmlFor="excerpt">Excerpt</label>
                        <textarea
                            id="excerpt"
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            placeholder="Brief summary of your post (optional)"
                            rows="3"
                        />
                        <small>If left empty, an excerpt will be generated from your content.</small>
                    </div>
                    
                    {/* Featured Image */}
                    <div className="form-group">
                        <label htmlFor="featuredImage">Featured Image</label>
                        <input
                            type="file"
                            id="featuredImage"
                            name="featuredImage"
                            onChange={handleImageChange}
                            accept="image/*"
                        />
                        {previewImage && (
                            <div className="image-preview">
                                <img src={previewImage} alt="Preview" />
                            </div>
                        )}
                    </div>
                    
                    {/* Category */}
                    <div className="form-group">
                        <label htmlFor="category">Category *</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={errors.category ? 'error' : ''}
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.category && <div className="error-message">{errors.category}</div>}
                    </div>
                    
                    {/* Tags */}
                    <div className="form-group">
                        <label htmlFor="tags">Tags</label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleTagsChange}
                            placeholder="Enter tags separated by commas"
                        />
                        <small>Example: technology, programming, web development</small>
                    </div>
                    
                    {/* Publish Status */}
                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="isPublished"
                                checked={formData.isPublished}
                                onChange={handleChange}
                            />
                            Published
                        </label>
                        <small>Uncheck to save as a draft.</small>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate(`/posts/${post.slug}`)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting || loading}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPost;