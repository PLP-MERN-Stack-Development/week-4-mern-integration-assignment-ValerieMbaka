import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePost } from '../../context/PostContext';

const Profile = () => {
    const navigate = useNavigate();
    const { user, updateProfile, changePassword, logout, loading, error } = useAuth();
    const { posts, fetchPosts } = usePost();
    
    // Profile form state
    const [profileData, setProfileData] = useState({
        name: '',
        bio: '',
        profileImage: '',
    });
    
    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    
    const [profileErrors, setProfileErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [previewImage, setPreviewImage] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Fetch user's posts on component mount
    useEffect(() => {
        if (user) {
            fetchPosts(1, 5, null, user._id);
        }
    }, [fetchPosts, user]);
    
    // Populate profile form when user data is available
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                bio: user.bio || '',
                profileImage: user.profileImage || '',
            });
            
            // Set preview image if available
            if (user.profileImage) {
                const imageUrl = user.profileImage.startsWith('http')
                    ? user.profileImage
                    : `/uploads/${user.profileImage}`;
                setPreviewImage(imageUrl);
            }
        }
    }, [user]);
    
    // Handle profile form input changes
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value,
        });
        
        // Clear error for this field
        if (profileErrors[name]) {
            setProfileErrors({
                ...profileErrors,
                [name]: '',
            });
        }
        
        // Clear success message
        if (successMessage) {
            setSuccessMessage('');
        }
    };
    
    // Handle password form input changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value,
        });
        
        // Clear error for this field
        if (passwordErrors[name]) {
            setPasswordErrors({
                ...passwordErrors,
                [name]: '',
            });
        }
        
        // Clear success message
        if (successMessage) {
            setSuccessMessage('');
        }
    };
    
    // Handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Here you would typically upload the file to your server
            // For now, we'll just set a preview and pretend it's uploaded
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setProfileData({
                    ...profileData,
                    profileImage: file.name, // In a real app, this would be the URL returned from the server
                });
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Validate profile form
    const validateProfileForm = () => {
        const errors = {};
        
        if (!profileData.name.trim()) {
            errors.name = 'Name is required';
        }
        
        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    // Validate password form
    const validatePasswordForm = () => {
        const errors = {};
        const { currentPassword, newPassword, confirmPassword } = passwordData;
        
        if (!currentPassword) {
            errors.currentPassword = 'Current password is required';
        }
        
        if (!newPassword) {
            errors.newPassword = 'New password is required';
        } else if (newPassword.length < 6) {
            errors.newPassword = 'New password must be at least 6 characters';
        }
        
        if (newPassword !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    // Handle profile form submission
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateProfileForm()) {
            return;
        }
        
        setIsSubmittingProfile(true);
        
        try {
            await updateProfile(profileData);
            setSuccessMessage('Profile updated successfully!');
        } catch (err) {
            console.error('Failed to update profile:', err);
            
            // Set form errors if they came from the server
            if (err.response?.data?.errors) {
                const serverErrors = {};
                err.response.data.errors.forEach(error => {
                    serverErrors[error.param] = error.msg;
                });
                setProfileErrors(serverErrors);
            }
        } finally {
            setIsSubmittingProfile(false);
        }
    };
    
    // Handle password form submission
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (!validatePasswordForm()) {
            return;
        }
        
        setIsSubmittingPassword(true);
        
        try {
            await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            
            // Reset password form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            
            setSuccessMessage('Password changed successfully!');
        } catch (err) {
            console.error('Failed to change password:', err);
            
            // Set form errors if they came from the server
            if (err.response?.data?.errors) {
                const serverErrors = {};
                err.response.data.errors.forEach(error => {
                    serverErrors[error.param] = error.msg;
                });
                setPasswordErrors(serverErrors);
            }
        } finally {
            setIsSubmittingPassword(false);
        }
    };
    
    // Handle logout
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    // If user is not loaded yet, show loading indicator
    if (!user) {
        return <div className="loading">Loading profile...</div>;
    }
    
    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <img
                            src={previewImage || '/uploads/default-avatar.jpg'}
                            alt={user.name}
                        />
                    </div>
                    <div className="profile-info">
                        <h1>{user.name}</h1>
                        <p className="username">@{user.username}</p>
                        <p className="email">{user.email}</p>
                        {user.bio && <p className="bio">{user.bio}</p>}
                    </div>
                </div>
                
                <div className="profile-tabs">
                    <button
                        className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Edit Profile
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => setActiveTab('password')}
                    >
                        Change Password
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        My Posts
                    </button>
                </div>
                
                {successMessage && (
                    <div className="alert alert-success">{successMessage}</div>
                )}
                
                {error && <div className="alert alert-danger">{error}</div>}
                
                <div className="profile-content">
                    {/* Edit Profile Tab */}
                    {activeTab === 'profile' && (
                        <form className="profile-form" onSubmit={handleProfileSubmit}>
                            {/* Name */}
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleProfileChange}
                                    className={profileErrors.name ? 'error' : ''}
                                    placeholder="Enter your full name"
                                />
                                {profileErrors.name && <div className="error-message">{profileErrors.name}</div>}
                            </div>
                            
                            {/* Bio */}
                            <div className="form-group">
                                <label htmlFor="bio">Bio</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={profileData.bio}
                                    onChange={handleProfileChange}
                                    placeholder="Tell us about yourself"
                                    rows="4"
                                />
                            </div>
                            
                            {/* Profile Image */}
                            <div className="form-group">
                                <label htmlFor="profileImage">Profile Image</label>
                                <input
                                    type="file"
                                    id="profileImage"
                                    name="profileImage"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                />
                                {previewImage && (
                                    <div className="image-preview">
                                        <img src={previewImage} alt="Preview" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Submit Button */}
                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmittingProfile || loading}
                                >
                                    {isSubmittingProfile ? 'Updating...' : 'Update Profile'}
                                </button>
                            </div>
                        </form>
                    )}
                    
                    {/* Change Password Tab */}
                    {activeTab === 'password' && (
                        <form className="password-form" onSubmit={handlePasswordSubmit}>
                            {/* Current Password */}
                            <div className="form-group">
                                <label htmlFor="currentPassword">Current Password *</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className={passwordErrors.currentPassword ? 'error' : ''}
                                    placeholder="Enter your current password"
                                />
                                {passwordErrors.currentPassword && (
                                    <div className="error-message">{passwordErrors.currentPassword}</div>
                                )}
                            </div>
                            
                            {/* New Password */}
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password *</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className={passwordErrors.newPassword ? 'error' : ''}
                                    placeholder="Enter your new password"
                                />
                                {passwordErrors.newPassword && (
                                    <div className="error-message">{passwordErrors.newPassword}</div>
                                )}
                            </div>
                            
                            {/* Confirm New Password */}
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm New Password *</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className={passwordErrors.confirmPassword ? 'error' : ''}
                                    placeholder="Confirm your new password"
                                />
                                {passwordErrors.confirmPassword && (
                                    <div className="error-message">{passwordErrors.confirmPassword}</div>
                                )}
                            </div>
                            
                            {/* Submit Button */}
                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmittingPassword || loading}
                                >
                                    {isSubmittingPassword ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    )}
                    
                    {/* My Posts Tab */}
                    {activeTab === 'posts' && (
                        <div className="user-posts">
                            <h2>My Posts</h2>
                            
                            {posts.length > 0 ? (
                                <div className="posts-list">
                                    {posts.map((post) => (
                                        <div className="post-item" key={post._id}>
                                            <h3>
                                                <a href={`/posts/${post.slug}`}>{post.title}</a>
                                            </h3>
                                            <div className="post-meta">
                        <span className="post-date">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                                                <span className="post-status">
                          {post.isPublished ? 'Published' : 'Draft'}
                        </span>
                                            </div>
                                            <div className="post-actions">
                                                <a href={`/posts/${post.slug}`} className="btn btn-sm btn-view">
                                                    View
                                                </a>
                                                <a href={`/posts/edit/${post._id}`} className="btn btn-sm btn-edit">
                                                    Edit
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>You haven't created any posts yet.</p>
                            )}
                            
                            <div className="create-post-link">
                                <a href="/posts/create" className="btn btn-primary">
                                    Create New Post
                                </a>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="logout-section">
                    <button onClick={handleLogout} className="btn btn-danger">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;