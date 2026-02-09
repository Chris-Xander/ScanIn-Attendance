import React from 'react';
import "../page_styles/DataRetentionPolicy.css"

function DataRetentionPolicy() {
    return (
        <div className="data-retention-main">
            <div className="data-retention-header">
                <h1>Data Retention Policy for ScanIn (Attendid)</h1>
                <p><strong>Effective Date:</strong> [25/12/2025]</p>
                <p><strong>Last Updated:</strong> [02/01/2026]</p>
            </div>

            <div className="data-retention-content">
                <section>
                    <h2>Introduction</h2>
                    <p>This Data Retention Policy explains how ScanIn (also known as Attendid) ("ScanIn," "we," "our," or "us") retains, stores, and deletes data collected through our attendance management platform.</p>
                    <p>We are committed to retaining data only for as long as necessary to provide our services, meet organizational needs, and comply with legal obligations. This policy outlines our data retention practices, including specific retention periods for different types of data, deletion procedures, and the factors that influence how long we keep information.</p>
                    <p>Our approach to data retention is guided by principles of data minimization, privacy by design, and compliance with applicable data protection laws. We regularly review and update our retention practices to ensure they remain appropriate and compliant.</p>
                    <p>This policy applies to all data collected, processed, or stored through the ScanIn platform, whether collected directly from users or generated through system operations.</p>
                </section>

                <section>
                    <h2>Scope</h2>
                    <p>This Data Retention Policy applies to all data collected, processed, or stored through the ScanIn platform, including but not limited to:</p>
                    <ul>
                        <li><strong>Web Application Data:</strong> Information collected through the main ScanIn web interface, including user interactions, form submissions, and system usage data</li>
                        <li><strong>Progressive Web App (PWA) Data:</strong> Data collected through the mobile-optimized PWA version, including offline usage and synchronization data</li>
                        <li><strong>QR Code Sessions:</strong> Attendance data captured through QR code scanning, including timestamps, location data, and device information</li>
                        <li><strong>Form-Based Submissions:</strong> Information collected through custom attendance forms, surveys, and registration processes</li>
                        <li><strong>User Account Data:</strong> Registration information, profile details, authentication data, and account management records</li>
                        <li><strong>System and Security Logs:</strong> Technical logs, error reports, security events, and system performance data</li>
                        <li><strong>Analytics and Usage Data:</strong> Aggregated usage statistics, feature utilization metrics, and performance analytics</li>
                    </ul>
                    <p>This policy covers data stored in our primary systems, backup systems, and any third-party services we use for data processing or storage.</p>
                </section>

                <section>
                    <h2>General Retention Principle</h2>
                    <p>ScanIn follows the fundamental principle of data minimization as outlined in modern data protection regulations. This means we are committed to:</p>
                    <ul>
                        <li><strong>Minimal Retention:</strong> Retaining personal data only for the minimum period necessary to fulfill the purposes for which it was collected</li>
                        <li><strong>Purpose Limitation:</strong> Using retained data only for the specific purposes for which it was originally collected</li>
                        <li><strong>Data Avoidance:</strong> Avoiding the collection and retention of unnecessary personal data whenever possible</li>
                        <li><strong>Regular Review:</strong> Periodically reviewing retained data to ensure it is still necessary and relevant</li>
                        <li><strong>Secure Deletion:</strong> Implementing secure deletion procedures when data is no longer needed</li>
                    </ul>
                    <p>In many cases, the retention periods for attendance data are determined by the organization or administrator using ScanIn, rather than by ScanIn itself. Organizations may have their own policies regarding how long attendance records should be maintained based on their operational, legal, or compliance requirements.</p>
                    <p>We work closely with organizations to ensure that our retention practices align with their specific needs while maintaining compliance with applicable privacy laws and regulations.</p>
                </section>

                <section>
                    <h2>Categories of Data and Retention Periods</h2>
                    <p>ScanIn categorizes data based on its type, sensitivity, and purpose. Each category has specific retention periods designed to balance operational needs with privacy requirements. The following table outlines our standard retention periods:</p>

                    <table>
                        <thead>
                            <tr>
                                <th>Data Category</th>
                                <th>Retention Period</th>
                                <th>Rationale</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Account Information</strong><br/>Name, email, role, profile details</td>
                                <td>Account active + 30 days after deletion</td>
                                <td>Support account management and recovery</td>
                            </tr>
                            <tr>
                                <td><strong>Attendance Records</strong><br/>Check-ins, timestamps, form responses</td>
                                <td>6-36 months (organization-determined)</td>
                                <td>Organizational record-keeping and reporting</td>
                            </tr>
                            <tr>
                                <td><strong>Device & Session Logs</strong><br/>Device fingerprints, IP addresses, session data</td>
                                <td>30-90 days</td>
                                <td>Security monitoring and fraud prevention</td>
                            </tr>
                            <tr>
                                <td><strong>Analytics Data</strong><br/>Usage statistics, performance metrics</td>
                                <td>26 months (anonymized)</td>
                                <td>Service improvement and optimization</td>
                            </tr>
                            <tr>
                                <td><strong>Security Logs</strong><br/>Authentication attempts, access logs</td>
                                <td>180 days</td>
                                <td>Security investigations and compliance</td>
                            </tr>
                            <tr>
                                <td><strong>Backup Data</strong><br/>System backups and archives</td>
                                <td>90 days</td>
                                <td>Disaster recovery and data restoration</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3>Account Information</h3>
                    <p>User account data includes registration details, profile information, and authentication credentials. This data is retained to:</p>
                    <ul>
                        <li>Maintain active user accounts and provide continuous service</li>
                        <li>Support account recovery and password reset processes</li>
                        <li>Ensure proper user identification and role management</li>
                        <li>Comply with account verification and security requirements</li>
                    </ul>
                    <p>Retention: Account data is stored while the account remains active. After account deletion, data is retained for 30 days to allow for recovery requests, then permanently deleted or anonymized.</p>

                    <h3>Attendance Records</h3>
                    <p>Attendance data forms the core of our service and includes check-in records, timestamps, form responses, and session participation details. This data is typically retained according to organizational policies rather than fixed ScanIn policies.</p>
                    <ul>
                        <li><strong>Standard Retention:</strong> 6-36 months depending on organizational requirements</li>
                        <li><strong>Educational Institutions:</strong> Often 1-2 years for academic record-keeping</li>
                        <li><strong>Corporate Events:</strong> May be retained for 6-12 months for reporting purposes</li>
                        <li><strong>Custom Retention:</strong> Organizations can request shorter or longer retention periods</li>
                    </ul>
                    <p>Administrators can request early deletion of attendance data through the ScanIn interface or by contacting support.</p>

                    <h3>Device and Session Logs</h3>
                    <p>Technical logs help maintain system security and prevent fraudulent activities. This includes device fingerprints, IP addresses, session identifiers, and access patterns.</p>
                    <ul>
                        <li><strong>Security Monitoring:</strong> Detect and prevent unauthorized access attempts</li>
                        <li><strong>Fraud Prevention:</strong> Identify suspicious patterns and duplicate attendance submissions</li>
                        <li><strong>System Diagnostics:</strong> Troubleshoot technical issues and performance problems</li>
                        <li><strong>Compliance Auditing:</strong> Maintain records for regulatory compliance</li>
                    </ul>
                    <p>Retention: 30-90 days, after which logs are automatically archived or deleted. Critical security events may be retained longer if they relate to ongoing investigations.</p>

                    <h3>Analytics Data</h3>
                    <p>Usage analytics help us improve the service and understand user behavior patterns. This data is typically aggregated and anonymized to protect individual privacy.</p>
                    <ul>
                        <li><strong>Feature Usage:</strong> Which features are most popular and need improvement</li>
                        <li><strong>Performance Metrics:</strong> System speed, error rates, and user experience data</li>
                        <li><strong>User Journey Analysis:</strong> How users navigate through the application</li>
                        <li><strong>Device Compatibility:</strong> Browser and device usage patterns</li>
                    </ul>
                    <p>Retention: Analytics data is retained for 26 months (following industry standards for web analytics) and is automatically anonymized or aggregated to prevent individual identification.</p>
                </section>

                <section>
                    <h2>Deletion and Anonymization</h2>
                    <p>ScanIn implements comprehensive procedures for data deletion and anonymization when retention periods expire or when data is no longer needed. Our deletion processes ensure that data is permanently and irreversibly removed from our systems.</p>

                    <h3>Deletion Triggers</h3>
                    <p>Data deletion is initiated when:</p>
                    <ul>
                        <li><strong>Retention Period Expires:</strong> Automatic deletion based on predefined retention schedules</li>
                        <li><strong>Account Deletion:</strong> User requests account removal through the application</li>
                        <li><strong>Organizational Request:</strong> Administrator requests deletion of specific data sets</li>
                        <li><strong>Legal Requirements:</strong> Court orders or legal obligations require data removal</li>
                        <li><strong>Service Termination:</strong> User or organization ends their relationship with ScanIn</li>
                        <li><strong>Data No Longer Needed:</strong> Periodic review determines data is obsolete</li>
                    </ul>

                    <h3>Deletion Methods</h3>
                    <p>We employ industry-standard deletion methods appropriate to each data type and storage system:</p>
                    <ul>
                        <li><strong>Database Deletion:</strong> Permanent removal from primary databases with transaction logging</li>
                        <li><strong>File System Deletion:</strong> Secure deletion of files and attachments</li>
                        <li><strong>Backup Cleanup:</strong> Removal from backup systems and archival storage</li>
                        <li><strong>Cache Clearing:</strong> Removal from temporary caches and CDN systems</li>
                        <li><strong>Third-Party Data:</strong> Coordination with service providers for data removal</li>
                    </ul>

                    <h3>Anonymization</h3>
                    <p>In some cases, rather than complete deletion, we may anonymize data to remove personally identifiable information while retaining useful aggregate data for analysis:</p>
                    <ul>
                        <li><strong>Data Masking:</strong> Replacing identifiable information with pseudonyms</li>
                        <li><strong>Aggregation:</strong> Combining data into statistical summaries</li>
                        <li><strong>Hashing:</strong> One-way encryption that prevents reverse identification</li>
                        <li><strong>Generalization:</strong> Reducing data precision (e.g., dates to months)</li>
                    </ul>
                    <p>Anonymized data may be retained indefinitely for research, system improvement, or statistical purposes, as it no longer constitutes personal data under applicable privacy laws.</p>

                    <h3>Deletion Confirmation</h3>
                    <p>Upon request, users and organizations receive confirmation of data deletion. For large-scale deletions, we provide detailed reports showing what data was removed and when the deletion was completed.</p>
                </section>

                <section>
                    <h2>Administrator-Controlled Data</h2>
                    <p>Organizations and administrators using ScanIn have significant control over the data collected through their attendance sessions and user accounts. This reflects the principle that organizations, not ScanIn, are typically the primary data controllers for attendance information.</p>

                    <h3>Administrator Rights</h3>
                    <p>Administrators can:</p>
                    <ul>
                        <li><strong>Configure Retention Settings:</strong> Set custom retention periods for attendance data within their organization</li>
                        <li><strong>Request Data Deletion:</strong> Initiate deletion of specific attendance records or user data</li>
                        <li><strong>Export Data:</strong> Download attendance data before deletion if needed</li>
                        <li><strong>Manage User Accounts:</strong> Delete user accounts and associated data</li>
                        <li><strong>Control Data Collection:</strong> Configure what data is collected through forms and sessions</li>
                    </ul>

                    <h3>Data Ownership</h3>
                    <p>While ScanIn provides the platform and infrastructure, organizations typically own the attendance data collected through their sessions. This includes:</p>
                    <ul>
                        <li><strong>Attendance Records:</strong> Check-in data, form responses, and participation records</li>
                        <li><strong>User Data:</strong> Information about members and participants in their events</li>
                        <li><strong>Session Configuration:</strong> Settings and rules for their attendance sessions</li>
                        <li><strong>Reports and Analytics:</strong> Generated reports and attendance statistics</li>
                    </ul>

                    <h3>User Data Requests</h3>
                    <p>For data deletion or access requests, users should first contact their organization administrator, as the organization is typically best positioned to handle such requests. ScanIn will assist organizations in fulfilling user rights requests as needed.</p>
                </section>

                <section>
                    <h2>Legal and Compliance Retention</h2>
                    <p>Certain legal and regulatory requirements may necessitate retaining data beyond our standard retention periods. In such cases, we balance privacy rights with legal obligations.</p>

                    <h3>Legal Retention Requirements</h3>
                    <p>We may retain data longer when required by:</p>
                    <ul>
                        <li><strong>Applicable Laws:</strong> Data protection, privacy, and consumer protection laws</li>
                        <li><strong>Legal Proceedings:</strong> Ongoing lawsuits, investigations, or legal disputes</li>
                        <li><strong>Regulatory Requirements:</strong> Industry-specific regulations and compliance standards</li>
                        <li><strong>Fraud Investigations:</strong> Active investigations into fraudulent activities</li>
                        <li><strong>Security Incidents:</strong> Data breaches or security incidents requiring forensic analysis</li>
                        <li><strong>Tax and Financial Records:</strong> Financial transactions and billing information</li>
                    </ul>

                    <h3>Subpoenas and Legal Requests</h3>
                    <p>If we receive a valid legal request (such as a subpoena, court order, or search warrant), we may retain specific data for the duration required by the legal process. We will notify affected users or organizations when legally permitted to do so.</p>

                    <h3>Compliance Documentation</h3>
                    <p>For regulatory compliance purposes, we maintain records demonstrating our compliance with data retention requirements, including:</p>
                    <ul>
                        <li><strong>Audit Logs:</strong> Records of data access, modification, and deletion activities</li>
                        <li><strong>Retention Schedules:</strong> Documentation of retention periods and deletion procedures</li>
                        <li><strong>Legal Holds:</strong> Records of legal preservation requests and their implementation</li>
                    </ul>
                </section>

                <section>
                    <h2>Security of Retained Data</h2>
                    <p>All retained data is protected using comprehensive technical and organizational security measures designed to prevent unauthorized access, alteration, disclosure, or destruction.</p>

                    <h3>Technical Safeguards</h3>
                    <ul>
                        <li><strong>Encryption:</strong> Data encrypted at rest and in transit using industry-standard algorithms</li>
                        <li><strong>Access Controls:</strong> Role-based access control limiting data access to authorized personnel</li>
                        <li><strong>Authentication:</strong> Multi-factor authentication for administrative access</li>
                        <li><strong>Network Security:</strong> Firewalls, intrusion detection, and secure network architecture</li>
                        <li><strong>Data Segregation:</strong> Logical separation of data based on sensitivity and access requirements</li>
                    </ul>

                    <h3>Organizational Safeguards</h3>
                    <ul>
                        <li><strong>Staff Training:</strong> Regular training on data protection and privacy practices</li>
                        <li><strong>Access Monitoring:</strong> Logging and monitoring of data access and system activities</li>
                        <li><strong>Incident Response:</strong> Established procedures for responding to security incidents</li>
                        <li><strong>Regular Audits:</strong> Periodic security assessments and compliance reviews</li>
                        <li><strong>Vendor Management:</strong> Due diligence and oversight of third-party service providers</li>
                    </ul>

                    <h3>Data Backup and Recovery</h3>
                    <p>While we implement secure backup procedures, backup data is also subject to retention limits and secure deletion practices. Backup systems are designed to:</p>
                    <ul>
                        <li>Protect against data loss due to system failures or disasters</li>
                        <li>Enable timely data recovery in case of incidents</li>
                        <li>Comply with retention policies for backup data</li>
                        <li>Implement secure deletion of expired backup data</li>
                    </ul>
                </section>

                <section>
                    <h2>Data Retention Review Process</h2>
                    <p>ScanIn maintains a systematic process for reviewing and managing data retention to ensure ongoing compliance and appropriateness.</p>

                    <h3>Regular Reviews</h3>
                    <ul>
                        <li><strong>Annual Assessment:</strong> Comprehensive review of all retention schedules and procedures</li>
                        <li><strong>Quarterly Audits:</strong> Verification of deletion processes and retention compliance</li>
                        <li><strong>Systematic Cleanup:</strong> Automated processes to identify and delete expired data</li>
                        <li><strong>Policy Updates:</strong> Regular updates to retention policies based on legal and operational changes</li>
                    </ul>

                    <h3>Retention Schedule Management</h3>
                    <ul>
                        <li><strong>Documentation:</strong> Clear documentation of all retention periods and rationales</li>
                        <li><strong>Automation:</strong> Automated systems for tracking retention periods and initiating deletions</li>
                        <li><strong>Exception Handling:</strong> Processes for managing legal holds and extended retention</li>
                        <li><strong>Reporting:</strong> Regular reports on data retention compliance and deletion activities</li>
                    </ul>
                </section>

                <section>
                    <h2>Policy Updates</h2>
                    <p>This Data Retention Policy may be updated periodically to reflect changes in our practices, technologies, legal requirements, or service offerings.</p>
                    <p>When we make material changes to this policy, we will:</p>
                    <ul>
                        <li>Update the "Last Updated" date at the top of this page</li>
                        <li>Post the updated policy on our website</li>
                        <li>Notify users through in-app notifications or email when significant changes occur</li>
                        <li>Provide a summary of key changes when appropriate</li>
                    </ul>
                    <p>We encourage users and organizations to review this policy periodically to stay informed about our data retention practices.</p>
                    <p>Continued use of the ScanIn service after any changes to this policy constitutes acceptance of the updated terms.</p>
                </section>

                <section>
                    <h2>Contact Information</h2>
                    <p>If you have questions about this Data Retention Policy, our data retention practices, or need to request data deletion:</p>
                    <p><strong>Email:</strong> [Insert Contact Email]</p>
                    <p><strong>Service Name:</strong> ScanIn (Attendid)</p>
                    <p><strong>Response Time:</strong> We aim to respond to data retention inquiries within 30 days.</p>
                    <p>For urgent data deletion requests or privacy concerns, please contact us immediately.</p>
                    <p>Organizations should contact their account administrator for assistance with data management within their organization.</p>
                </section>
            </div>
        </div>
    );
}

export default DataRetentionPolicy;
