import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePost } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';

const PostDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { post, fetchPost, addComment, deletePost, loading, error } = usePost();
    const { user, isAuthenticated } = useAuth();
    const [commentContent, setCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Fetch post when component mounts or slug changes
    useEffect(() => {
        fetchPost(slug);
    }, [fetchPost, slug]);
    
    // Handle comment submission
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
        if (!commentContent.trim()) return;
        
        setIsSubmitting(true);
        
        try {
            await addComment(post._id, { content: commentContent });
            setCommentContent(''); // Clear comment input
        } catch (err) {
            console.error('Failed to add comment:', err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Handle post deletion
    const handleDeletePost = async () => {
        if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            try {
                await deletePost(post._id);
                navigate('/posts');
            } catch (err) {
                console.error('Failed to delete post:', err);
            }
        }
    };
    
    // If loading, show loading indicator
    if (loading) {
        return <div className="loading">Loading post...</div>;
    }
    
    // If error or no post found, show error message
    if (error || !post) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error || 'Post not found'}</p>
                <Link to="/posts" className="btn btn-primary">
                    Back to Posts
                </Link>
            </div>
        );
    }
    
    return (
        <div className="post-detail-page">
            <div className="container">
                <article className="post">
                    <header className="post-header">
                        <h1>{post.title}</h1>
                        <div className="post-meta">
                            <span className="post-author">By {post.author.name}</span>
                            <span className="post-date">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
                            <span className="post-category">
                In <Link to={`/posts?category=${post.category._id}`}>{post.category.name}</Link>
              </span>
                            <span className="post-views">{post.viewCount} views</span>
                        </div>
                        
                        {/* Post actions for author or admin */}
                        {isAuthenticated && (user._id === post.author._id || user.role === 'admin') && (
                            <div className="post-actions">
                                <Link to={`/posts/edit/${post._id}`} className="btn btn-edit">
                                    Edit Post
                                </Link>
                                <button onClick={handleDeletePost} className="btn btn-delete">
                                    Delete Post
                                </button>
                            </div>
                        )}
                    </header>
                    
                    <div className="post-featured-image">
                        <img
                            src={post.featuredImage.startsWith('http')
                                ? post.featuredImage
                                : `/uploads/${post.featuredImage}`}
                            alt={post.title}
                        />
                    </div>
                    
                    <div className="post-content">
                        {/* Render content as HTML */}
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>
                    
                    <footer className="post-footer">
                        <div className="post-tags">
                            {post.tags && post.tags.map((tag) => (
                                <Link key={tag} to={`/posts?tag=${tag}`} className="tag">
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </footer>
                </article>
                
                <section className="comments-section">
                    <h2>Comments ({post.comments.length})</h2>
                    
                    {/* Comment form for authenticated users */}
                    {isAuthenticated ? (
                        <form className="comment-form" onSubmit={handleCommentSubmit}>
                            <div className="form-group">
                                <label htmlFor="comment">Add a Comment</label>
                                <textarea
                                    id="comment"
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    placeholder="Write your comment here..."
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting || !commentContent.trim()}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Comment'}
                            </button>
                        </form>
                    ) : (
                        <div className="login-to-comment">
                            <p>
                                <Link to="/login">Log in</Link> to leave a comment.
                            </p>
                        </div>
                    )}
                    
                    {/* Comments list */}
                    <div className="comments-list">
                        {post.comments.length > 0 ? (
                            post.comments.map((comment, index) => (
                                <div className="comment" key={index}>
                                    <div className="comment-header">
                                        <div className="comment-author">
                                            <img
                                                src={comment.user.profileImage.startsWith('http')
                                                    ? comment.user.profileImage
                                                    : `/uploads/${comment.user.profileImage}`}
                                                alt={comment.user.name}
                                                className="author-avatar"
                                            />
                                            <span className="author-name">{comment.user.name}</span>
                                        </div>
                                        <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                                    </div>
                                    <div className="comment-content">{comment.content}</div>
                                </div>
                            ))
                        ) : (
                            <p className="no-comments">No comments yet. Be the first to comment!</p>
                        )}
                    </div>
                </section>
                
                <div className="post-navigation">
                    <Link to="/posts" className="btn btn-back">
                        Back to Posts
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;