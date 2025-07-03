import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="not-found-page">
            <div className="container">
                <div className="not-found-content">
                    <h1>404</h1>
                    <h2>Page Not Found</h2>
                    <p>The page you are looking for does not exist or has been moved.</p>
                    <div className="not-found-actions">
                        <Link to="/" className="btn btn-primary">
                            Go to Home
                        </Link>
                        <Link to="/posts" className="btn btn-secondary">
                            Browse Posts
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;