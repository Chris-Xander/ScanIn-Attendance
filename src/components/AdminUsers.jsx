import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { writeBatch, collection, addDoc, getDocs, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDocs as getAllDocs } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import QRCode from 'react-qr-code';
import { deleteSession } from '../cloud_functions/sessionService'
import './AdminUsers.css';

function AdminUsers() {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('members');
    const [members, setMembers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [sessionAttendance, setSessionAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [showSessionSelectModal, setShowSessionSelectModal] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const batch = writeBatch(db);


    // Session form state
    const [sessionForm, setSessionForm] = useState({
        name: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        maxParticipants: '',
        geofence: {
            latitude: '',
            longitude: '',
            radius: ''
        }
    });

    // Member registration state
    const [csvFile, setCsvFile] = useState(null);
    const [csvData, setCsvData] = useState([]);

    // QR Code modal state
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState(null);

    useEffect(() => {
        if (activeTab === 'members') {
            fetchMembers();
        } else if (activeTab === 'sessions') {
            fetchSessions();
        } else if (activeTab === 'dashboard') {
            fetchAttendanceLogs();
        }
    }, [activeTab]);

    const fetchMembers = async () => {
        try {
            const membersRef = collection(db, 'members');
            const q = query(membersRef, where('adminId', '==', currentUser.uid));
            const snapshot = await getDocs(q);
            const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMembers(membersData);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const fetchSessions = async () => {
        try {
            const sessionsRef = collection(db, 'sessions');
            const q = query(sessionsRef, where('adminId', '==', currentUser.uid));
            const snapshot = await getDocs(q);
            const sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSessions(sessionsData);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const fetchAttendanceLogs = async () => {
        try {
            const logsRef = collection(db, 'attendanceLogs');
            const q = query(logsRef, where('adminId', '==', currentUser.uid));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAttendanceLogs(logsData);
            });
            return unsubscribe;
        } catch (error) {
            console.error('Error fetching attendance logs:', error);
        }
    };

    const fetchSessionAttendance = async () => {
        try {
            const logsRef = collection(db, 'attendanceLogs');
            const q = query(logsRef, where('adminId', '==', currentUser.uid));
            const snapshot = await getDocs(q);
            const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Group logs by sessionId
            const grouped = logsData.reduce((acc, log) => {
                if (!acc[log.sessionId]) {
                    acc[log.sessionId] = [];
                }
                acc[log.sessionId].push(log);
                return acc;
            }, {});

            setSessionAttendance(grouped);
        } catch (error) {
            console.error('Error fetching session attendance:', error);
        }
    };

    const handleSessionSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);  
        try {
            const sessionId = `ses_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Generate QR code value with session ID
            const qrCodeValue = `${window.location.origin}${import.meta.env.BASE_URL}session-checkin/${sessionId}`;
            
            const sessionData = {
                ...sessionForm,
                adminId: currentUser.uid,
                sessionId, 
                qrCodeValue,
                createdAt: new Date(),
                isActive: true,
                attendanceCount: 0,
                geofence: {
                    latitude: sessionForm.geofence?.latitude ? parseFloat(sessionForm.geofence.latitude) : null,
                    longitude: sessionForm.geofence?.longitude ? parseFloat(sessionForm.geofence.longitude) : null,
                    radius: sessionForm.geofence?.radius ? parseFloat(sessionForm.geofence.radius) : null
                }
            };
            
            await addDoc(collection(db, 'sessions'), sessionData);
            
            setSessionForm({
                name: '',
                description: '',
                location: '',
                startDate: '',
                endDate: '',
                maxParticipants: '',
                geofence: {
                    latitude: '',
                    longitude: '',
                    radius: ''
                }
            });
            fetchSessions();
            alert('Session created successfully with QR code!');
        } catch (error) {
            console.error('Error creating session:', error);
            alert('Failed to create session');
        } finally {
            setLoading(false);
        }
    };

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCsvFile(file);
            const reader = new FileReader();
            reader.onload = (evt) => {
                const data = evt.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                setCsvData(jsonData);
            };
            reader.readAsBinaryString(file);
        }
    };

    const handleCsvSubmit = async () => {
        if (!csvData.length) {
            alert('Please upload a CSV file first');
            return;
        }

        setLoading(true);
        try {
            const membersRef = collection(db, 'members');
            const batch = [];
            const errors = [];
            const uniqueIdentifiers = new Set();

            for (let i = 0; i < csvData.length; i++) {
                const row = csvData[i];
                const name = row.name || row.Name;
                const email = row.email || row.Email || row.phone || row.Phone || row.contact || row.Contact;

                if (!name || !email) {
                    errors.push(`Row ${i + 1}: Missing required field(s) - Name: ${name || 'missing'}, Email/Phone: ${email || 'missing'}`);
                    continue;
                }

                // Check for uniqueness
                const uniqueId = email.toLowerCase();
                if (uniqueIdentifiers.has(uniqueId)) {
                    errors.push(`Row ${i + 1}: Duplicate identifier '${email}'`);
                    continue;
                }
                uniqueIdentifiers.add(uniqueId);

                const memberData = {
                    adminId: currentUser.uid,
                    name,
                    email: email.toLowerCase(),
                    phone: row.phone || row.Phone || '',
                    contact: row.contact || row.Contact || '',
                    uniqueIdentifier: uniqueId, // For device token linking
                    createdAt: new Date(),
                    memberID: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
                };
                batch.push(addDoc(membersRef, memberData));
            }

            if (errors.length > 0) {
                alert(`Validation errors found:\n${errors.join('\n')}\n\nOnly valid members will be registered.`);
            }

            if (batch.length > 0) {
                await Promise.all(batch);
                alert(`Successfully registered ${batch.length} members!`);
                fetchMembers();
            } else {
                alert('No valid members to register.');
            }

            setCsvData([]);
            setCsvFile(null);
        } catch (error) {
            console.error('Error registering members:', error);
            alert('Failed to register members');
        } finally {
            setLoading(false);
        }
    };

    const generateUniqueCode = () => {
        return Math.random().toString(36).substr(2, 9).toUpperCase();
    };

    const exportSessionAttendance = async (sessionId, sessionName) => {
        try {
            const logsRef = collection(db, 'attendanceLogs');
            const q = query(logsRef, where('sessionId', '==', sessionId), where('adminId', '==', currentUser.uid));
            const snapshot = await getDocs(q);

            const attendanceData = snapshot.docs.map(doc => ({
                participantName: doc.data().participantName,
                email: doc.data().email,
                uniqueCode: doc.data().uniqueCode,
                checkInTime: doc.data().checkInTime?.toDate()?.toLocaleString(),
                status: 'Present'
            }));

            if (attendanceData.length === 0) {
                alert('No attendance data found for this session');
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(attendanceData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

            XLSX.writeFile(workbook, `${sessionName}_Attendance.xlsx`);
        } catch (error) {
            console.error('Error exporting attendance:', error);
            alert('Failed to export attendance data');
        }
    };

    const viewSessionQRCode = (session) => {
        setSelectedSession(session);
        setShowQRModal(true);
    };

    const closeQRModal = () => {
        setShowQRModal(false);
        setSelectedSession(null);
    };

    const openDeleteModal = (session) => {
        setSessionToDelete(session);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSessionToDelete(null);
    };

    const confirmDeleteSession = async () => {
        if (!sessionToDelete) return;

        setLoading(true);
        try {
            const result = await deleteSession(sessionToDelete.id);
            console.log(result.message);

            // Update your UI state to remove the deleted session
            setSessions(prev => prev.filter(session => session.id !== sessionToDelete.id));

            // Show success message to user
            alert('Session deleted successfully!');

            fetchSessions();
        } catch (error) {
            console.error('Failed to delete session:', error);

            // Show error message to user
            alert(`Failed to delete session: ${error.message}`);
        } finally {
            setLoading(false);
            closeDeleteModal();
        }
    };

    const renderMemberManagement = () => (
        <>
            <h2>Member Management</h2>
            <p>Register and manage members for attendance tracking.</p>

            {/* Member Stats */}
            <div className="user-stats-row">
                <div className="user-stat-card">
                    <h3>Total Members</h3>
                    <p>{members.length}</p>
                </div>
                <div className="user-stat-card">
                    <h3>Registered This Month</h3>
                    <p>{members.filter(member =>
                        new Date(member.createdAt?.toDate()).getMonth() === new Date().getMonth()
                    ).length}</p>
                </div>
            </div>

            {/* CSV Upload Form */}
            <div className="admin-db-form-container">
                <div className="admin-db-form-csv">
                    <h3>Register Members via CSV</h3>
                    <p>Upload a CSV file with columns: Name, Email & Phone then select Session to register members (required)</p>
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleCsvUpload}
                        style={{marginBottom: '10px'}}
                    />
                    {csvData.length > 0 && (
                        <p>Found {csvData.length} rows in the uploaded file.</p>
                    )}
                    <div className="admin-db-btns">
                        <button
                            onClick={() => setShowSessionSelectModal(true)}
                            disabled={!csvData.length || loading}
                            className="admin-db-open-btn"
                        >
                            {loading ? 'Registering...' : 'Register Members'}
                        </button>
                        <button
                            onClick={() => {
                                setCsvData([]);
                                setCsvFile(null);
                            }}
                            className="admin-db-delete-btn"
                        >
                            Clear Upload
                        </button>
                    </div>
                </div>
            </div>

            {/* Registered Members by Session */}
            <div className="members-list">
                <h3>Registered Members for Sessions</h3>
                {sessions.length === 0 ? (
                    <p>No sessions created yet.</p>
                ) : (
                    sessions.map(session => {
                        const sessionLogs = sessionAttendance[session.id] || [];
                        return (
                            <div key={session.id} className="db-section-spacing">
                                <h4>{session.name} - Registered Members</h4>
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
                                        {sessionLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" style={{textAlign: 'center', color: '#666'}}>
                                                    No data available
                                                </td>
                                            </tr>
                                        ) : (
                                            sessionLogs.map(log => (
                                                <tr key={log.id}>
                                                    <td>{log.checkInTime?.toDate()?.toLocaleDateString()}</td>
                                                    <td>{log.participantName}</td>
                                                    <td>Check-in</td>
                                                    <td>Present</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );

    const renderSessionManagement = () => (
        <>
            <h2>Session Management</h2>
            <p>Create and manage attendance sessions with pre-registered participants.</p>

            {/* Create Session Form */}
            <div className="admin-db-form-container-session">
                <div className="admin-db-session-form">
                    <h3>Create New Session</h3>
                    <form onSubmit={handleSessionSubmit}>
                        <label htmlFor="sessionName">Session Name:</label>
                        <input
                            type="text"
                            id="sessionName"
                            value={sessionForm.name}
                            onChange={(e) => setSessionForm({...sessionForm, name: e.target.value})}
                            required
                        />

                        <label htmlFor="sessionDescription">Description:</label>
                        <textarea
                            id="sessionDescription"
                            value={sessionForm.description}
                            onChange={(e) => setSessionForm({...sessionForm, description: e.target.value})}
                            rows="3"
                        />

                        <label htmlFor="sessionLocation">Location:</label>
                        <input
                            type="text"
                            id="sessionLocation"
                            value={sessionForm.location}
                            onChange={(e) => setSessionForm({...sessionForm, location: e.target.value})}
                        />

                        <div style={{display: 'grid', gap: '10px'}}>
                            <div style={{flex: 1}}>
                                <label htmlFor="startDate">Start Date & Time:</label>
                                <input
                                    type="datetime-local"
                                    id="startDate"
                                    value={sessionForm.startDate}
                                    onChange={(e) => setSessionForm({...sessionForm, startDate: e.target.value})}
                                    required
                                />
                            </div>
                            <div style={{flex: 1}}>
                                <label htmlFor="endDate">End Date & Time:</label>
                                <input
                                    type="datetime-local"
                                    id="endDate"
                                    value={sessionForm.endDate}
                                    onChange={(e) => setSessionForm({...sessionForm, endDate: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <label htmlFor="maxParticipants">Max Participants:</label>
                        <input
                            type="number"
                            id="maxParticipants"
                            value={sessionForm.maxParticipants}
                            onChange={(e) => setSessionForm({...sessionForm, maxParticipants: e.target.value})}
                        />

                        <label style={{marginTop: '1.5rem', fontWeight: 'bold', color: '#f44336'}}>Geofence Settings (Optional)</label>
                        
                        <div style={{display: 'grid', gap: '10px'}}>
                            <div style={{flex: 1}}>
                                <label htmlFor="geofenceLat">Latitude:</label>
                                <input
                                    type="number"
                                    id="geofenceLat"
                                    placeholder="e.g., 40.7128"
                                    step="0.0001"
                                    value={sessionForm.geofence?.latitude}
                                    onChange={(e) => setSessionForm({
                                        ...sessionForm,
                                        geofence: {...sessionForm.geofence, latitude: e.target.value}
                                    })}
                                />
                            </div>
                            <div style={{flex: 1}}>
                                <label htmlFor="geofenceLng">Longitude:</label>
                                <input
                                    type="number"
                                    id="geofenceLng"
                                    placeholder="e.g., -74.0060"
                                    step="0.0001"
                                    value={sessionForm.geofence?.longitude}
                                    onChange={(e) => setSessionForm({
                                        ...sessionForm,
                                        geofence: {...sessionForm.geofence, longitude: e.target.value}
                                    })}
                                />
                            </div>
                            <div style={{flex: 1}}>
                                <label htmlFor="geofenceRadius">Radius (meters):</label>
                                <input
                                    type="number"
                                    id="geofenceRadius"
                                    placeholder="e.g., 100"
                                    value={sessionForm.geofence?.radius}
                                    onChange={(e) => setSessionForm({
                                        ...sessionForm,
                                        geofence: {...sessionForm.geofence, radius: e.target.value}
                                    })}
                                />
                            </div>
                        </div>

                        <div className="admin-db-btns">
                            <button type="submit" className="admin-db-open-btn" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Session'}
                            </button>
                            <button type="clear" className="admin-db-open-btn" disabled={loading} style={{backgroundColor: 'red'}}>
                                {loading ? 'Clearing...' : 'Clear'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Existing Sessions */}
            <div className="sessions-list">
                <h3>Existing Sessions</h3>
                {sessions.length === 0 ? (
                    <p>No sessions created yet.</p>
                ) : (
                    sessions.map(session => (
                        <div key={session.id} className="session-item">
                            <div className="session-info-box">
                                <h4>{session.name}</h4>
                                <p>{session.description}</p>
                                <p><strong>Location:</strong> {session.location}</p>
                                <p><strong>Start:</strong> {session.startDate ? new Date(session.startDate).toLocaleString() : 'Not set'}</p>
                                <p><strong>End:</strong> {session.endDate ? new Date(session.endDate).toLocaleString() : 'Not set'}</p>
                                <p><strong>Status:</strong> {session.isActive ? 'Active' : 'Inactive'}</p>
                            </div>
                            <div className="session-actions-box">
                                <button
                                    onClick={() => openDeleteModal(session)}
                                    className="admin-db-delete-btn"
                                >
                                    Delete Session
                                </button>
                                <button
                                    onClick={() => viewSessionQRCode(session)}
                                    className="admin-db-open-btn"
                                >
                                    View QR Code
                                </button>
                                <button
                                    onClick={() => exportSessionAttendance(session.id, session.name)}
                                    className="admin-db-open-btn"
                                >
                                    Export Attendance
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );

            const handleCsvSubmitForSession = async (sessionId) => {
            if (!csvData.length) {
                alert('Please upload a CSV file first');
                return;
            }

            setLoading(true);
            try {
                const participantsRef = collection(db, 'participants');
                const batch = [];
                const errors = [];
                const uniqueIdentifiers = new Set();

                for (let i = 0; i < csvData.length; i++) {
                    const row = csvData[i];
                    const name = row.name || row.Name;
                    const email = row.email || row.Email || row.phone || row.Phone || row.contact || row.Contact;

                    if (!name || !email) {
                        errors.push(`Row ${i + 1}: Missing required field(s) - Name: ${name || 'missing'}, Email/Phone: ${email || 'missing'}`);
                        continue;
                    }

                    const uniqueId = email.toLowerCase();
                    if (uniqueIdentifiers.has(uniqueId)) {
                        errors.push(`Row ${i + 1}: Duplicate identifier '${email}'`);
                        continue;
                    }
                    uniqueIdentifiers.add(uniqueId);

                    const participantData = {
                        sessionId: sessionId,
                        adminId: currentUser.uid,
                        name,
                        email: email.toLowerCase(),
                        phone: row.phone || row.Phone || '',
                        contact: row.contact || row.Contact || '',
                        uniqueIdentifier: uniqueId,
                        registeredAt: new Date(),
                        status: 'registered' // or 'pending'
                    };
                    batch.push(addDoc(participantsRef, participantData));
                }

                if (errors.length > 0) {
                    alert(`Validation errors found:\n${errors.join('\n')}\n\nOnly valid participants will be registered.`);
                }

                if (batch.length > 0) {
                    await Promise.all(batch);
                    alert(`Successfully registered ${batch.length} participants for the selected session!`);
                    fetchSessions(); // Refresh session data if needed
                } else {
                    alert('No valid participants to register.');
                }

                setCsvData([]);
                setCsvFile(null);
                setSelectedSessionId(null);
            } catch (error) {
                console.error('Error registering participants:', error);
                alert('Failed to register participants');
            } finally {
                setLoading(false);
            }
        };


    const renderSessionDashboard = () => (
        <>
            <h2>Session Dashboard</h2>
            <p>Real-time monitoring of session attendance.</p>

            {/* Attendance Stats */}
            <div className="user-stats-row">
                <div className="user-stat-card">
                    <h3>Total Sessions</h3>
                    <p>{sessions.length}</p>
                </div>
                <div className="user-stat-card">
                    <h3>Active Sessions</h3>
                    <p>{sessions.filter(s => s.isActive).length}</p>
                </div>
                <div className="user-stat-card">
                    <h3>Total Check-ins Today</h3>
                    <p>{attendanceLogs.filter(log =>
                        new Date(log.checkInTime?.toDate()).toDateString() === new Date().toDateString()
                    ).length}</p>
                </div>
            </div>

            {/* Recent Attendance Logs */}
            <div className="attendance-logs">
                <h3>Recent Check-ins</h3>
                <div className="logs-list">
                    {attendanceLogs.slice(0, 10).map(log => (
                        <div key={log.id} className="log-item">
                            <div className="log-info">
                                <strong>{log.participantName}</strong>
                                <p>{log.email}</p>
                                <p>Session: {log.sessionName}</p>
                            </div>
                            <div className="log-time">
                                {log.checkInTime?.toDate()?.toLocaleString()}
                            </div>
                        </div>
                    ))}
                    {attendanceLogs.length === 0 && <p>No recent check-ins.</p>}
                </div>
            </div>
        </>
    );

    return (
        <div>
            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={activeTab === 'members' ? 'active' : ''}
                    onClick={() => setActiveTab('members')}
                >
                    Member Management
                </button>
                <button
                    className={activeTab === 'sessions' ? 'active' : ''}
                    onClick={() => setActiveTab('sessions')}
                >
                    Session Management
                </button>
                <button
                    className={activeTab === 'dashboard' ? 'active' : ''}
                    onClick={() => setActiveTab('dashboard')}
                >
                    Session Dashboard
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'members' && renderMemberManagement()}
                {activeTab === 'sessions' && renderSessionManagement()}
                {activeTab === 'dashboard' && renderSessionDashboard()}
            </div>

            {/* QR Code Modal */}
            {showQRModal && selectedSession && (
                <div className="qr-modal-overlay" onClick={closeQRModal}>
                    <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="qr-modal-header">
                            <h2>{selectedSession.name} - QR Code</h2>
                            <button className="qr-modal-close" onClick={closeQRModal}>×</button>
                        </div>
                        <div className="qr-modal-body">
                            <div className="qr-code-display">
                                <QRCode
                                    value={`${window.location.origin}${import.meta.env.BASE_URL}session-checkin/${selectedSession.id}`}
                                    size={200}
                                />
                            </div>
                            <div className="qr-details">
                                <p><strong>Session:</strong> {selectedSession.name}</p>
                                <p><strong>Description:</strong> {selectedSession.description || 'No description'}</p>
                                <p><strong>Location:</strong> {selectedSession.location || 'Not specified'}</p>
                                <p><strong>Start:</strong> {selectedSession.startDate ? new Date(selectedSession.startDate).toLocaleString() : 'Not set'}</p>
                                <p><strong>End:</strong> {selectedSession.endDate ? new Date(selectedSession.endDate).toLocaleString() : 'Not set'}</p>
                                <p><strong>Status:</strong> {selectedSession.isActive ? 'Active' : 'Inactive'}</p>
                                <p><strong>URL:</strong> <a href={`${window.location.origin}${import.meta.env.BASE_URL}session-checkin/${selectedSession.id}`} target="_blank" rel="noopener noreferrer">
                                    {`${window.location.origin}${import.meta.env.BASE_URL}session-checkin/${selectedSession.id}`}
                                </a></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
           {showSessionSelectModal && (
    <div className="qr-modal-overlay" onClick={() => setShowSessionSelectModal(false)}>
        <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="qr-modal-header">
                <h2>Select Session for Member Registration</h2>
                <button className="qr-modal-close" onClick={() => setShowSessionSelectModal(false)}>×</button>
            </div>
            <div className="qr-modal-body">
                {sessions.length === 0 ? (
                    <p>No sessions available. Please create a session first.</p>
                ) : (
                    <div className="session-selection-list">
                        {sessions.map(session => (
                            <div 
                                key={session.id} 
                                className={`session-selection-item ${selectedSessionId === session.id ? 'selected' : ''}`}
                                onClick={() => setSelectedSessionId(session.id)}
                            >
                                <h4>{session.name}</h4>
                                <p>{session.description}</p>
                                <p><strong>Location:</strong> {session.location}</p>
                                <p><strong>Date:</strong> {new Date(session.startDate).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
                <div className="admin-db-btns" style={{marginTop: '20px'}}>
                    <button
                        onClick={() => setShowSessionSelectModal(false)}
                        className="admin-db-open-btn"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (selectedSessionId) {
                                handleCsvSubmitForSession(selectedSessionId);
                                setShowSessionSelectModal(false);
                            }
                        }}
                        className="admin-db-open-btn"
                        disabled={!selectedSessionId || loading}
                    >
                        {loading ? 'Registering...' : 'Confirm Registration'}
                    </button>
                </div>
            </div>
        </div>
    </div>
)}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && sessionToDelete && (
                <div className="qr-modal-overlay" onClick={closeDeleteModal}>
                    <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="qr-modal-header">
                            <h2>Delete Session</h2>
                            <button className="qr-modal-close" onClick={closeDeleteModal}>×</button>
                        </div>
                        <div className="qr-modal-body">
                            <div className="delete-confirmation">
                                <p><strong>Are you sure you want to delete this session?</strong></p>
                                <div className="delete-session-details">
                                    <p><strong>Session:</strong> {sessionToDelete.name}</p>
                                    <p><strong>Description:</strong> {sessionToDelete.description || 'No description'}</p>
                                    <p><strong>Location:</strong> {sessionToDelete.location || 'Not specified'}</p>
                                </div>
                                <div className="delete-warning">
                                    <p style={{color: 'red', fontWeight: 'bold'}}>
                                        ⚠️ Warning: This action cannot be undone. All attendance data associated with this session will also be permanently deleted.
                                    </p>
                                </div>
                                <div className="admin-db-btns" style={{marginTop: '20px'}}>
                                    <button
                                        onClick={closeDeleteModal}
                                        className="admin-db-open-btn"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteSession}
                                        className="admin-db-delete-btn"
                                        disabled={loading}
                                    >
                                        {loading ? 'Deleting...' : 'Delete Session'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;
