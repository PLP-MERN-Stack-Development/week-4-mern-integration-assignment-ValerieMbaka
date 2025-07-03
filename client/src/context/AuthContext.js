import { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { authService } from '../services/api';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children, value }) => {
    const [user, setUser] = useState(value?.user || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Register user
    const register = async (userData) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await authService.register(userData);
            setUser(response.user);
            toast.success('Registration successful!');
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Registration failed';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    // Login user
    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await authService.login(credentials);
            setUser(response.user);
            toast.success('Login successful!');
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Login failed';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    // Logout user
    const logout = () => {
        authService.logout();
        setUser(null);
        toast.info('You have been logged out');
    };
    
    // Update user profile
    const updateProfile = async (profileData) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await authService.updateProfile(profileData);
            setUser(response.user);
            toast.success('Profile updated successfully!');
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Profile update failed';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    // Change password
    const changePassword = async (passwordData) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await authService.changePassword(passwordData);
            toast.success('Password changed successfully!');
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Password change failed';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    // Context value
    const contextValue = {
        user,
        setUser,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
    };
    
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;