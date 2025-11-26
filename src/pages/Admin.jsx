import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import AdminQRCodes from '../components/AdminQRCodes';
import AdminUsers from '../components/AdminUsers';
import AdminReports from '../components/AdminReports';
import ResponsiveNavbar from '../components/ResponsiveNavbar';
import '../page_styles/admin.css';
import '../components/ResponsiveNavbar.css';

const adminNavItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'qrcodes', label: 'QR Codes', icon: '📱' },
    { key: 'users', label: 'User Control', icon: '👥' },
    { key: 'reports', label: 'Gate Report', icon: '📋' },
];

function Admin() {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { currentUser } = useAuth();

    const handleNavClick = (section) => {
        setActiveSection(section);
        setIsMobileMenuOpen(false); // Close mobile menu when section is selected
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileMenuOpen &&
                !event.target.closest('.mobile-menu') &&
                !event.target.closest('.mobile-menu-button')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    const renderContent = () => {
        switch(activeSection) {
            case 'dashboard':
                return <AdminDashboard />;
            case 'qrcodes':
                return <AdminQRCodes />;
            case 'users':
                return <AdminUsers />;
            case 'reports':
                return <AdminReports />;
            default:
                return <AdminDashboard />;
        }
    };

    return (
        <div className="AdminContainer">
            {/* Responsive Navbar Component */}
            <ResponsiveNavbar
                activeSection={activeSection}
                onNavClick={handleNavClick}
                logoText="Admin Panel"
                navItems={adminNavItems}
                userDisplay={currentUser?.displayName || 'Admin'}
                logoutLink={"/"}
            />

            {/* Main Content */}
            <main className="AdminMain">
                <header className="Header-container">
                    <h1>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
                    <div className="AdminUser">
                        <span>
                         Admin</span> 
                    </div>
                </header>
                <section className="AdminContent">
                    {renderContent()}
                </section>
            </main>
        </div>
    );
}

export default Admin;
