import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../page_styles/Member.css'
import MemberClockin from '../components/MemberClockin';
import MemberHistory from '../components/MemberHistory';
import MemberDetails from '../components/MemberDetails';
import MemberSettings from '../components/MemberSettings';
import ResponsiveNavbar from '../components/ResponsiveNavbar';
import '../components/ResponsiveNavbar.css';

const memberNavItems = [
    { key: 'clockin', label: 'Clock-in/Clock-out', icon: '⏰' },
    { key: 'history', label: 'History', icon: '📜' },
    { key: 'details', label: 'Details', icon: '👤' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
];
 
function Member() {
    const [activeSection, setActiveSection] = useState('clockin');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { currentUser } = useAuth();

    const handleNavClick = (section) => {
        setActiveSection(section);
    };

    const renderContent = () => {
        switch(activeSection) {
            case 'clockin':
                return <MemberClockin currentUser={currentUser} />;
            case 'history':
                return <MemberHistory currentUser={currentUser} />;
            case 'details':
                return <MemberDetails currentUser={currentUser} />;
            case 'settings':
                return <MemberSettings currentUser={currentUser} setActiveSection={setActiveSection} />;
            default:
                return <MemberClockin currentUser={currentUser} />;
        }
    };

    return (
        <div className="member-bg">
            {/* Responsive Navbar Component */}
            <ResponsiveNavbar
                activeSection={activeSection}
                onNavClick={handleNavClick}
                logoText="Member Panel"
                navItems={memberNavItems}
                userDisplay={currentUser?.displayName || 'Member'}
                logoutLink="/"
            />

            {/* Main Content */}
            <main className="Member-main">
                <header className="Header-container">
                    <h1>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
                    <div className="MemberUser">
                        <span>Member</span>
                    </div>
                </header>
                <section className="MemberContent">
                    {renderContent()}
                </section>
            </main>
        </div>
    );
}

export default Member;