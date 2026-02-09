import React from 'react';
import '../page_styles/UserAgreement.css';

function UserAgreement() {
    return (
        <div className="user-agreement-main">
            <div className="user-agreement-header">
                <h1>User Agreement / Terms of Use for ScanIn (Attendid)</h1>
                <p><strong>Effective Date:</strong> [25/12/2025]</p>
                <p><strong>Last Updated:</strong> [02/01/2026]</p>
            </div>

            <div className="user-agreement-content">
                <section>
                    <h2>Acceptance of Terms</h2>
                    <p>Welcome to ScanIn (also known as Attendid) ("ScanIn," "we," "our," or "us"). We are pleased to provide you with access to our comprehensive attendance tracking platform designed to streamline attendance management for organizations, educational institutions, and event coordinators.</p>
                    <p>These Terms of Use ("Terms," "Agreement," or "Terms of Service") constitute a legally binding agreement between you (the "User," "you," or "your") and ScanIn, governing your access to and use of the ScanIn web application, progressive web app, mobile-responsive interface, and all related services, features, tools, and functionalities (collectively referred to as the "Service").</p>
                    <p>This Agreement also incorporates by reference our Privacy Policy, which explains how we collect, use, store, and protect your personal information and attendance data. By using the Service, you acknowledge that you have read, understood, and agree to be bound by both this Agreement and our Privacy Policy.</p>
                    <p>Your use of the Service constitutes your unconditional acceptance of these Terms. If you do not agree to all the terms and conditions set forth herein, you must immediately cease all use of the Service and uninstall any associated applications. Continued use of the Service following any modifications to these Terms constitutes your acceptance of such changes.</p>
                    <p>This Agreement represents the entire understanding between you and ScanIn regarding the subject matter hereof and supersedes all prior agreements, understandings, or representations, whether written or oral, relating to such subject matter.</p>
                </section>

                <section>
                    <h2>Description of Service</h2>
                    <p>ScanIn (also known as Attendid) is a comprehensive, cloud-based attendance tracking and management platform designed to revolutionize how organizations, educational institutions, corporations, non-profit organizations, and event coordinators handle attendance recording, verification, and reporting. Our platform combines cutting-edge technology with user-friendly interfaces to provide a seamless attendance management experience.</p>
                    <p>The Service encompasses multiple integrated components and features, including but not limited to:</p>
                    <ul>
                        <li><strong>QR Code Generation and Management:</strong> Advanced QR code creation tools allowing administrators to generate unique, customizable QR codes for different events, sessions, or time periods, with built-in expiration controls and usage tracking</li>
                        <li><strong>Real-time Attendance Collection:</strong> Sophisticated form-based submission system that captures detailed attendance information including timestamps, location data (when enabled), device fingerprints, and custom fields defined by administrators</li>
                        <li><strong>Multi-session Support:</strong> Comprehensive session management allowing organizations to create and manage multiple concurrent or sequential attendance sessions with different configurations and requirements</li>
                        <li><strong>Role-based Access Control:</strong> Granular permission system supporting multiple user roles including administrators, moderators, members, and guests, with customizable access levels and data visibility controls</li>
                        <li><strong>Advanced Analytics and Reporting:</strong> Powerful reporting dashboard providing real-time statistics, attendance trends, participation metrics, and exportable reports in multiple formats (PDF, Excel, CSV)</li>
                        <li><strong>Device and Location Validation:</strong> Optional geofencing capabilities and device fingerprinting to ensure attendance submissions are legitimate and occur within designated parameters</li>
                        <li><strong>Integration Capabilities:</strong> RESTful API endpoints and webhook support for integration with third-party systems, learning management systems, HR platforms, and calendar applications</li>
                        <li><strong>Mobile Optimization:</strong> Progressive Web App (PWA) functionality allowing installation on mobile devices for offline-capable attendance scanning and submission</li>
                    </ul>
                    <p>ScanIn serves as a technology platform and service provider, offering the tools and infrastructure necessary for attendance management. While we provide comprehensive features and security measures, we do not control or dictate how organizations configure their attendance policies, interpret collected data, or make decisions based on attendance records. Organizations retain full autonomy over their attendance policies, data usage, and compliance requirements.</p>
                    <p>The Service is continuously evolving, with regular updates, feature enhancements, and performance improvements. We reserve the right to modify, enhance, or discontinue specific features while maintaining the core functionality of attendance tracking and management.</p>
                </section>

                <section>
                    <h2>Eligibility</h2>
                    <p>You must be at least the minimum legal age in your jurisdiction or have authorization from a supervising organization to use the Service.</p>
                    <p>If you are using ScanIn as part of a school, company, or event, your access may be governed by that organization's policies.</p>
                </section>

                <section>
                    <h2>User Accounts</h2>
                    <p>Certain features and functionalities of the ScanIn Service require the creation and maintenance of user accounts. Account registration enables personalized access, role-based permissions, and secure data management across sessions and organizations.</p>
                    <p><strong>Account Creation Process:</strong> When registering for an account, you must provide accurate, current, and complete information as requested in the registration form. This typically includes your email address, display name, organizational affiliation, and role designation. You may also be required to verify your email address and set up secure authentication credentials.</p>
                    <p><strong>Account Security Responsibilities:</strong> You are solely responsible for maintaining the confidentiality and security of your account credentials, including passwords, security questions, and any two-factor authentication methods. You agree to:</p>
                    <ul>
                        <li>Use strong, unique passwords that meet our security requirements</li>
                        <li>Enable two-factor authentication when available</li>
                        <li>Never share your login credentials with others</li>
                        <li>Log out of your account when using shared or public devices</li>
                        <li>Immediately notify us of any suspected unauthorized access or security breaches</li>
                        <li>Keep your contact information and account details current and accurate</li>
                    </ul>
                    <p><strong>Account Usage and Activity:</strong> You are fully responsible for all activities that occur under your account, whether authorized by you or not. This includes attendance submissions, data access, configuration changes, and any other actions performed through your account. Organizations may designate multiple administrators who can manage user accounts within their organization.</p>
                    <p><strong>Account Types and Permissions:</strong> ScanIn supports various account types with different permission levels:</p>
                    <ul>
                        <li><strong>Organization Administrators:</strong> Full access to manage users, sessions, QR codes, and reports</li>
                        <li><strong>Moderators:</strong> Limited administrative access for specific functions</li>
                        <li><strong>Members:</strong> Standard users who can submit attendance and view assigned data</li>
                        <li><strong>Guests:</strong> Limited access for one-time or temporary attendance submissions</li>
                    </ul>
                    <p><strong>Account Suspension and Termination:</strong> We reserve the right to suspend, restrict, or terminate your account at any time for violations of these Terms, suspicious activity, or at the request of your organization. You may also request account deletion at any time. Upon termination, your access to the Service will cease, though certain data may be retained as required by law or for legitimate business purposes.</p>
                    <p><strong>Account Recovery:</strong> If you forget your password or lose access to your account, you must use the provided recovery mechanisms. We cannot guarantee account recovery if proper security measures were not followed or if account information is incomplete.</p>
                </section>

                <section>
                    <h2>Acceptable Use</h2>
                    <p>Your use of the ScanIn Service is subject to specific acceptable use guidelines designed to maintain system integrity, protect user privacy, ensure fair access, and comply with applicable laws and regulations. These guidelines apply to all users, regardless of their role or organizational affiliation.</p>
                    <p><strong>Prohibited Activities:</strong> You expressly agree that you will not, under any circumstances:</p>
                    <ul>
                        <li><strong>Falsification of Attendance Records:</strong> Submit, create, or facilitate the submission of false, inaccurate, misleading, or fraudulent attendance records, including but not limited to proxy attendance submissions, automated submissions, or submissions made on behalf of others without proper authorization</li>
                        <li><strong>Security Bypass Attempts:</strong> Attempt to circumvent, bypass, disable, or interfere with any security measures, authentication protocols, verification processes, geofencing restrictions, device validation mechanisms, or other protective controls implemented by ScanIn</li>
                        <li><strong>Credential Misuse:</strong> Share, transfer, sell, rent, or otherwise disclose your account credentials, access tokens, or authentication information to any third party; use another user's credentials without explicit authorization; or maintain multiple accounts for the purpose of circumventing system limitations</li>
                        <li><strong>System Interference:</strong> Engage in any activity that disrupts, degrades, or interferes with the proper functioning of the Service, including but not limited to distributed denial-of-service attacks, excessive API calls, intentional introduction of malware, viruses, or other harmful code</li>
                        <li><strong>Reverse Engineering:</strong> Attempt to reverse engineer, decompile, disassemble, or otherwise derive the source code, algorithms, or underlying technology of the Service; use automated tools to scrape, crawl, or extract data from the Service without explicit permission</li>
                        <li><strong>Unlawful Activities:</strong> Use the Service for any illegal purpose, including but not limited to fraud, harassment, defamation, violation of intellectual property rights, transmission of illegal content, or violation of any applicable local, state, national, or international law</li>
                        <li><strong>Excessive Resource Usage:</strong> Consume system resources disproportionately, including but not limited to generating excessive reports, performing bulk operations that impact system performance, or creating an unreasonable number of QR codes or sessions</li>
                        <li><strong>Data Misuse:</strong> Access, collect, or use personal data of other users without proper authorization; violate data protection laws; or use the Service to collect data for purposes other than legitimate attendance management</li>
                        <li><strong>Impersonation:</strong> Impersonate any person or entity, including ScanIn staff, other users, or representatives of organizations; create false accounts or misrepresent your affiliation with any organization</li>
                        <li><strong>Commercial Exploitation:</strong> Use the Service for commercial purposes without explicit written permission from ScanIn, including but not limited to reselling access, using the Service as part of a commercial product, or competing directly with ScanIn</li>
                    </ul>
                    <p><strong>Permitted Uses:</strong> Subject to these Terms, you may use the Service solely for legitimate attendance tracking and management purposes within your organization or authorized context. This includes creating sessions, generating QR codes, submitting attendance, viewing reports, and managing users within your permitted scope.</p>
                    <p><strong>Monitoring and Enforcement:</strong> ScanIn reserves the right to monitor usage patterns, investigate suspected violations, and take appropriate action including but not limited to account suspension, data removal, or legal action. We may also implement technical measures to detect and prevent prohibited activities.</p>
                    <p><strong>Reporting Violations:</strong> If you become aware of any violation of these acceptable use guidelines, you agree to promptly report it to ScanIn through the designated channels.</p>
                </section>

                <section>
                    <h2>Attendance Integrity</h2>
                    <p>ScanIn may use tools such as:</p>
                    <ul>
                        <li>QR code validation</li>
                        <li>Form verification</li>
                        <li>Timestamp logging</li>
                        <li>Device/session verification</li>
                        <li>Location validation (if enabled)</li>
                    </ul>
                    <p>Users agree not to attempt to circumvent these mechanisms.</p>
                    <p>Fraudulent attendance submissions may result in account suspension or reporting to the relevant organization.</p>
                </section>

                <section>
                    <h2>Administrator Control</h2>
                    <p>Organizations and administrators using ScanIn may:</p>
                    <ul>
                        <li>Configure attendance requirements</li>
                        <li>Define form fields</li>
                        <li>Set session rules</li>
                        <li>Access attendance data and reports</li>
                        <li>Manage user roles</li>
                    </ul>
                    <p>ScanIn is not responsible for how administrators configure or interpret attendance data.</p>
                </section>

                <section>
                    <h2>Intellectual Property</h2>
                    <p>All ScanIn software, branding, and content are owned by or licensed to ScanIn.</p>
                    <p>Users may not:</p>
                    <ul>
                        <li>Copy or redistribute the software</li>
                        <li>Modify or create derivative works</li>
                        <li>Use branding without permission</li>
                    </ul>
                    <p>Organizations retain ownership of the data they collect.</p>
                </section>

                <section>
                    <h2>Service Availability</h2>
                    <p>We aim for reliable service but do not guarantee uninterrupted access.</p>
                    <p>The Service may experience:</p>
                    <ul>
                        <li>Maintenance downtime</li>
                        <li>Technical issues</li>
                        <li>Network disruptions</li>
                        <li>Feature changes</li>
                    </ul>
                    <p>We may update, modify, or discontinue features at any time.</p>
                </section>

                <section>
                    <h2>Data and Privacy</h2>
                    <p>Use of the Service is also governed by our Privacy Policy.</p>
                    <p>By using ScanIn, you acknowledge that data is processed as described in that policy.</p>
                </section>

                <section>
                    <h2>Limitation of Liability</h2>
                    <p>To the fullest extent permitted by law, ScanIn is provided "as is."</p>
                    <p>We are not liable for:</p>
                    <ul>
                        <li>Missed or inaccurate attendance records</li>
                        <li>Loss of data due to user or network issues</li>
                        <li>Decisions made based on attendance reports</li>
                        <li>Indirect or consequential damages</li>
                        <li>Loss of profits, opportunities, or reputation</li>
                    </ul>
                </section>

                <section>
                    <h2>Indemnification</h2>
                    <p>You agree to indemnify and hold ScanIn harmless from claims arising from:</p>
                    <ul>
                        <li>Your misuse of the Service</li>
                        <li>Violation of these Terms</li>
                        <li>Fraudulent attendance submissions</li>
                        <li>Breach of applicable laws</li>
                    </ul>
                </section>

                <section>
                    <h2>Termination</h2>
                    <p>We may suspend or terminate access if:</p>
                    <ul>
                        <li>These Terms are violated</li>
                        <li>Fraud or misuse is detected</li>
                        <li>Required by law or security concerns</li>
                    </ul>
                    <p>Users may stop using the Service at any time.</p>
                </section>

                <section>
                    <h2>Changes to Terms</h2>
                    <p>We may update these Terms from time to time.</p>
                    <p>Updated Terms will be posted with a new "Last Updated" date.</p>
                    <p>Continued use indicates acceptance.</p>
                </section>

                <section>
                    <h2>Governing Law</h2>
                    <p>These Terms are governed by the laws of:</p>
                    <p>[Insert Country/Jurisdiction]</p>
                    <p>Disputes shall be resolved in the appropriate courts of that jurisdiction unless otherwise required by law.</p>
                </section>

                <section>
                    <h2>Contact Information</h2>
                    <p>For questions about these Terms:</p>
                    <p><strong>Email:</strong> [Insert Contact Email]</p>
                    <p><strong>Organization/Company Name:</strong> [Insert Name]</p>
                </section>
            </div>
        </div>
    );
}

export default UserAgreement;
