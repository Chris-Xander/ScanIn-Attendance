import React from "react";
import '../page_styles/PrivacyPolicy.css';

function PrivacyPolicy() {
    return(
        <div className="privacyMain">
            <div className="privacyHeader">
                <h1>Privacy Policy - ScanIn (Attendid)</h1>
                <p><strong>Effective Date:</strong> [25/12/2025]</p>
                <p><strong>Last Updated:</strong> [09/02/2026]</p>
            </div>

            <div className="privacyContent">
                <section>
                    <h2> Introduction</h2>
                    <p>Welcome to ScanIn (also known as Attendid) ("ScanIn," "we," "our," or "us").</p>
                    <p>ScanIn is a digital attendance management platform that enables organizations, institutions, and event administrators to record and manage attendance using QR codes, forms, and device-based verification.</p>
                    <p>This Privacy Policy explains how we collect, use, store, and protect personal information when you use the ScanIn web application and related services (the "Service").</p>
                    <p>By using ScanIn, you agree to the collection and use of information in accordance with this Privacy Policy.</p>
                </section>

                <section>
                    <h2> Who Controls Your Data</h2>
                    <p>In many cases, the organization or administrator that invited you to use ScanIn (such as a school, company, or event organizer) acts as the primary controller of attendance-related data.</p>
                    <p>ScanIn acts as a service provider and data processor, providing tools to collect and manage attendance data on behalf of those organizations.</p>
                    <p>Questions about specific attendance records should first be directed to your organization or administrator.</p>
                </section>

                <section>
                    <h2> Information We Collect</h2>
                    <p>We collect information necessary to provide attendance tracking services.</p>

                    <h3> Personal Information</h3>
                    <p>Depending on how an administrator configures a session or QR form, we may collect:</p>
                    <ul>
                        <li>Full name</li>
                        <li>Email address</li>
                        <li>Phone number</li>
                        <li>Organization or role information</li>
                        <li>Profile details</li>
                        <li>Responses submitted through attendance forms</li>
                        <li>Account registration details (for registered users)</li>
                    </ul>
                    <p>Your Administrators determine which fields are required for their events or sessions.Hence the data we collect is reli</p>

                    <h3> Account Information</h3>
                    <p>If you create an account, we may collect:</p>
                    <ul>
                        <li>Email address</li>
                        <li>Display name</li>
                        <li>Role (e.g., admin or member)</li>
                        <li>Profile photo (if provided)</li>
                        <li>Authentication data via Firebase Authentication</li>
                    </ul>
                    <p>Passwords are handled securely by our authentication provider and are not visible to us in plain text.</p>

                    <h3> Device and Technical Information</h3>
                    <p>To maintain system integrity and reduce fraudulent attendance submissions, we may collect:</p>
                    <ul>
                        <li>Device identifiers or device fingerprints</li>
                        <li>Browser type and version</li>
                        <li>Operating system</li>
                        <li>IP address</li>
                        <li>Session logs</li>
                        <li>Timestamps of activity</li>
                        <li>Application usage data</li>
                    </ul>
                    <p>This information supports security features such as session validation and device-based attendance verification.</p>

                    <h3> Location Information</h3>
                    <p>If enabled by an administrator:</p>
                    <ul>
                        <li>Approximate location data may be processed for geofencing validation</li>
                    </ul>
                    <p>Location is used only at the time of attendance verification. We do not continuously track user location.</p>

                    <h3> Camera Access</h3>
                    <p>Camera access may be requested solely for QR code scanning. ScanIn does not record or store video or images from your camera.</p>
                </section>

                <section>
                    <h2> How We Use Information</h2>
                    <p>We use collected data to:</p>
                    <ul>
                        <li>Record and manage attendance</li>
                        <li>Verify session participation</li>
                        <li>Prevent fraudulent or duplicate check-ins</li>
                        <li>Generate attendance reports and analytics</li>
                        <li>Maintain system security and performance</li>
                        <li>Provide customer support</li>
                        <li>Improve application functionality</li>
                    </ul>
                    <p>We do not sell or rent personal data.</p>
                </section>

                <section>
                    <h2> Legal Bases for Processing (GDPR-Style Transparency)</h2>
                    <p>Where applicable, processing is based on:</p>
                    <ul>
                        <li>Legitimate interests (attendance tracking and fraud prevention)</li>
                        <li>Performance of a service requested by organizations</li>
                        <li>User or organizational consent</li>
                        <li>Compliance with legal obligations</li>
                    </ul>
                </section>

                <section>
                    <h2> How Information Is Shared</h2>
                    <p>We may share data with:</p>

                    <h3> Your Organization or Administrator</h3>
                    <p>Attendance data is accessible to the organization managing the session.</p>

                    <h3> Service Providers</h3>
                    <p>We use trusted third-party services such as:</p>
                    <ul>
                        <li>Firebase (authentication, database, storage, analytics)</li>
                        <li>Hosting providers</li>
                    </ul>
                    <p>These providers process data under security and confidentiality obligations.</p>

                    <h3> Legal Requirements</h3>
                    <p>We may disclose information if required by law or valid legal process.</p>
                </section>

                <section>
                    <h2> Data Storage and Security</h2>
                    <p>We use reputable cloud infrastructure and reasonable safeguards to protect data.</p>
                    <p>Security measures include:</p>
                    <ul>
                        <li>Authentication controls</li>
                        <li>Encrypted connections (HTTPS)</li>
                        <li>Firestore security rules</li>
                        <li>Role-based access restrictions</li>
                    </ul>
                    <p>However, no digital system is completely secure, and users acknowledge this risk.</p>
                </section>

                <section>
                    <h2> Data Retention</h2>
                    <p>Data is retained only as long as necessary for:</p>
                    <ul>
                        <li>Attendance reporting</li>
                        <li>Organizational needs</li>
                        <li>Legal or compliance purposes</li>
                        <li>Security and fraud prevention</li>
                    </ul>
                    <p>Retention periods are typically determined by the organization using ScanIn.</p>
                </section>

                <section>
                    <h2> User Rights</h2>
                    <p>Depending on your jurisdiction, you may have rights to:</p>
                    <ul>
                        <li>Access your data</li>
                        <li>Request corrections</li>
                        <li>Request deletion</li>
                        <li>Restrict certain processing</li>
                    </ul>
                    <p>Requests should be directed to your organization administrator or to us using the contact details below.</p>
                </section>

                <section>
                    <h2> International Data Transfers</h2>
                    <p>Data may be processed on servers located outside your country.</p>
                    <p>We take reasonable steps to ensure appropriate safeguards are in place for cross-border data transfers.</p>
                </section>

                <section>
                    <h2> Children's Privacy</h2>
                    <p>ScanIn is not intended for unsupervised use by children under the age of 16.</p>
                    <p>Where used by schools or institutions, the organization is responsible for appropriate consent and supervision.</p>
                </section>

                <section>
                    <h2> Third-Party Links</h2>
                    <p>ScanIn may contain links to third-party services. We are not responsible for their privacy practices.</p>
                </section>

                <section>
                    <h2> Changes to This Policy</h2>
                    <p>We may update this Privacy Policy periodically.</p>
                    <p>Updated versions will be posted with a revised "Last Updated" date.</p>
                    <p>Continued use of the Service indicates acceptance of updates.</p>
                </section>

                <section>
                    <h2> Contact Information</h2>
                    <p>For privacy-related inquiries:</p>
                    <p><strong>Email:</strong> [Insert Contact Email]</p>
                    <p><strong>Organization Name:</strong> [Your Company/Project Name]</p>
                </section>
            </div>
        </div>
    )
}

export default PrivacyPolicy;
