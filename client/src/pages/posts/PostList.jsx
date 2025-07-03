import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePost } from '../../context/PostContext';

const PostList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { posts, fetchPosts, categories, loading, pagination } = usePost();
    
    // Get query parameters
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    const searchParam = queryParams.get('search');
    const pageParam = parseInt(queryParams.get('page')) || 1;
    
    // Local state for filters
    const [selectedCategory, setSelectedCategory] = useState(categoryParam || '');
    const [currentPage, setCurrentPage] = useState(pageParam);
    
    // Fetch posts when component mounts or filters change
    useEffect(() => {
        if (searchParam) {
            // If search parameter exists, use search API
            fetchPosts(currentPage, 10, selectedCategory);
        } else {
            // Otherwise fetch posts with optional category filter
            fetchPosts(currentPage, 10, selectedCategory);
        }
    }, [fetchPosts, currentPage, selectedCategory, searchParam]);
    
    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        
        if (selectedCategory) {
            params.set('category', selectedCategory);
        }
        
        if (searchParam) {
            params.set('search', searchParam);
        }
        
        if (currentPage > 1) {
            params.set('page', currentPage.toString());
        }
        
        navigate({
            pathname: location.pathname,
            search: params.toString() ? `?${params.toString()}` : '',
        }, { replace: true });
    }, [navigate, location.pathname, selectedCategory, currentPage, searchParam]);
    
    // Handle category filter change
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1); // Reset to first page when changing category
    };
    
    // Handle pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0); // Scroll to top when changing page
    };
    
    return (
        <div className="post-list-page">
            <div className="container">
                <div className="page-header">
                    <h1>{searchParam ? `Search Results: ${searchParam}` : 'All Blog Posts'}</h1>
                    <div className="filter-controls">
                        <div className="category-filter">
                            <label htmlFor="category-select">Filter by Category:</label>
                            <select
                                id="category-select"
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                
                {loading ? (
                    <div className="loading">Loading posts...</div>
                ) : (
                    <>
                        {posts.length > 0 ? (
                            <div className="posts-container">
                                {posts.map((post) => (
                                    <div className="post-item" key={post._id}>
                                        <div className="post-image">
                                            <Link to={`/posts/${post.slug}`}>
                                                <img
                                                    src={post.featuredImage.startsWith('http')
                                                        ? post.featuredImage
                                                        : `/uploads/${post.featuredImage}`}
                                                    alt={post.title}
                                                />
                                            </Link>
                                        </div>
                                        <div className="post-details">
                                            <h2>
                                                <Link to={`/posts/${post.slug}`}>{post.title}</Link>
                                            </h2>
                                            <div className="post-meta">
                                                <span className="post-author">By {post.author.name}</span>
                                                <span className="post-date">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                                                <span className="post-category">
                          In <Link to={`/posts?category=${post.category._id}`}>{post.category.name}</Link>
                        </span>
                                            </div>
                                            <p className="post-excerpt">{post.excerpt || post.content.substring(0, 200)}...</p>
                                            <div className="post-footer">
                                                <Link to={`/posts/${post.slug}`} className="read-more">
                                                    Read More
                                                </Link>
                                                <div className="post-stats">
                                                    <span className="views-count">{post.viewCount} views</span>
                                                    <span className="comments-count">{post.comments.length} comments</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-posts">
                                <p>No posts found. {!searchParam && 'Be the first to create a post!'}</p>
                                {!searchParam && (
                                    <Link to="/posts/create" className="btn btn-primary">
                                        Create Post
                                    </Link>
                                )}
                            </div>
                        )}
                        
                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="pagination-prev"
                                >
                                    Previous
                                </button>
                                
                                <div className="pagination-numbers">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="pagination-next"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PostList;