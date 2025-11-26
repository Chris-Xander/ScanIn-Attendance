import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import '../page_styles/landing.css';
import qrIllustration from '../assets/illustrations/vecteezy_qr-code-scanning-vector-illustration-concept-suitable-for_7278490.jpg';
import Logo from '../assets/Icons/signinLogo2.png';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-bg">
      <div className="landing-header">
        <img src={Logo} alt="checkmark" className="checkmark-icon"/>
      </div>
      <p className="landing-tagline">Your Effortless Attendance Tracking System</p>
      <section className="landing-hero">
        <img src={qrIllustration} alt="QR Code Scanning" className="landing-illustration" />
        <div className="landing-hero-content">
          <h2>Welcome to ScanIn Attendance Tracking</h2>
          <p>Modern, secure, and easy-to-use attendance management for organizations, schools, and events. Scan, track, and manage attendance in real time with our App today!</p>
          <p>Click the button below to get started or scan your attendance!</p>
          <div className="landing-btn-container">
           <button className="landing-btn" onClick={() => navigate('/login')}>Get Started</button>
           <button className="landing-btn-scan" onClick={() => navigate('/scan')}>Scan Now!</button>
          </div>
        </div>
      </section>
      <a href="#download" className="landing-download-link">Download App</a>
      <section className="landing-features">
        <h2>Features</h2>
        <div className="features-list">
          <div className="feature-card">
            <h3>QR Code Attendance</h3>
            <p>Members clock in and out by scanning unique QR codes. Fast and contactless.</p>
          </div>
          <div className="feature-card">
            <h3>Admin & Member Roles</h3>
            <p>Admins manage attendance, generate reports, and control users. Members scan and view their history.</p>
          </div>
          <div className="feature-card">
            <h3>Real-Time Analytics</h3>
            <p>Get instant insights into attendance rates, late arrivals, and more.</p>
          </div>
          <div className="feature-card">
            <h3>Secure & Private</h3>
            <p>Built on Firebase for secure authentication and data storage.</p>
          </div>
          <div className="feature-card">
            <h3>Progressive Web App</h3>
            <p>Install on any device. Works offline and feels like a native app.</p>
          </div>
        </div>
      </section>
      <footer className="landing-footer">
        <div id="download" className="landing-download-section">
          <h2>Download Attendid</h2>
          <p>Install as a PWA from your browser or download the APK (coming soon).</p>
          <button className="landing-btn" onClick={() => window.alert('Use your browser\'s install option or check back soon for APK!')}>Download</button>
        </div>
        <p className="landing-copyright">&copy; {new Date().getFullYear()} Attendid. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing; 