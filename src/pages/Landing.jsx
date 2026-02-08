import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';
import '../page_styles/landing.css';
import qrIllustration from '../assets/illustrations/vecteezy_qr-code-scanning-vector-illustration-concept-suitable-for_7278490.jpg';
import qrcodeicon from '../assets/Icons/qr-code.png';
import Logo from '../assets/Icons/signinLogo2.png';
import Motioncheckmark from '../assets/Icons/icons8-verified-badge.gif';
import AnalyticImage from '../assets/illustrations/undraw_dev-environment_n5by.svg';
import AttendanceGif from '../assets/Icons/candidate_10051272.gif';


function Landing() {
  const navigate = useNavigate();

  const featuresRef = useRef(null);
  const [animateFeatures, setAnimateFeatures] = useState(false);
  const illustrationRef = useRef(null);
  const [animateIllustration, setAnimateIllustration] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (entry.target === featuresRef.current) setAnimateFeatures(true);
          if (entry.target === illustrationRef.current) setAnimateIllustration(true);
        }
      },
        { 
          threshold: 0,
          rootMargin: '0px 0px -150px 0px', //ensures trigger just before fully in view
        } 
    );
    
    if (featuresRef.current) 
      observer.observe(featuresRef.current);
    if (illustrationRef.current) 
      observer.observe(illustrationRef.current);
  

  return () => observer.disconnect();
}, []);

  return (
    <div className="landing-bg">
      <div className="landing-header">
        <img src={Logo} alt="checkmark" className="checkmark-icon"/>
      </div>
      <p className="landing-tagline">Your Effortless Attendance Tracking System</p>
      <section className="landing-hero">
        <img ref={illustrationRef} src={qrIllustration} alt="QR Code Scanning" className={`landing-illustration ${animateIllustration ? 'animate-from-bottom' : 'default-visible'}`} />
        <div className="landing-hero-content">
          <h2>Welcome to ScanIn Attendance Tracking</h2>
          <p>Modern, secure, and easy-to-use attendance management for organizations, schools, and events. Scan, track, and manage attendance in real time with our App today!</p>
          <p>Click the button below to get started or scan your attendance!</p>
          <div className="landing-btn-container">
           <button className="landing-btn" onClick={() => navigate('/login')}>Get Started</button>
           <button className="landing-btn-scan" onClick={() => navigate('/about')}>Learn More!</button>
          </div>
        </div>
      </section>
      <a href="#download" className="landing-download-link">Download App</a>
      <section className="landing-features">
        <div ref={featuresRef} className="features-trigger" />
          <h2>Features</h2>
          <div className="features-list">
            {[
                { title: 'QR Based Attendance',
                  img:qrcodeicon,
                  text: 'Easily scan QR codes to mark attendance with speed and precision.',
                },
                { title: 'Secure & Reliable',
                  img:Motioncheckmark,
                  text: 'With Firebase, your data is protected with top-notch security measures and geo-fencing to ensure reliability.',
                },
                { title: 'Accurate Analytics and Reports',
                  img:AnalyticImage,
                  text: 'Detailed attendance reports and analytics to help you ensure your records are precise.',
                },
                { title: 'Admin and Member Roles',
                  img:AttendanceGif,
                  text: 'Manage different records levels as an admin or access your profile & attendance data as a member.',
                }
              ].map((feature, index) => (
              <div 
                key={index}
                className={`feature-card
                    ${index % 2 === 0 ? 'from-left' : 'from-right'}
                    ${animateFeatures ? 'animate' : ''}
                  `}
                style={{ animationDelay: `${index * 0.25}s`}}
                >
                  <h3>{feature.title}</h3>
                  <img src={feature.img} alt="" className="qr-code-icon"/>
                  <p>{feature.text}</p>
                </div> 
              ))
            }
        </div>
      </section>
      <footer className="landing-footer">
        <div id="download" className="landing-download-section">
          <h2>Download Attendid</h2>
          <p>Install as a PWA from your browser or download the APK (coming soon).</p>
          <button className="landing-btn" onClick={() => window.alert('Use your browser/s install option or check back soon for APK!')}>Download</button>
        </div>
        <div className="landing-footer-links">
          <Link to="/privacy-policy" className="footer-link">  Privacy Policy  | </Link>
          <Link to="/user-agreement" className="footer-link"> User Agreement  |</Link>
          <Link to="/data-retention-policy" className="footer-link">  Data-Retention Policy  |</Link>
          <Link to="/cookie-policy" className="footer-link">  Cookie Policy</Link>
        </div>
        <p className="landing-copyright">&copy; {new Date().getFullYear()} ScanIn. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing; 