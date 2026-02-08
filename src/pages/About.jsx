import react from 'react';
import '../page_styles/About.css';

function About() 
{
    return(
        <div className="about-container">
            <h1>About ScanIn Attendance Tracking</h1>
            <p>ScanIn is an innovative attendance tracking system designed to streamline the process of recording and managing attendance for events, classes, and meetings. By leveraging QR code technology, ScanIn allows participants to check in quickly and efficiently using their smartphones.</p>
            <h2>Key Features</h2>
            <list>
                <li><strong>QR Code Check-In:</strong> Participants can easily check in by scanning a unique QR code generated for each event or session.</li>
                <li><strong>Real-Time Attendance Tracking:</strong> Organizers can monitor attendance in real-time, allowing for immediate insights and adjustments.</li>
                <li><strong>Comprehensive Reporting:</strong> Generate detailed attendance reports that can be exported for further analysis or record-keeping.</li>
                <li><strong>User-Friendly Interface:</strong> An intuitive interface ensures that both organizers and participants can navigate the system with ease.</li>
                <li><strong>Secure Data Management:</strong> All attendance data is securely stored and managed, ensuring privacy and compliance with data protection regulations.</li>
            </list>
            
        </div>
    );

}

export default About;