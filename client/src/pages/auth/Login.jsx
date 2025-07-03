import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loading, error } = useAuth();
    
    // Get redirect path from location state or default to home
    const from = location.state?.from?.pathname || '/';
    
    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: '',
            });
        }
    };
    
    // Validate form
    const validateForm = () => {
        const errors = {};
        const { email, password } = formData;
        
        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Email is invalid';
        }
        
        if (!password) {
            errors.password = 'Password is required';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            await login(formData);
            
            // Redirect to the page the user was trying to access or home
            navigate(from, { replace: true });
        } catch (err) {
            console.error('Login failed:', err);
            
            // Set form errors if they came from the server
            if (err.response?.data?.errors) {
                const serverErrors = {};
                err.response.data.errors.forEach(error => {
                    serverErrors[error.param] = error.msg;
                });
                setFormErrors(serverErrors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="login-page">
            <div className="container">
                <div className="auth-form-container">
                    <h1>Log In</h1>
                    
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    <form className="auth-form" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={formErrors.email ? 'error' : ''}
                                placeholder="Enter your email"
                                autoComplete="email"
                            />
                            {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                        </div>
                        
                        {/* Password */}
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={formErrors.password ? 'error' : ''}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                            {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                        </div>
                        
                        {/* Submit Button */}
                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={isSubmitting || loading}
                            >
                                {isSubmitting ? 'Logging in...' : 'Log In'}
                            </button>
                        </div>
                    </form>
                    
                    <div className="auth-links">
                        <p>
                            Don't have an account? <Link to="/register">Register</Link>
                        </p>
                        <p>
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;