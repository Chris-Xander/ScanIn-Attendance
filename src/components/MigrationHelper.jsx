import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

function MigrationHelper() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const [results, setResults] = useState(null);

    const migrateAttendanceLogs = async () => {
        if (!currentUser) {
            alert('You must be logged in to run migration');
            return;
        }

        setLoading(true);
        setProgress('Starting migration...');
        setResults(null);

        try {
            const logsRef = collection(db, 'attendanceLogs');
            const snapshot = await getDocs(logsRef);

            setProgress(`Found ${snapshot.docs.length} attendance logs to check...`);

            const updates = [];
            let processed = 0;
            let updated = 0;
            let skipped = 0;

            for (const docSnap of snapshot.docs) {
                const logData = docSnap.data();

                // Update progress every 10 documents
                if (processed % 10 === 0) {
                    setProgress(`Processing ${processed}/${snapshot.docs.length}...`);
                }

                if (!logData.adminId && logData.sessionId) {
                    // Fetch session to get adminId
                    try {
                        const sessionDoc = await getDoc(doc(db, 'sessions', logData.sessionId));
                        if (sessionDoc.exists()) {
                            const sessionData = sessionDoc.data();
                            if (sessionData.adminId) {
                                updates.push(updateDoc(docSnap.ref, { adminId: sessionData.adminId }));
                                updated++;
                            } else {
                                console.warn(`Session ${logData.sessionId} has no adminId`);
                                skipped++;
                            }
                        } else {
                            console.warn(`Session ${logData.sessionId} not found`);
                            skipped++;
                        }
                    } catch (error) {
                        console.error(`Error fetching session ${logData.sessionId}:`, error);
                        skipped++;
                    }
                } else if (logData.adminId) {
                    skipped++; // Already has adminId
                } else {
                    console.warn(`Log ${docSnap.id} has no sessionId`);
                    skipped++;
                }

                processed++;
            }

            // Execute all updates
            if (updates.length > 0) {
                setProgress(`Updating ${updates.length} documents...`);
                await Promise.all(updates);
            }

            setResults({
                total: snapshot.docs.length,
                updated,
                skipped,
                success: true
            });

            setProgress('Migration completed successfully!');

        } catch (error) {
            console.error('Migration error:', error);
            setResults({
                error: error.message,
                success: false
            });
            setProgress('Migration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Database Migration Helper</h2>
            <p>This tool updates existing attendanceLogs to include the adminId field for proper permissions.</p>

            <div style={{ margin: '20px 0' }}>
                <button
                    onClick={migrateAttendanceLogs}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: loading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Running Migration...' : 'Run Migration'}
                </button>
            </div>

            {progress && (
                <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Progress:</strong> {progress}
                </div>
            )}

            {results && (
                <div style={{
                    margin: '20px 0',
                    padding: '15px',
                    borderRadius: '4px',
                    backgroundColor: results.success ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${results.success ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                    <h3>{results.success ? 'Migration Results' : 'Migration Failed'}</h3>
                    {results.success ? (
                        <div>
                            <p><strong>Total logs processed:</strong> {results.total}</p>
                            <p><strong>Updated with adminId:</strong> {results.updated}</p>
                            <p><strong>Skipped (already had adminId or no session):</strong> {results.skipped}</p>
                        </div>
                    ) : (
                        <p><strong>Error:</strong> {results.error}</p>
                    )}
                </div>
            )}

            <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                <h4>⚠️ Important Notes:</h4>
                <ul>
                    <li>This migration may take several minutes if you have many attendance logs.</li>
                    <li>Do not close this page while migration is running.</li>
                    <li>After migration completes, you can safely delete this component.</li>
                    <li>Session deletion should now work properly for all attendance logs.</li>
                </ul>
            </div>
        </div>
    );
}

export default MigrationHelper;
