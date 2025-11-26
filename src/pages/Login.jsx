import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../page_styles/login.css';

function Login() {
    const [loginType, setLoginType] = useState('member');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLoginTypeChange = (newType) => {
        setLoginType(newType);
        setError(''); // Clear error when switching login type
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);

            // Attempt to login
            const result = await login(email, password);

            // Check if user role matches login type
            const userRole = result.user.photoURL; // We stored role in photoURL
            if (userRole !== loginType) {
                setError(`Please login as ${userRole} instead of ${loginType}`);
                return;
            }

            // Route based on login type
            if (loginType === 'admin') {
                navigate('/admin');
            } else {
                navigate('/member');
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.code === 'auth/user-not-found') {
                setError('No account found with this email address');
            } else if (error.code === 'auth/wrong-password') {
                setError('Incorrect password');
            } else if (error.code === 'auth/invalid-email') {
                setError('Invalid email address');
            } else {
                setError('Failed to sign in. Please check your credentials or try again in a few moments.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-paper">
                <h1 className="login-title">
                    {loginType === 'admin' ? 'Admin Login' : 'Member Login'}
                </h1>
                <p className="login-subtitle">
                    Please sign in to continue
                </p>

                {/* Modern Toggle */}
                <div className="login-toggle-group">
                    <button
                        type="button"
                        className={`login-toggle-btn${loginType === 'member' ? ' active' : ''}`}
                        onClick={() => handleLoginTypeChange('member')}
                        disabled={loading}
                    >
                        Member
                    </button>
                    <button
                        type="button"
                        className={`login-toggle-btn${loginType === 'admin' ? ' active' : ''}`}
                        onClick={() => handleLoginTypeChange('admin')}
                        disabled={loading}
                    >
                        Admin
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <input
                        required
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="login-input"
                        disabled={loading}
                    />
                    <input
                        required
                        type="password"
                        name="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="login-input"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                <p className="login-signup-text">
                    Don't have an account? <a href="/signup" className="login-signup-link">Sign up</a>
                </p>
            </div>
        </div>
    );
}

export default Login;






