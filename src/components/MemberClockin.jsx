import { Html5Qrcode } from 'html5-qrcode';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import qrCodeIcon from '../assets/Icons/qr-code.png';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import mockService from '../services/mockService';
import { useAuth } from '../contexts/AuthContext';
import '../page_styles/MemberClockin.css';

const MemberClockin = ({ currentUser }) => {
    const [scanResult, setScanResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    const handledRef = useRef(false);
    const scannerRef = useRef(null);
    const navigate = useNavigate();
    const { useMock } = useAuth();

    useEffect(() => {
        if (!scanning) return;
        const scanner = new Html5Qrcode('reader', {
            fps: 7
        });
        scannerRef.current = scanner;

        scanner.render(success, error);

        async function success(result) {
            if (!handledRef.current) {
                handledRef.current = true;
                setScanResult(result);
                scanner.clear();

                // Check if this is a custom QR code URL
                if (result.includes('/scan-form/')) {
                    // Extract the qrId from the URL
                    const qrId = result.split('/scan-form/')[1];
                    if (qrId) {
                        // Navigate to the form page
                        navigate(`/scan-form/${qrId}`);
                        return;
                    }
                }

                // Handle legacy QR codes (admin email)
                if (currentUser) {
                    try {
                        if (useMock) {
                            // Mock service - add to mock data
                            const scanRecord = {
                                id: Date.now().toString(),
                                memberId: currentUser.uid,
                                adminId: result,
                                result,
                                timestamp: new Date(),
                                status: 'clock-in',
                            };
                            mockService.data.attendanceRecords.push(scanRecord);
                        } else {
                            // Real Firebase - save to Firestore
                            await addDoc(collection(db, 'attendanceRecords'), {
                                memberId: currentUser.uid,
                                adminId: result,
                                result,
                                timestamp: serverTimestamp(),
                                status: 'clock-in',
                            });
                        }
                    } catch (err) {
                        console.error('Failed to save attendance record:', err);
                    }
                }
            }
        }

        function error(err) {
            //scan error logic here
            console.warn(err);
        }

        return () => {
            scanner.clear().catch(() => {});
        };
    }, [scanning, currentUser, navigate]);

    const handleStartScanning = () => {
        setScanResult(null);
        handledRef.current = false;
        setScanning(true);
    };

    return (
        <div className="clockin-container">
            <h1 className="member-title">Attendid</h1>
            <p className="member-desc">Scan your QR code to clock in or out.</p>
            <img src={qrCodeIcon} alt="QR Code Icon" className="qr-code-icon" />

            {scanResult ? (
                <div className="scan-result success">
                    <span>Success:</span> <a href={"http://" + scanResult}>{scanResult}</a>
                </div>
            ) : (
                <>
                    {!scanning && (
                        <button className="scan-btn" onClick={handleStartScanning}>
                            Start Scanning
                        </button>
                    )}
                    {scanning && <div id='reader' className="qr-reader-box"></div>}
                </>
            )}
        </div>
    );
};

export default MemberClockin;
