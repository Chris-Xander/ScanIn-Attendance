import React from 'react';
import '../page_styles/About.css';

function About() {
    return (
        <div className="about-container">
            <div className="about-header">
                <h1>About ScanIn (Attendid)</h1>
                <p>Comprehensive Guide to Getting Started and Using the Platform</p>
            </div>

            <div className="about-content">
                <section>
                    <h2>What is ScanIn?</h2>
                    <p>ScanIn (also known as Attendid) is a comprehensive Progressive Web App (PWA) designed for modern attendance tracking. It provides organizations, schools, and event managers with powerful tools to manage attendance through QR code scanning, form-based submissions, and real-time analytics.</p>
                    <p>Built with React and powered by Firebase, ScanIn offers a secure, scalable solution that works seamlessly across devices and platforms. Whether you're managing a classroom, conference, corporate event, or community gathering, ScanIn streamlines the entire attendance process.</p>
                </section>

                <section>
                    <h2>Key Features</h2>
                    <div className="feature-grid">
                        <div className="feature-card">
                            <h4>🔲 QR Code Management</h4>
                            <p>Create unlimited custom QR codes for different events and sessions with advanced configuration options.</p>
                        </div>
                        <div className="feature-card">
                            <h4>📊 Real-Time Analytics</h4>
                            <p>Monitor attendance in real-time with live statistics, reports, and data visualization tools.</p>
                        </div>
                        <div className="feature-card">
                            <h4>👥 Member Management</h4>
                            <p>Register and manage participants with detailed profiles, roles, and attendance history.</p>
                        </div>
                        <div className="feature-card">
                            <h4>📱 Cross-Platform</h4>
                            <p>Works on any device with a modern web browser. Install as a PWA for native app experience.</p>
                        </div>
                        <div className="feature-card">
                            <h4>🔒 Secure & Private</h4>
                            <p>Enterprise-grade security with Firebase authentication and comprehensive data protection.</p>
                        </div>
                        <div className="feature-card">
                            <h4>📈 Advanced Reporting</h4>
                            <p>Generate detailed reports with export capabilities in multiple formats (Excel, CSV, PDF).</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2>Getting Started</h2>
                    <p>ScanIn is designed to be intuitive and easy to use. Whether you're a first-time user or an experienced administrator, this guide will help you get up and running quickly.</p>

                    <h3>System Requirements</h3>
                    <ul>
                        <li><strong>Device:</strong> Smartphone, tablet, or computer with internet access</li>
                        <li><strong>Browser:</strong> Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                        <li><strong>Camera:</strong> For QR code scanning (built-in or external)</li>
                        <li><strong>Connection:</strong> Internet connection for real-time features</li>
                    </ul>

                    <h3>Accessing ScanIn</h3>
                    <p>You can access ScanIn through any modern web browser by visiting the application URL. For the best experience, we recommend using Google Chrome or Mozilla Firefox.</p>
                    <div className="highlight-box">
                        <strong>💡 Pro Tip:</strong> ScanIn works as a Progressive Web App (PWA), which means you can install it directly on your device for a native app-like experience. Look for the "Add to Home Screen" option in your browser menu.
                    </div>
                </section>

                <section>
                    <h2>Creating an Account</h2>
                    <p>To access administrative features and manage attendance data, you'll need to create an account. Member check-ins can be done without an account.</p>

                    <h3>Account Types</h3>
                    <ul>
                        <li><strong>Admin Account:</strong> Full access to all features including QR code creation, member management, and reporting</li>
                        <li><strong>Member Account:</strong> Optional for users who want to view their attendance history and manage their profile</li>
                        <li><strong>Guest Check-in:</strong> No account required - anyone can check in using QR codes</li>
                    </ul>

                    <h3>How to Create an Account</h3>
                    <ol>
                        <li>Navigate to the ScanIn application in your web browser</li>
                        <li>Click on the "Sign Up" or "Create Account" button</li>
                        <li>Fill in the required information:
                            <ul>
                                <li>Email address (must be valid and accessible)</li>
                                <li>Password (minimum 6 characters, include numbers and symbols)</li>
                                <li>Full name or display name</li>
                                <li>Account role (Admin or Member)</li>
                            </ul>
                        </li>
                        <li>Verify your email address by clicking the confirmation link sent to your email</li>
                        <li>Log in with your new credentials</li>
                    </ol>

                    <div className="warning-box">
                        <strong>⚠️ Important:</strong> Admin accounts have significant permissions. Only trusted individuals should be granted admin access.
                    </div>
                </section>

                <section>
                    <h2>Logging In</h2>
                    <p>Once you have an account, logging in is straightforward and secure.</p>

                    <h3>Login Process</h3>
                    <ol>
                        <li>Open ScanIn in your web browser</li>
                        <li>Click the "Login" or "Sign In" button</li>
                        <li>Enter your email address and password</li>
                        <li>Click "Login" to access your account</li>
                    </ol>

                    <h3>Security Features</h3>
                    <ul>
                        <li><strong>Email Verification:</strong> All accounts require email verification for security</li>
                        <li><strong>Secure Authentication:</strong> Uses Firebase Authentication with industry-standard security</li>
                        <li><strong>Session Management:</strong> Automatic logout after periods of inactivity</li>
                        <li><strong>Password Recovery:</strong> Reset your password if forgotten</li>
                    </ul>

                    <div className="success-box">
                        <strong>✅ Stay Logged In:</strong> For convenience, you can choose to stay logged in on trusted devices. However, always log out on shared or public computers.
                    </div>
                </section>

                <section>
                    <h2>Using ScanIn as a Member</h2>
                    <p>Members can check in to events and view their attendance history. The best part? <strong>You don't need an account to check in!</strong></p>

                    <h3>Checking In Without an Account</h3>
                    <p>ScanIn is designed for maximum accessibility. Anyone can check in to an event without creating an account:</p>

                    <h4>Using Your Phone's Native Camera</h4>
                    <ol>
                        <li>Open your phone's camera app</li>
                        <li>Point the camera at the QR code displayed for the event</li>
                        <li>The camera will automatically detect and scan the QR code</li>
                        <li>If it's a form-based check-in, fill out the required information</li>
                        <li>Submit your attendance - you're done!</li>
                    </ol>

                    <h4>Using Third-Party Apps</h4>
                    <p>If your native camera doesn't support QR scanning, you can use popular third-party apps:</p>
                    <ul>
                        <li><strong>Google Lens:</strong> Available on Android devices and as a standalone app</li>
                        <li><strong>QR Code Readers:</strong> Apps like "QR Code Reader" or "Barcode Scanner"</li>
                        <li><strong>Browser Extensions:</strong> QR code extensions for Chrome, Firefox, etc.</li>
                    </ul>

                    <h3>Checking In With an Account</h3>
                    <p>If you have a member account, you get additional benefits:</p>
                    <ul>
                        <li><strong>Attendance History:</strong> View all your past check-ins and attendance records</li>
                        <li><strong>Personal Dashboard:</strong> See your attendance statistics and patterns</li>
                        <li><strong>Profile Management:</strong> Update your information and preferences</li>
                        <li><strong>Notifications:</strong> Receive updates about events and attendance status</li>
                    </ul>

                    <h3>Member Dashboard Features</h3>
                    <ul>
                        <li><strong>Clock In/Out:</strong> Quick check-in for active sessions</li>
                        <li><strong>Attendance History:</strong> Chronological list of all your check-ins</li>
                        <li><strong>Session Details:</strong> Information about events you've attended</li>
                        <li><strong>Settings:</strong> Manage your profile and notification preferences</li>
                    </ul>
                </section>

                <section>
                    <h2>Using ScanIn as an Administrator</h2>
                    <p>Administrators have full control over the ScanIn platform. This section provides a comprehensive guide to all administrative features and functions.</p>

                    <h3>Admin Dashboard Overview</h3>
                    <p>The admin dashboard is your central hub for managing all aspects of attendance tracking. It includes:</p>
                    <ul>
                        <li><strong>Quick Stats:</strong> Real-time attendance numbers and session status</li>
                        <li><strong>Navigation Menu:</strong> Access to all admin functions</li>
                        <li><strong>Recent Activity:</strong> Latest check-ins and system events</li>
                        <li><strong>System Status:</strong> Health indicators and alerts</li>
                    </ul>

                    <h3>Creating Regular QR Codes</h3>
                    <p>QR codes are the foundation of ScanIn's attendance system. Learn how to create and manage them effectively.</p>

                    <h4>Types of QR Codes</h4>
                    <ul>
                        <li><strong>Simple Check-in:</strong> Basic attendance recording with timestamp</li>
                        <li><strong>Form-Based:</strong> Collect additional information (name, email, etc.)</li>
                        <li><strong>Session-Specific:</strong> Linked to particular events or time slots</li>
                        <li><strong>Custom QR:</strong> Advanced configurations with custom fields and validation</li>
                    </ul>

                    <h4>How to Create a QR Code</h4>
                    <ol>
                        <li>Log in as an administrator</li>
                        <li>Navigate to "QR Codes" in the admin menu</li>
                        <li>Click "Create New QR Code"</li>
                        <li>Configure the QR code:
                            <ul>
                                <li><strong>Name:</strong> Descriptive name for the QR code</li>
                                <li><strong>Type:</strong> Choose between simple or form-based</li>
                                <li><strong>Session:</strong> Link to an existing session (optional)</li>
                                <li><strong>Custom Fields:</strong> Add form fields if needed</li>
                                <li><strong>Expiration:</strong> Set time limits if required</li>
                            </ul>
                        </li>
                        <li>Generate and download the QR code</li>
                        <li>Display or distribute the QR code for check-ins</li>
                    </ol>

                    <h4>QR Code Management</h4>
                    <ul>
                        <li><strong>Edit QR Codes:</strong> Modify settings and configurations</li>
                        <li><strong>Duplicate QR Codes:</strong> Create copies for similar events</li>
                        <li><strong>Track Usage:</strong> Monitor scan counts and attendance numbers</li>
                        <li><strong>Delete QR Codes:</strong> Remove unused or expired codes</li>
                    </ul>

                    <h3>Managing Sessions</h3>
                    <p>Sessions organize attendance data by events, classes, or time periods. They're essential for structured attendance tracking.</p>

                    <h4>Creating Sessions</h4>
                    <ol>
                        <li>Go to "Sessions" in the admin menu</li>
                        <li>Click "Create New Session"</li>
                        <li>Fill in session details:
                            <ul>
                                <li><strong>Name:</strong> Clear, descriptive session name</li>
                                <li><strong>Description:</strong> Additional context and information</li>
                                <li><strong>Date & Time:</strong> Start and end times</li>
                                <li><strong>Location:</strong> Physical or virtual location</li>
                                <li><strong>Geofencing:</strong> Optional GPS-based attendance validation</li>
                                <li><strong>Capacity:</strong> Maximum number of attendees</li>
                            </ul>
                        </li>
                        <li>Save the session</li>
                    </ol>

                    <h4>Session Features</h4>
                    <ul>
                        <li><strong>Real-Time Monitoring:</strong> Live attendance counts and check-in rates</li>
                        <li><strong>Geofencing:</strong> GPS validation to ensure attendance from correct location</li>
                        <li><strong>Capacity Management:</strong> Track and limit attendance numbers</li>
                        <li><strong>Multi-Day Sessions:</strong> Support for events spanning multiple days</li>
                        <li><strong>Session Linking:</strong> Connect QR codes to specific sessions</li>
                    </ul>

                    <h3>Managing and Registering Members</h3>
                    <p>Member management is crucial for organizations that need to track specific individuals or groups.</p>

                    <h4>Registering Members</h4>
                    <p>There are several ways to add members to your ScanIn system:</p>

                    <h4>Manual Registration</h4>
                    <ol>
                        <li>Navigate to "Members" in the admin menu</li>
                        <li>Click "Add New Member"</li>
                        <li>Enter member information:
                            <ul>
                                <li><strong>Name:</strong> Full name of the member</li>
                                <li><strong>Email:</strong> Contact email address</li>
                                <li><strong>Phone:</strong> Optional contact number</li>
                                <li><strong>ID/Student Number:</strong> Unique identifier</li>
                                <li><strong>Role:</strong> Member classification (student, employee, etc.)</li>
                                <li><strong>Groups:</strong> Assign to specific groups or classes</li>
                            </ul>
                        </li>
                        <li>Save the member profile</li>
                    </ol>

                    <h4>Bulk Import via CSV</h4>
                    <ol>
                        <li>Prepare a CSV file with member data</li>
                        <li>Go to "Members" → "Import Members"</li>
                        <li>Upload your CSV file</li>
                        <li>Map columns to ScanIn fields</li>
                        <li>Review and confirm the import</li>
                    </ol>

                    <h4>Member Management Features</h4>
                    <ul>
                        <li><strong>Profile Editing:</strong> Update member information and preferences</li>
                        <li><strong>Group Assignment:</strong> Organize members into classes, departments, or teams</li>
                        <li><strong>Attendance History:</strong> View complete attendance records for each member</li>
                        <li><strong>Bulk Operations:</strong> Edit multiple members at once</li>
                        <li><strong>Export Member Data:</strong> Download member lists and information</li>
                        <li><strong>Member Search:</strong> Find members quickly by name, email, or ID</li>
                    </ul>

                    <h3>Viewing Reports and Analytics</h3>
                    <p>ScanIn provides comprehensive reporting tools to help you understand attendance patterns and make data-driven decisions.</p>

                    <h4>Types of Reports</h4>
                    <ul>
                        <li><strong>Session Reports:</strong> Detailed attendance for specific events</li>
                        <li><strong>Member Reports:</strong> Individual attendance history and statistics</li>
                        <li><strong>Group Reports:</strong> Attendance data for classes, departments, or teams</li>
                        <li><strong>Time-Based Reports:</strong> Attendance trends over days, weeks, or months</li>
                        <li><strong>Custom Reports:</strong> Build reports with specific filters and criteria</li>
                    </ul>

                    <h4>Using the Reports Dashboard</h4>
                    <ol>
                        <li>Access "Reports" from the admin menu</li>
                        <li>Choose your report type or create a custom report</li>
                        <li>Apply filters:
                            <ul>
                                <li><strong>Date Range:</strong> Select specific time periods</li>
                                <li><strong>Sessions:</strong> Filter by specific events or sessions</li>
                                <li><strong>Members:</strong> Focus on individual or group attendance</li>
                                <li><strong>Status:</strong> Filter by attendance status (present, absent, etc.)</li>
                            </ul>
                        </li>
                        <li>View the report with charts and data tables</li>
                        <li>Export the data for further analysis</li>
                    </ol>

                    <h4>Report Features</h4>
                    <ul>
                        <li><strong>Interactive Charts:</strong> Visual representations of attendance data</li>
                        <li><strong>Data Tables:</strong> Detailed tabular data with sorting and filtering</li>
                        <li><strong>Export Options:</strong> Download in Excel, CSV, or PDF formats</li>
                        <li><strong>Scheduled Reports:</strong> Set up automatic report generation</li>
                        <li><strong>Real-Time Updates:</strong> Live data for active sessions</li>
                    </ul>

                    <h3>Exporting Data</h3>
                    <p>ScanIn makes it easy to export your attendance data for external analysis, record-keeping, or integration with other systems.</p>

                    <h4>Export Options</h4>
                    <ul>
                        <li><strong>Excel (.xlsx):</strong> Full-featured spreadsheet with formatting</li>
                        <li><strong>CSV (.csv):</strong> Simple text format for data import</li>
                        <li><strong>PDF (.pdf):</strong> Formatted reports for sharing and printing</li>
                        <li><strong>JSON (.json):</strong> Structured data for developers and integrations</li>
                    </ul>

                    <h4>How to Export Data</h4>
                    <ol>
                        <li>Go to the relevant section (Reports, Members, Sessions)</li>
                        <li>Apply any desired filters</li>
                        <li>Click the "Export" button</li>
                        <li>Select your preferred format</li>
                        <li>Choose export options (date range, included fields)</li>
                        <li>Download the file to your device</li>
                    </ol>

                    <h4>Export Best Practices</h4>
                    <ul>
                        <li><strong>Regular Backups:</strong> Export data regularly for backup purposes</li>
                        <li><strong>Filtered Exports:</strong> Use filters to export only relevant data</li>
                        <li><strong>Scheduled Exports:</strong> Set up automated exports for recurring reports</li>
                        <li><strong>Data Security:</strong> Store exported files securely and delete when no longer needed</li>
                    </ul>
                </section>

                <section>
                    <h2>Security and Privacy</h2>
                    <p>ScanIn takes security and privacy seriously. All data is encrypted in transit and at rest, and we follow industry best practices for data protection.</p>

                    <h3>Data Protection</h3>
                    <ul>
                        <li><strong>Encryption:</strong> All data encrypted using industry-standard protocols</li>
                        <li><strong>Access Controls:</strong> Role-based permissions and authentication</li>
                        <li><strong>Audit Logs:</strong> Comprehensive logging of all system activities</li>
                        <li><strong>Regular Backups:</strong> Secure data backups with disaster recovery</li>
                    </ul>

                    <h3>Compliance</h3>
                    <p>ScanIn complies with major data protection regulations and implements privacy-by-design principles.</p>
                </section>

                <section>
                    <h2>Getting Help and Support</h2>
                    <p>Need assistance? ScanIn provides multiple ways to get help:</p>

                    <h3>Documentation</h3>
                    <ul>
                        <li><strong>User Guides:</strong> Step-by-step instructions for all features</li>
                        <li><strong>Video Tutorials:</strong> Visual guides for complex tasks</li>
                        <li><strong>FAQ:</strong> Answers to common questions</li>
                        <li><strong>API Documentation:</strong> For developers integrating with ScanIn</li>
                    </ul>

                    <h3>Support Options</h3>
                    <ul>
                        <li><strong>Email Support:</strong> Contact our support team</li>
                        <li><strong>Live Chat:</strong> Real-time assistance during business hours</li>
                        <li><strong>Community Forum:</strong> Connect with other ScanIn users</li>
                        <li><strong>Priority Support:</strong> Premium support for enterprise customers</li>
                    </ul>
                </section>

                <section>
                    <h2>Conclusion</h2>
                    <p>ScanIn is more than just an attendance tracking app—it's a comprehensive solution designed to make attendance management efficient, accurate, and insightful. Whether you're managing a small classroom or a large corporate event, ScanIn provides the tools you need to succeed.</p>
                    <p>Thank you for choosing ScanIn. We're committed to continuously improving our platform and supporting your attendance tracking needs.</p>
                </section>
            </div>
        </div>
    );
}

export default About;
