import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import './AdminReports.css';

function AdminReports() {
    const { currentUser } = useAuth();
    const [qrGateReports, setQrGateReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const downloadQRDataAsExcel = async (qrCodeId, qrName) => {
        try {
            if (!currentUser) {
                alert('You must be logged in to download reports.');
                return;
            }
            const formRef = collection(db, 'formSubmitData');
            const formQuery = query(formRef, where('qrCodeId', '==', qrCodeId), where('adminId', '==', currentUser.uid));
            const snapshot = await getDocs(formQuery);

            const filtered = snapshot.docs.map(d => ({
                ...d.data().formData,
                memberId: d.data().memberId || "N/A",
                timestamp: d.data().timestamp,
            }));

            if (filtered.length === 0) {
                console.log('No responses found for QR Code');
                alert('No responses found to download for this QR Code.');
                return;
            }

            // Convert to Excel sheet
            const worksheet = XLSX.utils.json_to_sheet(filtered);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");

            const fileName = `${qrName}_Responses.xlsx`;

            XLSX.writeFile(workbook, fileName);
        } catch (err) {
            console.error("There was an error downloading the responses: ", err);
            alert("Failed to generate report.");
        }
    };

    useEffect(() => {
        fetchQrGateReports();
    }, []);

    const fetchQrGateReports = async () => {
        try {
            if (!currentUser) {
                console.warn('No authenticated user found.');
                setQrGateReports([]);
                return;
            }
            const qrGateReportsRef = collection(db, 'qrGateReports');
            const reportsQuery = query(qrGateReportsRef, where('adminId', '==', currentUser.uid));
            const snapshot = await getDocs(reportsQuery);
            const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQrGateReports(reports);
        } catch (error) {
            console.error('Error fetching QR Gate reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewQrCode = (report) => {
        // Navigate to the QR code scan URL
        window.open(`/scan-form/${report.qrCodeId}`, '_blank');
    };

    const deleteQrGateReport = async (reportId, adminId) => {
        if (!currentUser || currentUser.uid !== adminId) {
            alert('You do not have permission to delete this report.');
            return;
        }
        if (window.confirm('Are you sure you want to delete this QR-Gate report?')) {
            try {
                await deleteDoc(doc(db, 'qrGateReports', reportId));
                fetchQrGateReports(); // Refresh the list
            } catch (error) {
                console.error('Error deleting QR-Gate report:', error);
                alert('Failed to delete the report. Please try again.');
            }
        }
    };

    const toggleActiveStatus = async (reportId, currentStatus) => {
        try {
            await updateDoc(doc(db, 'qrGateReports', reportId), {
                isActive: !currentStatus
            });
            fetchQrGateReports(); // Refresh the list
        } catch (error) {
            console.error('Error updating QR-Gate report status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    return (
        <div className="admin-reports-container">
            <h2>Gate Report</h2>
            <p>View and manage QR-Gate reports for all created QR codes.</p>

            {loading ? (
                <div className="loading-state">
                    <p>Loading QR-Gate reports...</p>
                </div>
            ) : qrGateReports.length === 0 ? (
                <div className="empty-state">
                    <p>No QR-Gate reports found. Create a QR code first to see reports here.</p>
                </div>
            ) : (
                <div className="qr-gate-reports-list">
                    {qrGateReports.map(report => (
                        <div key={report.id} className="qr-gate-report-item">
                            <div className="report-info">
                                <h3>{report.name}</h3>
                                <p><strong>Description:</strong> {report.description || 'No description'}</p>
                                <p><strong>Location:</strong> {report.location || 'Not specified'}</p>
                                <p><strong>Event Type:</strong> {report.eventType || 'Not specified'}</p>
                                <p><strong>Status:</strong> {report.isActive ? 'Active' : 'Inactive'}</p>
                                <p><strong>Total Scans:</strong> {report.totalScans || 0}</p>
                                <p><strong>Created:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                                {report.lastScanAt && (
                                    <p><strong>Last Scan:</strong> {new Date(report.lastScanAt).toLocaleString()}</p>
                                )}
                                {report.requiresForm && (
                                    <div className="form-fields-info">
                                        <strong>Form Fields:</strong>
                                        <ul>
                                            {report.formFields.map(field => (
                                                <li key={field}>{field}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="report-actions">
                                <button
                                    className="view-btn"
                                    onClick={() => downloadQRDataAsExcel(report.qrCodeId, report.name)}
                                >
                                    Download Responses
                                </button>
                                <button
                                    className="toggle-status-btn"
                                    onClick={() => toggleActiveStatus(report.id, report.isActive)}
                                >
                                    {report.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteQrGateReport(report.id, report.adminId)}
                                    disabled={currentUser?.uid !== report.adminId}
                                    title={currentUser?.uid !== report.adminId ? "You do not have permission to delete this report." : ""}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Report Filters - Keep existing functionality */}
            <div className="admin-db-form-container">
                <div className="admin-db-form">
                    <h3>Generate Report</h3>
                    <div className="db-date-fields">
                        <div className="db-date-field">
                            <label htmlFor="startDate">Start Date:</label>
                            <input
                                type="date"
                                id="startDate"
                            />
                        </div>
                        <div className="db-date-field">
                            <label htmlFor="endDate">End Date:</label>
                            <input
                                type="date"
                                id="endDate"
                            />
                        </div>
                    </div>

                    <label htmlFor="reportType">Report Type:</label>
                    <select id="reportType">
                        <option value="attendance">Attendance Report</option>
                        <option value="user-activity">User Activity</option>
                        <option value="qr-usage">QR Code Usage</option>
                    </select>

                    <div className="admin-db-btns">
                        <button className="admin-db-open-btn">
                            Generate Report
                        </button>
                        <button className="admin-db-delete-btn">
                            Export Data
                        </button>
                    </div>
                </div>
            </div>

            {/* Sample Report Table */}
            <div className="db-section-spacing">
                <h3>Recent Activity</h3>
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="4" style={{textAlign: 'center', color: '#666'}}>
                                No data available
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminReports;