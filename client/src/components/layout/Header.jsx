import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePost } from '../../context/PostContext';

const Header = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const { searchPosts } = usePost();
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    
    // Handle search form submission
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            searchPosts(searchQuery);
            navigate(`/posts?search=${encodeURIComponent(searchQuery)}`);
        }
    };
    
    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <div className="logo">
                        <Link to="/">MERN Blog</Link>
                    </div>
                    
                    <div className="search-form">
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit">Search</button>
                        </form>
                    </div>
                    
                    <nav className="main-nav">
                        <ul>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/posts">Posts</Link>
                            </li>
                            
                            {isAuthenticated ? (
                                <>
                                    <li>
                                        <Link to="/posts/create">Create Post</Link>
                                    </li>
                                    <li className="dropdown">
                                        <button className="dropdown-toggle">
                                            {user.name}
                                        </button>
                                        <ul className="dropdown-menu">
                                            <li>
                                                <Link to="/profile">Profile</Link>
                                            </li>
                                            {isAdmin && (
                                                <li>
                                                    <Link to="/admin">Admin</Link>
                                                </li>
                                            )}
                                            <li>
                                                <button onClick={logout}>Logout</button>
                                            </li>
                                        </ul>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <Link to="/login">Login</Link>
                                    </li>
                                    <li>
                                        <Link to="/register">Register</Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;