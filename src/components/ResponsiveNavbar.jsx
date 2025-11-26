import React, { useState, useEffect } from 'react';
import './ResponsiveNavbar.css';
import Logo from '../assets/Icons/signinLogo2.png';
import {auth} from '../firebase/config';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';


const ResponsiveNavbar = ({ activeSection, onNavClick, logoText = 'Admin Panel', navItems = [], userDisplay = 'User', logoutLink }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavClick = (section) => {
        onNavClick(section);
        setIsMobileMenuOpen(false); // Close mobile menu when section is selected
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleLogOut = async ( ) => {
        await signOut(auth);
        localStorage.clear();
        navigate('/');
    } 

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

    return (
        <header className="responsive-header">
            <nav className="responsive-navbar">
                <img src={Logo} alt="App-Logo" className='NavbarLogo'></img>

                {/* Desktop Navigation */}
                <div className="desktop-nav-container">
                    <ul className="nav-links desktop-nav">
                        {navItems.map(item => (
                            <li key={item.key}>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handleNavClick(item.key); }}
                                    className={`nav-link ${activeSection === item.key ? 'active' : ''}`}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="login-section desktop-login">
                    <span className="user-email">{userDisplay}</span>
                    <button className='logout-button' onClick={handleLogOut}>Logout</button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-button"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle mobile menu"
                    aria-expanded={isMobileMenuOpen}
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
            </nav>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                {/* Close Button */}
                <button
                    className="mobile-menu-close"
                    onClick={closeMobileMenu}
                    aria-label="Close mobile menu"
                >
                    <span className="close-line"></span>
                    <span className="close-line"></span>
                </button>

                {/* Mobile Menu Logo */}
                <div className="mobile-menu-logo">
                    <h2>{logoText}</h2>
                </div>

                <ul className="mobile-nav-links">
                    {navItems.map(item => (
                        <li key={item.key} className="mobile-nav-item">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); handleNavClick(item.key); }}
                                className={`mobile-nav-link ${activeSection === item.key ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-text">{item.label}</span>
                            </a>
                        </li>
                    ))}
                    {logoutLink && (
                        <li className="mobile-nav-item">
                            <a href={logoutLink} className="mobile-nav-link logout-link">
                                <span className="nav-icon">🚪</span>
                                <span className="nav-text">Logout</span>
                            </a>
                        </li>
                    )}
                </ul>
            </div>
        </header>
    );
};

export default ResponsiveNavbar;
