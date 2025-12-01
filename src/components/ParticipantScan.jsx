import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { Html5QrcodeScanner } from 'html5-qrcode';
import '../page_styles/ParticipantScan.css';

function ParticipantScan() {
    const { currentUser } = useAuth();
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState('');
    const [participant, setParticipant] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const todayDate = new Date().toISOString().split('T')[0];
    const scannerRef = useRef(null);
    const scannerInstance = useRef(null);

    useEffect(() => {
        // Check if user is a registered participant
        checkParticipantStatus();
        return () => {
            if (scannerInstance.current) {
                scannerInstance.current.clear().catch(console.error);
            }
        };
    }, []);

    const checkParticipantStatus = async () => {
        if (!currentUser) return;

        try {
            // Check if user is registered as a participant
            const participantsRef = collection(db, 'participants');
            const q = query(participantsRef, where('email', '==', currentUser.email));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const participantData = snapshot.docs[0].data();
                setParticipant({ id: snapshot.docs[0].id, ...participantData });

                // Get session details
                if (participantData.sessionId) {
                    const sessionDoc = await getDoc(doc(db, 'sessions', participantData.sessionId));
                    if (sessionDoc.exists()) {
                        setSession({ id: sessionDoc.id, ...sessionDoc.data() });
                    }
                }
            }
        } catch (error) {
            console.error('Error checking participant status:', error);
        }
    };

    const startScanning = () => {
        if (!participant) {
            alert('You are not registered for any session. Please contact your administrator.');
            return;
        }

        setScanning(true);
        setScanResult('');

        scannerInstance.current = new Html5QrcodeScanner(
            'qr-reader',
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            },
            false
        );

        scannerInstance.current.render(onScanSuccess, onScanError);
    };

    const stopScanning = () => {
        setScanning(false);
        if (scannerInstance.current) {
            scannerInstance.current.clear().catch(console.error);
        }
    };

    const onScanSuccess = async (decodedText) => {
        setScanResult(decodedText);
        setScanning(false);
        if (scannerInstance.current) {
            scannerInstance.current.clear().catch(console.error);
        }

        // Process the scanned QR code
        await processScan(decodedText);
    };

    const onScanError = (error) => {
        // Ignore scan errors, they're normal during scanning
        console.log('Scan error:', error);
    };

    const processScan = async (qrData) => {
        setLoading(true);
        try {
            // Parse QR data - assuming it contains session info or unique code
            const scanData = JSON.parse(qrData);

            // Verify this scan is for the participant's session
            if (scanData.sessionId !== participant.sessionId) {
                alert('This QR code is not for your registered session.');
                return;
            }

            // Check if already checked in
            const attendanceRef = collection(db, 'attendanceLogs');
            const existingQuery = query(
                attendanceRef,
                where('participantId', '==', participant.id),
                where('sessionId', '==', participant.sessionId),
                where('logDate', '==', todayDate)
            );
            const existingSnapshot = await getDocs(existingQuery);

            if (!existingSnapshot.empty) {
                alert('You have already checked in for this session.');
                return;
            }

            // Record attendance
            await addDoc(collection(db, 'attendanceLogs'), {
                participantId: participant.id,
                sessionId: participant.sessionId,
                participantName: participant.name,
                email: participant.email,
                uniqueCode: participant.uniqueCode,
                checkInTime: new Date(),
                adminId: session.adminId,
                sessionName: session.name,
                scannedData: qrData,
                logDate: todayDate,
            });

            alert(`Check-in successful! Welcome to ${session.name}, ${participant.name}!`);

            // Update participant's attended status
            // Note: This would require updating the participant document

        } catch (error) {
            console.error('Error processing scan:', error);
            alert('Failed to process check-in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!participant) {
        return (
            <div className="participant-scan-container">
                <div className="not-registered">
                    <h2>Session Check-in</h2>
                    <div className="not-registered-content">
                        <div className="icon">❌</div>
                        <h3>Not Registered</h3>
                        <p>You are not registered for any attendance session.</p>
                        <p>Please contact your administrator to get registered.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="participant-scan-container">
            <h2>Session Check-in</h2>

            {/* Session Info */}
            <div className="session-info-card">
                <h3>{session?.name || 'Session'}</h3>
                <div className="session-details">
                    <p><strong>Participant:</strong> {participant.name}</p>
                    <p><strong>Email:</strong> {participant.email}</p>
                    <p><strong>Unique Code:</strong> {participant.uniqueCode}</p>
                    {session && (
                        <>
                            <p><strong>Location:</strong> {session.location}</p>
                            <p><strong>Start:</strong> {new Date(session.startDate).toLocaleString()}</p>
                            <p><strong>End:</strong> {new Date(session.endDate).toLocaleString()}</p>
                        </>
                    )}
                </div>
            </div>

            {/* QR Scanner */}
            <div className="scanner-section">
                <h3>Scan QR Code to Check-in</h3>

                {!scanning ? (
                    <div className="scan-controls">
                        <button
                            className="scan-btn"
                            onClick={startScanning}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Start Scanning'}
                        </button>
                    </div>
                ) : (
                    <div className="scanner-container">
                        <div id="qr-reader" ref={scannerRef}></div>
                        <button
                            className="stop-scan-btn"
                            onClick={stopScanning}
                        >
                            Stop Scanning
                        </button>
                    </div>
                )}

                {scanResult && (
                    <div className="scan-result">
                        <h4>Scan Result:</h4>
                        <p>{scanResult}</p>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="instructions">
                <h3>How to Check-in:</h3>
                <ol>
                    <li>Make sure your camera is enabled</li>
                    <li>Click "Start Scanning" to activate the camera</li>
                    <li>Point your camera at the session QR code</li>
                    <li>Hold steady until the code is recognized</li>
                    <li>You'll receive confirmation once checked in</li>
                </ol>
            </div>
        </div>
    );
}

export default ParticipantScan;
