import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { postService, categoryService } from '../services/api';

// Create context
const PostContext = createContext();

// Custom hook to use the post context
export const usePost = () => {
    return useContext(PostContext);
};

// Provider component
export const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [post, setPost] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0,
    });
    
    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);
    
    // Fetch all posts
    const fetchPosts = async (page = 1, limit = 10, category = null) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await postService.getAllPosts(page, limit, category);
            setPosts(response.posts);
            setPagination({
                currentPage: response.currentPage,
                totalPages: response.totalPages,
                total: response.total,
            });
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to fetch posts';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch a single post
    const fetchPost = async (idOrSlug) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await postService.getPost(idOrSlug);
            setPost(response.post);
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to fetch post';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // Create a new post
    const createPost = async (postData) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await postService.createPost(postData);
            setPosts([response.post, ...posts]);
            toast.success('Post created successfully!');
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to create post';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    // Update a post
    const updatePost = async (id, postData) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await postService.updatePost(id, postData);
            
            // Update posts array
            setPosts(posts.map(p => p._id === id ? response.post : p));
            
            // Update current post if it's the one being edited
            if (post && post._id === id) {
                setPost(response.post);
            }
            
            toast.success('Post updated successfully!');
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to update post';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    // Delete a post
    const deletePost = async (id) => {
        setLoading(true);
        setError(null);
        
        try {
            await postService.deletePost(id);
            
            // Remove post from posts array
            setPosts(posts.filter(p => p._id !== id));
            
            // Clear current post if it's the one being deleted
            if (post && post._id === id) {
                setPost(null);
            }
            
            toast.success('Post deleted successfully!');
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to delete post';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    // Add a comment to a post
    const addComment = async (postId, commentData) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await postService.addComment(postId, commentData);
            
            // Update current post with new comment
            if (post && post._id === postId) {
                setPost(response.post);
            }
            
            toast.success('Comment added successfully!');
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to add comment';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    // Search posts
    const searchPosts = async (query) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await postService.searchPosts(query);
            setPosts(response.posts);
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Search failed';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch all categories
    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAllCategories();
            setCategories(response.categories);
            return response;
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };
    
    // Context value
    const contextValue = {
        posts,
        post,
        categories,
        loading,
        error,
        pagination,
        fetchPosts,
        fetchPost,
        createPost,
        updatePost,
        deletePost,
        addComment,
        searchPosts,
        fetchCategories,
    };
    
    return (
        <PostContext.Provider value={contextValue}>
            {children}
        </PostContext.Provider>
    );
};

export default PostContext;