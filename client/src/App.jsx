import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { PostProvider } from './context/PostContext';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages
import Home from './pages/Home';
import PostList from './pages/posts/PostList';
import PostDetail from './pages/posts/PostDetail';
import CreatePost from './pages/posts/CreatePost';
import EditPost from './pages/posts/EditPost';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/auth/Profile';
import NotFound from './pages/NotFound';

// Services
import { authService } from './services/api';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Check if user is logged in
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);
    
    return (
        <AuthProvider value={{ user, setUser }}>
            <PostProvider>
                <Router>
                    <div className="app-container">
                        <Header />
                        <main className="main-content">
                            {!loading && (
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/" element={<Home />} />
                                    <Route path="/posts" element={<PostList />} />
                                    <Route path="/posts/:slug" element={<PostDetail />} />
                                    <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                                    <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
                                    
                                    {/* Protected Routes */}
                                    <Route path="/posts/create" element={
                                        <PrivateRoute>
                                            <CreatePost />
                                        </PrivateRoute>
                                    } />
                                    <Route path="/posts/edit/:id" element={
                                        <PrivateRoute>
                                            <EditPost />
                                        </PrivateRoute>
                                    } />
                                    <Route path="/profile" element={
                                        <PrivateRoute>
                                            <Profile />
                                        </PrivateRoute>
                                    } />
                                    
                                    {/* 404 Route */}
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            )}
                        </main>
                        <Footer />
                    </div>
                    <ToastContainer position="bottom-right" />
                </Router>
            </PostProvider>
        </AuthProvider>
    );
}

export default App;