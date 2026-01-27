import '../page_styles/MemberDetails.css';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage, db } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import mockService from '../services/mockService';

const MemberDetails = ({ currentUser }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef();
    const { updateUserProfile, updateUserData, getUserData, useMock } = useAuth();

    // Load user data on mount
    useEffect(() => {
        const loadUserData = async () => {
            if (currentUser?.uid) {
                try {
                    if (useMock) {
                        // Mock service - get from mock data
                        const mockUser = mockService.data.users.find(u => u.uid === currentUser.uid);
                        if (mockUser) {
                            setPhone(mockUser.phone || '');
                        }
                    } else {
                        // Real Firebase - get from Firestore
                        const userData = await getUserData();
                        if (userData) {
                            setPhone(userData.phone || '');
                        }
                    }
                } catch (err) {
                    console.error('Error loading user data:', err);
                }
            }
        };
        loadUserData();
    }, [currentUser, useMock, getUserData]);



    // Handle phone number update
    const handlePhoneUpdate = async (newPhone) => {
        setLoading(true);
        setError('');

        try {
            if (useMock) {
                // Mock service - update in mock data
                const mockUserIndex = mockService.data.users.findIndex(u => u.uid === currentUser.uid);
                if (mockUserIndex !== -1) {
                    mockService.data.users[mockUserIndex].phone = newPhone;
                }
            } else {
                // Real Firebase - update in Firestore
                await updateUserData({ phone: newPhone });
            }

            setPhone(newPhone);
            setIsEditing(false);
            setLoading(false);
        } catch (err) {
            console.error('Error updating phone:', err);
            setError('Failed to update phone number. Please try again.');
            setLoading(false);
        }
    };

    // Password change functionality
    const handlePasswordChange = () => {
        // We'll implement this separately since it needs a modal
        console.log('Password change requires additional UI');
    };

    return (
        <div className="member-container">
            <h1 className="member-title">Profile Details</h1>
            <p className="member-desc">Your personal and account details will be shown here.</p>
            <div className="profile-details-card">
                {error && <div className="error-message">{error}</div>}
                <div className="profile-info-section">
                    <div className="profile-details-row">
                        <span className="detail-label">Name</span>
                        <span className="detail-value">{currentUser?.displayName || 'John'}</span>
                    </div>

                    <div className="profile-details-row">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{currentUser?.email || 'johndoe@email.com'}</span>
                    </div>

                    <div className="profile-details-row">
                        <span className="detail-label">Phone</span>
                        {isEditing ? (
                            <div className="phone-edit-actions">
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="phone-input"
                                    placeholder="Enter phone number"
                                    disabled={loading}
                                />
                                <button 
                                    className="save-btn"
                                    onClick={() => handlePhoneUpdate(phone)}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button 
                                    className="cancel-btn"
                                    onClick={() => setIsEditing(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="phone-display">
                                <span className="detail-value">{phone || 'Not set'}</span>
                                <button 
                                    className="edit-btn"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberDetails;
