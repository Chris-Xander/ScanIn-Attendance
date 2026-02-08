import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import './AttendanceMatrix.css';

// Props: { mode: 'session'|'qr', sessionId?, qrCodeId?, onClose }
export default function AttendanceMatrix({ mode, sessionId, qrCodeId, onClose }) {
    const [matrix, setMatrix] = useState([]);
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedMemberDetails, setSelectedMemberDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const formatDateWithDay = (dateStr) => {
        // dateStr format: YYYY-MM-DD
        const date = new Date(dateStr + 'T00:00:00Z');
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = dayNames[date.getUTCDay()];
        return `${dayName} ${dateStr}`;
    };

    useEffect(() => {
        buildMatrix();
    }, [mode, sessionId, qrCodeId]);

    useEffect(() => {
        if (selectedRow && sessionId) {
            fetchMemberDetails(selectedRow);
        }
    }, [selectedRow, sessionId]);

    const fetchMemberDetails = async (row) => {
        setDetailsLoading(true);
        try {
            const memberDataRef = collection(db, 'sessionMemberData');
            let q;
            // Try matching by email first, then by name
            if (row.email) {
                q = query(
                    memberDataRef,
                    where('sessionId', '==', sessionId),
                    where('email', '==', row.email)
                );
            } else {
                q = query(
                    memberDataRef,
                    where('sessionId', '==', sessionId),
                    where('name', '==', row.name)
                );
            }
            const snap = await getDocs(q);
            if (snap.docs.length > 0) {
                setSelectedMemberDetails(snap.docs[0].data());
            } else {
                setSelectedMemberDetails(null);
            }
        } catch (err) {
            console.error('Error fetching member details:', err);
            setSelectedMemberDetails(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    const buildMatrix = async () => {
        setLoading(true);
        try {
            // Fetch attendance records depending on mode
            const attendanceRef = collection(db, 'attendanceRecords');
            let q;
            if (mode === 'session' && sessionId) {
                q = query(attendanceRef, where('sessionId', '==', sessionId));
            } else if (mode === 'qr' && qrCodeId) {
                q = query(attendanceRef, where('qrCodeId', '==', qrCodeId));
            } else {
                setMatrix([]);
                setDays([]);
                setLoading(false);
                return;
            }

            const snap = await getDocs(q);
            let records = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            // Note: formData is already stored in attendanceRecords, no need to fetch formSubmitData separately
            // This avoids permission issues and improves performance

            // Create a unique row per attendance record (not deduplicated)
            const daySet = new Set();
            const toDateObj = (val) => {
                if (!val) return null;
                if (typeof val === 'string') return new Date(val);
                if (val instanceof Date) return val;
                if (val.toDate && typeof val.toDate === 'function') return val.toDate();
                try { return new Date(val); } catch (e) { return null; }
            };

            const rows = records.map(r => {
                // Extract name: prioritize formData.name (from form submission), then memberName, then fallback
                const displayName = 
                    (r.formData && typeof r.formData === 'object' && r.formData.name) || 
                    r.memberName || 
                    r.deviceToken || 
                    'Unknown';
                
                // Normalize timestamp/checkInTime into a Date object
                const dateObj = toDateObj(r.checkInTime || r.timestamp);
                const dateStr = dateObj ? dateObj.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

                daySet.add(dateStr);

                const timeText = dateObj && !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                return {
                    id: r.id,
                    name: displayName,
                    email: r.email || '',
                    phone: r.phone || '',
                    formData: r.formData,
                    days: {
                        [dateStr]: {
                            status: r.status || 'present',
                            time: timeText,
                            token: r.deviceToken || r.code || r.token || ''
                        }
                    }
                };
            });

            const sortedDays = Array.from(daySet).sort();
            setDays(sortedDays);
            setMatrix(rows);
        } catch (err) {
            console.error('Error building attendance matrix:', err);
            setMatrix([]);
            setDays([]);
        } finally {
            setLoading(false);
        }
    };

    if (!mode) return null;

    return (
        <div className="attendance-modal-backdrop">
            <div className="attendance-modal">
                <div className="attendance-modal-header">
                    <h3>Attendance Overview</h3>
                    <button className="close-btn" onClick={onClose}>Close</button>
                </div>
                <div className="attendance-modal-body">
                    {loading ? (
                        <div className="loading">Loading attendance...</div>
                    ) : matrix.length === 0 ? (
                        <div className="empty">No attendance records found.</div>
                    ) : (
                        <>
                        <div className="attendance-grid-wrapper">
                            <table className="attendance-grid">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        {days.map(d => (
                                            <th key={d}>{formatDateWithDay(d)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {matrix.map((row, idx) => (
                                        <tr key={row.id}>
                                            <td>{idx + 1}</td>
                                            <td className="name-col" onClick={() => setSelectedRow(row)} style={{ cursor: 'pointer' }} title="View details">{row.name}</td>
                                            {days.map(day => {
                                                const cell = row.days[day];
                                                return (
                                                    <td key={day} className={`cell ${cell ? (cell.status === 'present' ? 'present' : 'absent') : 'absent'}`} title={cell ? `${cell.time} — ${cell.token}` : 'Absent'}>
                                                        {cell ? (
                                                            <div className="cell-content">
                                                                <span className="present-mark">✔</span>
                                                                <span className="time-text">{cell.time}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="absent-mark">—</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>

                        {selectedRow && (
                            <div
                                className="details-overlay"
                                style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}
                                onClick={() => setSelectedRow(null)}
                            >
                                <div
                                    className="details-card"
                                    style={{ background: '#fff', padding: 18, borderRadius: 8, minWidth: 320, maxWidth: '90%', maxHeight: '80%', overflow: 'auto', boxShadow: '0 6px 24px rgba(0,0,0,0.2)' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <h4 style={{ margin: 0 }}>Registration Details</h4>
                                        <button onClick={() => setSelectedRow(null)}>Close</button>
                                    </div>

                                    {detailsLoading ? (
                                        <p>Loading member details...</p>
                                    ) : selectedMemberDetails ? (
                                        <>
                                            <div style={{ marginBottom: 16 }}>
                                                <h5 style={{ margin: '0 0 12px 0', borderBottom: '2px solid #007bff', paddingBottom: 6 }}>Member Registration Data</h5>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95em' }}>
                                                    <tbody>
                                                        {Object.entries(selectedMemberDetails).filter(([key]) => !['uniqueIdentifier', 'adminId'].includes(key)).map(([key, value]) => {
                                                            // Skip nested objects and arrays for the main table
                                                            if (typeof value === 'object' && value !== null) return null;
                                                            return (
                                                                <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                                                                    <td style={{ padding: '8px 12px', fontWeight: 'bold', width: '35%', backgroundColor: '#f8f9fa' }}>
                                                                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                                                    </td>
                                                                    <td style={{ padding: '8px 12px' }}>{String(value)}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div style={{ marginBottom: 16 }}>
                                                <h5 style={{ margin: '0 0 12px 0', borderBottom: '2px solid #007bff', paddingBottom: 6 }}>Attendance Check-ins</h5>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95em' }}>
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                                            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Date</th>
                                                            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                                                            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.entries(selectedRow.days || {}).map(([d, info]) => (
                                                            <tr key={d} style={{ borderBottom: '1px solid #eee' }}>
                                                                <td style={{ padding: '8px 12px' }}>{d}</td>
                                                                <td style={{ padding: '8px 12px', color: info.status === 'present' ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>{info.status}</td>
                                                                <td style={{ padding: '8px 12px' }}>{info.time || '—'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <details style={{ marginTop: 12 }}>
                                                <summary style={{ cursor: 'pointer', padding: '8px 0', fontWeight: 'bold' }}>Raw data</summary>
                                                <div style={{ marginTop: 12, fontSize: '0.9em' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <tbody>
                                                            {selectedMemberDetails.rawRow && Object.entries(selectedMemberDetails.rawRow).map(([key, value]) => {
                                                                // Exclude sensitive fields
                                                                if (['adminId', 'uniqueIdentifier', 'sessionId', 'registeredAt', 'createdAt'].includes(key)) return null;

                                                                let displayValue = '';
                                                                if (value === null || value === undefined) {
                                                                    displayValue = '';
                                                                } else if (typeof value === 'object') {
                                                                    if (value.toDate && typeof value.toDate === 'function') {
                                                                        // Firebase Timestamp
                                                                        const date = value.toDate();
                                                                        displayValue = date.toLocaleDateString() + ' at ' + date.toLocaleTimeString() + ' UTC';
                                                                    } else {
                                                                        displayValue = String(value);
                                                                    }
                                                                } else {
                                                                    displayValue = String(value);
                                                                }

                                                                return (
                                                                    <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                                                                        <td style={{ padding: '12px', fontWeight: 'bold', width: '35%', backgroundColor: '#f8f9fa', verticalAlign: 'top' }}>
                                                                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                                                        </td>
                                                                        <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                                                            {displayValue}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </details>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ marginBottom: 8 }}>
                                                <p style={{ margin: '6px 0' }}><strong>Name:</strong> {selectedRow.name}</p>
                                                <p style={{ margin: '6px 0' }}><strong>ID:</strong> {selectedRow.id}</p>
                                            </div>

                                            <div style={{ marginBottom: 8 }}>
                                                <strong>Attendance Check-ins</strong>
                                                <ul>
                                                    {Object.entries(selectedRow.days || {}).map(([d, info]) => (
                                                        <li key={d}>{d} — {info.status}{info.time ? ` @ ${info.time}` : ''}{info.token ? ` (${info.token})` : ''}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <details>
                                                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Raw data</summary>
                                                <div style={{ marginTop: 12, fontSize: '0.9em' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <tbody>
                                                            {Object.entries(selectedRow).filter(([key]) => key !== 'days').flatMap(([key, value]) => {
                                                                if (key === 'formData' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
                                                                    // Expand formData object into separate rows
                                                                    return Object.entries(value).map(([subKey, subValue]) => {
                                                                        let displayValue = '';
                                                                        if (subValue === null || subValue === undefined) {
                                                                            displayValue = '';
                                                                        } else if (typeof subValue === 'object') {
                                                                            if (subValue.toDate && typeof subValue.toDate === 'function') {
                                                                                // Firebase Timestamp
                                                                                const date = subValue.toDate();
                                                                                displayValue = date.toLocaleDateString() + ' at ' + date.toLocaleTimeString() + ' UTC';
                                                                            } else {
                                                                                displayValue = String(subValue);
                                                                            }
                                                                        } else {
                                                                            displayValue = String(subValue);
                                                                        }

                                                                        return (
                                                                            <tr key={`${key}.${subKey}`} style={{ borderBottom: '1px solid #eee' }}>
                                                                                <td style={{ padding: '12px', fontWeight: 'bold', width: '35%', backgroundColor: '#f8f9fa', verticalAlign: 'top' }}>
                                                                                    {subKey.charAt(0).toUpperCase() + subKey.slice(1).replace(/([A-Z])/g, ' $1')}
                                                                                </td>
                                                                                <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                                                                    {displayValue}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    });
                                                                } else {
                                                                    let displayValue = '';
                                                                    if (value === null || value === undefined) {
                                                                        displayValue = '';
                                                                    } else if (typeof value === 'object') {
                                                                        if (value.toDate && typeof value.toDate === 'function') {
                                                                            // Firebase Timestamp
                                                                            const date = value.toDate();
                                                                            displayValue = date.toLocaleDateString() + ' at ' + date.toLocaleTimeString() + ' UTC';
                                                                        } else {
                                                                            displayValue = String(value);
                                                                        }
                                                                    } else {
                                                                        displayValue = String(value);
                                                                    }

                                                                    return (
                                                                        <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                                                                            <td style={{ padding: '12px', fontWeight: 'bold', width: '35%', backgroundColor: '#f8f9fa', verticalAlign: 'top' }}>
                                                                                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                                                            </td>
                                                                            <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                                                                {displayValue}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                }
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </details>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
