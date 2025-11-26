import { Html5QrcodeScanner } from 'html5-qrcode';
import { useState, useRef, useEffect } from 'react';
import '../page_styles/PublicScan.css';
import qrCodeIcon from '../assets/Icons/qr-code.png';
import { useNavigate } from 'react-router-dom';

function PublicScan() {
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const handledRef = useRef(false);
  const scannerRef = useRef(null); 
  const navigate = useNavigate();

  const handleStartScanning = () => {
    setScanResult(null);
    handledRef.current = false;
    setScanning(true);
  };

  useEffect(() => {
    if (!scanning) return;
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 7,
    });
    scannerRef.current = scanner;
    scanner.render(success, error);

    function success(result) {
      if (!handledRef.current) {
        handledRef.current = true;
        setScanResult(result);
        scanner.clear();
        setScanning(false);
      }
    }
    function error() {
      // Optionally handle scan errors
    }

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanning]);

  return (
    <div className="member-bg">
      <div className="memberMain">
        <div className="member-container">
          <h1 className="member-title">Scan QR iiCode</h1>
          <p className="member-desc">You can scan your QR code here!. To save your scan history and access more features, please <span style={{color:'#2196f3', fontWeight:600, cursor:'pointer'}} onClick={()=>navigate('/login')}>log in</span> or <span style={{color:'#2196f3', fontWeight:600, cursor:'pointer'}} onClick={()=>navigate('/signup')}>sign up</span>.</p>
          <img src={qrCodeIcon} alt="QR Code Icon" className="qr-code-icon" />
          {scanResult ? (
            <div className="scan-result success">
              <span>Result:</span> <a href={scanResult.startsWith('http') ? scanResult : 'http://' + scanResult}>{scanResult}</a>
            </div>
          ) : (
            <>
              {!scanning && (
                <button className="scan-btn" onClick={handleStartScanning}>
                  Start Scanning
                </button>
              )}
              {scanning && <div id="reader" className="qr-reader-box"></div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicScan; 