import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../page_styles/MemberSettings.css';

const MemberSettings = ({ currentUser, setActiveSection }) => {
    const { updateUserProfile } = useAuth();
    const [settings, setSettings] = useState({
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        phone: '',
        notifications: {
            email: true,
            push: true,
            sms: false
        },
        privacy: {
            shareData: false,
            showProfile: true
        },
        preferences: {
            theme: 'light',
            language: 'en'
        }
    });
    const [settingsNotification, setSettingsNotification] = useState('');

    useEffect(() => {
        setSettings(prev => ({
            ...prev,
            name: currentUser?.displayName || '',
            email: currentUser?.email || ''
        }));
    }, [currentUser]);

    const handleSettingChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNotificationChange = (type) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [type]: !prev.notifications[type]
            }
        }));
    };

    const handlePrivacyChange = (type) => {
        setSettings(prev => ({
            ...prev,
            privacy: {
                ...prev.privacy,
                [type]: !prev.privacy[type]
            }
        }));
    };

    const handlePreferenceChange = (type, value) => {
        setSettings(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [type]: value
            }
        }));
    };

    const handleSaveSettings = async () => {
        try {
            // Update the user's display name if it has changed
            if (settings.name !== currentUser?.displayName) {
                await updateUserProfile({ displayName: settings.name });
            }

            setSettingsNotification('Settings saved successfully!');
            setTimeout(() => setSettingsNotification(''), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setSettingsNotification('Error saving settings. Please try again.');
            setTimeout(() => setSettingsNotification(''), 3000);
        }
    };

    return (
        <div className="member-container-settings">
            <h1 className="member-title">Settings</h1>
            <p className="member-desc">Update your preferences and account settings here.</p>

            {settingsNotification && (
                <div className={`settings-notification ${settingsNotification.includes('success') ? 'success' : 'error'}`}>
                    {settingsNotification}
                </div>
            )}

            <div className="settings-section">
                <div className="settings-section-title">Profile Information</div>
                <div className="settings-form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={settings.name}
                        onChange={handleSettingChange}
                        className="settings-form-input"
                        placeholder="Enter your full name"
                    />
                </div>
                <div className="settings-form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={settings.email}
                        onChange={handleSettingChange}
                        className="settings-form-input"
                        placeholder="Enter your email"
                    />
                </div>
                <div className="settings-form-group">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={settings.phone}
                        onChange={handleSettingChange}
                        className="settings-form-input"
                        placeholder="Enter your phone number"
                    />
                </div>
            </div>

            <div className="settings-section">
                <div className="settings-section-title">Notifications</div>
                <div className="settings-checkbox-group">
                    <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={() => handleNotificationChange('email')}
                    />
                    <label>Email Notifications</label>
                </div>
                <div className="settings-checkbox-group">
                    <input
                        type="checkbox"
                        checked={settings.notifications.push}
                        onChange={() => handleNotificationChange('push')}
                    />
                    <label>Push Notifications</label>
                </div>
                <div className="settings-checkbox-group">
                    <input
                        type="checkbox"
                        checked={settings.notifications.sms}
                        onChange={() => handleNotificationChange('sms')}
                    />
                    <label>SMS Notifications</label>
                </div>
            </div>

            <div className="settings-section">
                <div className="settings-section-title">Privacy</div>
                <div className="settings-checkbox-group">
                    <input
                        type="checkbox"
                        checked={settings.privacy.shareData}
                        onChange={() => handlePrivacyChange('shareData')}
                    />
                    <label>Share attendance data with admins</label>
                </div>
                <div className="settings-checkbox-group">
                    <input
                        type="checkbox"
                        checked={settings.privacy.showProfile}
                        onChange={() => handlePrivacyChange('showProfile')}
                    />
                    <label>Show profile to other members</label>
                </div>
            </div>

            <div className="settings-section">
                <div className="settings-section-title">Preferences</div>
                <div className="settings-form-group">
                    <label>Theme</label>
                    <select
                        value={settings.preferences.theme}
                        onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                        className="settings-form-select"
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                    </select>
                </div>
                <div className="settings-form-group">
                    <label>Language</label>
                    <select
                        value={settings.preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        className="settings-form-select"
                    >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="settings-btn settings-btn-save" onClick={handleSaveSettings}>
                    Save Settings
                </button>
                <button className="settings-btn settings-btn-cancel" onClick={() => setActiveSection('clockin')}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default MemberSettings;
