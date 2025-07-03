import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register, loading, error } = useAuth();
    
    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        bio: '',
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
        const { username, email, password, confirmPassword, name } = formData;
        
        if (!username.trim()) {
            errors.username = 'Username is required';
        } else if (username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        } else if (username.length > 20) {
            errors.username = 'Username cannot be more than 20 characters';
        }
        
        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Email is invalid';
        }
        
        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        
        if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        if (!name.trim()) {
            errors.name = 'Name is required';
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
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...userData } = formData;
            
            await register(userData);
            
            // Redirect to home page after successful registration
            navigate('/');
        } catch (err) {
            console.error('Registration failed:', err);
            
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
        <div className="register-page">
            <div className="container">
                <div className="auth-form-container">
                    <h1>Create an Account</h1>
                    
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    <form className="auth-form" onSubmit={handleSubmit}>
                        {/* Username */}
                        <div className="form-group">
                            <label htmlFor="username">Username *</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={formErrors.username ? 'error' : ''}
                                placeholder="Choose a username"
                                autoComplete="username"
                            />
                            {formErrors.username && <div className="error-message">{formErrors.username}</div>}
                        </div>
                        
                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
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
                            <label htmlFor="password">Password *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={formErrors.password ? 'error' : ''}
                                placeholder="Create a password"
                                autoComplete="new-password"
                            />
                            {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                        </div>
                        
                        {/* Confirm Password */}
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={formErrors.confirmPassword ? 'error' : ''}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />
                            {formErrors.confirmPassword && (
                                <div className="error-message">{formErrors.confirmPassword}</div>
                            )}
                        </div>
                        
                        {/* Name */}
                        <div className="form-group">
                            <label htmlFor="name">Full Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={formErrors.name ? 'error' : ''}
                                placeholder="Enter your full name"
                                autoComplete="name"
                            />
                            {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                        </div>
                        
                        {/* Bio */}
                        <div className="form-group">
                            <label htmlFor="bio">Bio</label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself (optional)"
                                rows="3"
                            />
                        </div>
                        
                        {/* Submit Button */}
                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={isSubmitting || loading}
                            >
                                {isSubmitting ? 'Creating Account...' : 'Register'}
                            </button>
                        </div>
                    </form>
                    
                    <div className="auth-links">
                        <p>
                            Already have an account? <Link to="/login">Log In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;