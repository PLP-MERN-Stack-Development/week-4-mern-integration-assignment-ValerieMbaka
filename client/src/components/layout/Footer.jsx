import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-logo">
                        <Link to="/">MERN Blog</Link>
                        <p>A full-stack blog application built with the MERN stack.</p>
                    </div>
                    
                    <div className="footer-links">
                        <h3>Quick Links</h3>
                        <ul>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/posts">Posts</Link>
                            </li>
                            <li>
                                <Link to="/login">Login</Link>
                            </li>
                            <li>
                                <Link to="/register">Register</Link>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="footer-categories">
                        <h3>Categories</h3>
                        <ul>
                            <li>
                                <Link to="/posts?category=technology">Technology</Link>
                            </li>
                            <li>
                                <Link to="/posts?category=lifestyle">Lifestyle</Link>
                            </li>
                            <li>
                                <Link to="/posts?category=health">Health</Link>
                            </li>
                            <li>
                                <Link to="/posts?category=travel">Travel</Link>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="footer-contact">
                        <h3>Contact</h3>
                        <p>Email: info@mernblog.com</p>
                        <p>Phone: +1 (123) 456-7890</p>
                        <div className="social-links">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                                Twitter
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                                Facebook
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                Instagram
                            </a>
                        </div>
                    </div>
                </div>
                
                <div className="footer-bottom">
                    <p>&copy; {currentYear} MERN Blog. All rights reserved.</p>
                    <p>
                        <Link to="/privacy">Privacy Policy</Link> |{' '}
                        <Link to="/terms">Terms of Service</Link>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;