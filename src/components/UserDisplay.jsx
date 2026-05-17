import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UserDisplay.css';

const UserDisplay = ({ showAvatar = true, showRole = false, className = '' }) => {
    const { getUserDisplayName, getUserRole, currentUser } = useAuth();

    return (
        <div className={`user-display ${className}`}>
            {showAvatar && (
                <img 
                    src={currentUser?.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg'} 
                    alt="User Avatar" 
                    className="user-avatar"
                />
            )}
            <div className="user-info">
                <span className="user-name">{getUserDisplayName()}</span>
                {showRole && (
                    <span className="user-role">{getUserRole()}</span>
                )}
            </div>
        </div>
    );
};

export default UserDisplay; 