import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePost } from '../context/PostContext';

const Home = () => {
    const { posts, fetchPosts, categories, loading } = usePost();
    
    useEffect(() => {
        // Fetch latest posts on component mount
        fetchPosts(1, 6);
    }, [fetchPosts]);
    
    return (
        <div className="home-page">
            <section className="hero">
                <div className="container">
                    <h1>Welcome to MERN Blog</h1>
                    <p>A full-stack blog application built with MongoDB, Express, React, and Node.js</p>
                    <div className="hero-buttons">
                        <Link to="/posts" className="btn btn-primary">
                            Browse Posts
                        </Link>
                        <Link to="/register" className="btn btn-secondary">
                            Join Now
                        </Link>
                    </div>
                </div>
            </section>
            
            <section className="featured-posts">
                <div className="container">
                    <h2>Latest Posts</h2>
                    
                    {loading ? (
                        <div className="loading">Loading posts...</div>
                    ) : (
                        <div className="post-grid">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <div className="post-card" key={post._id}>
                                        <div className="post-image">
                                            <img
                                                src={post.featuredImage.startsWith('http')
                                                    ? post.featuredImage
                                                    : `/uploads/${post.featuredImage}`}
                                                alt={post.title}
                                            />
                                        </div>
                                        <div className="post-content">
                                            <h3>
                                                <Link to={`/posts/${post.slug}`}>{post.title}</Link>
                                            </h3>
                                            <p className="post-excerpt">{post.excerpt || post.content.substring(0, 150)}...</p>
                                            <div className="post-meta">
                                                <span className="post-author">By {post.author.name}</span>
                                                <span className="post-date">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                                            </div>
                                            <Link to={`/posts/${post.slug}`} className="read-more">
                                                Read More
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No posts found. Be the first to create a post!</p>
                            )}
                        </div>
                    )}
                    
                    <div className="view-all">
                        <Link to="/posts" className="btn btn-outline">
                            View All Posts
                        </Link>
                    </div>
                </div>
            </section>
            
            <section className="categories-section">
                <div className="container">
                    <h2>Browse by Category</h2>
                    <div className="categories-grid">
                        {categories.map((category) => (
                            <Link
                                to={`/posts?category=${category._id}`}
                                className="category-card"
                                key={category._id}
                            >
                                <div className="category-image">
                                    <img
                                        src={category.image.startsWith('http')
                                            ? category.image
                                            : `/uploads/${category.image}`}
                                        alt={category.name}
                                    />
                                </div>
                                <h3>{category.name}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
            
            <section className="cta-section">
                <div className="container">
                    <h2>Ready to share your story?</h2>
                    <p>Join our community and start writing your own blog posts today.</p>
                    <Link to="/register" className="btn btn-primary">
                        Get Started
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;