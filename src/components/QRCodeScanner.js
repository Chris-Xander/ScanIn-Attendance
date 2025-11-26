import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const QRCodeScanner = () => {
  const { currentMemberUid } = useAuth();
  const [scannedData, setScannedData] = useState(null);
  const [memberData, setMemberData] = useState({ name: '', email: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleScan = (data) => {
    setScannedData(data);
  };

  const handleScanSubmit = async () => {
    try {
      await addDoc(collection(db, 'scans'), {
        qrCodeId: scannedData, // assuming scannedData is the QR code ID
        memberId: currentMemberUid,
        scannedAt: new Date(),
        ...memberData,
      });
      setSuccess('Scan submitted!');
      setScannedData(null);
      setMemberData({ name: '', email: '' });
      setError(null);
    } catch (err) {
      setError('Failed to submit scan.');
      setSuccess(null);
    }
  };

  return (
    <div>
      {/* QR Code Scanner Component */}
      <div>Scan a QR Code</div>
      {scannedData && (
        <div>
          <div>Scanned Data: {scannedData}</div>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleScanSubmit();
            }}
          >
            <input
              type="text"
              placeholder="Name"
              value={memberData.name}
              onChange={e => setMemberData({ ...memberData, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={memberData.email}
              onChange={e => setMemberData({ ...memberData, email: e.target.value })}
              required
            />
            <button type="submit">Submit</button>
          </form>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {success && <div style={{ color: 'green' }}>{success}</div>}
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;