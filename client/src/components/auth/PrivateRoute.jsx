import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PrivateRoute component
 * Protects routes that require authentication
 * Redirects to login page if user is not authenticated
 */
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    // If still loading, don't render anything yet
    if (loading) {
        return <div className="loading">Loading...</div>;
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    // If authenticated, render the protected component
    return children;
};

export default PrivateRoute;