import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../page_styles/signup.css';

function Signup() {
    const [role, setRole] = useState('member');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setError(''); // Clear error when switching role
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setError('');
            setLoading(true);
            
            // Create user account
            await signup(email, password, name, role);
            
            // Navigate to appropriate page
            navigate(role === 'admin' ? '/admin' : '/member');
        } catch (error) {
            console.error('Signup error:', error);
            if (error.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists');
            } else if (error.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters');
            } else if (error.code === 'auth/invalid-email') {
                setError('Invalid email address');
            } else {
                setError('Failed to create account. Please try again in a few moments.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-bg">
            <div className="signup-container">
                <h1 className="signup-title">Create Account</h1>
                <p className="signup-subtitle">Sign up as a Member or Admin</p>
                <div className="role-toggle-group">
                    <button
                        type="button"
                        className={`role-toggle${role === 'member' ? ' active' : ''}`}
                        onClick={() => handleRoleChange('member')}
                        disabled={loading}
                    >
                        Member
                    </button>
                    <button
                        type="button"
                        className={`role-toggle${role === 'admin' ? ' active' : ''}`}
                        onClick={() => handleRoleChange('admin')}
                        disabled={loading}
                    >
                        Admin
                    </button>
                </div>
                <div className="role-description">
                    {role === 'member' ? (
                        <span><b>Member:</b> Regular users who can clock in/out, view their attendance, and access personal reports.</span>
                    ) : (
                        <span><b>Admin:</b> Manage users, view reports, and configure system settings. Admins have full access to the dashboard.</span>
                    )}
                </div>
                
                {/* Error Message */}
                {error && (
                    <div style={{
                        width: '100%',
                        marginBottom: '1rem',
                        color: '#d32f2f',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        padding: '0.75rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(244, 67, 54, 0.3)',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}
                
                <form className="signup-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="signup-input"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <input
                        type="email"
                        className="signup-input"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <input
                        type="password"
                        className="signup-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <button 
                        type="submit" 
                        className="signup-btn"
                        disabled={loading}
                        style={{
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Signup; 