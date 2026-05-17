import jsQR from "jsqr";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import mockService from "../services/mockService";
import { useAuth } from "../contexts/AuthContext";
import "../page_styles/MemberClockin.css";

const MemberClockin = ({ currentUser }) => {
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const handledRef = useRef(false);

  const navigate = useNavigate();
  const { useMock } = useAuth();

  useEffect(() => {
    if (!scanning) return;

    startCamera();

    return stopCamera;
  }, [scanning]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", true);
      await videoRef.current.play();

      requestAnimationFrame(scanFrame);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || handledRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code?.data) {
      handledRef.current = true;
      handleScanSuccess(code.data);
      stopCamera();
      return;
    }

    requestAnimationFrame(scanFrame);
  };

  const handleScanSuccess = async (result) => {
    // Custom QR URL
    if (result.includes("/scan-form/")) {
      const qrId = result.split("/scan-form/")[1];
      if (qrId) {
        navigate(`/scan-form/${qrId}`);
        return;
      }
    }

    // Legacy QR
    if (!currentUser) return;

    try {
      if (useMock) {
        mockService.data.attendanceRecords.push({
          id: Date.now().toString(),
          memberId: currentUser.uid,
          adminId: result,
          result,
          timestamp: new Date(),
          status: "clock-in",
        });
      } else {
        await addDoc(collection(db, "attendanceRecords"), {
          memberId: currentUser.uid,
          adminId: result,
          result,
          timestamp: serverTimestamp(),
          status: "clock-in",
        });
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const handleStartScanning = () => {
    handledRef.current = false;
    setScanning(true);
  };

  const handleStopScanning = () => {
    setScanning(false);
    stopCamera();
  }

  return (
    <div className="clockin-container">
      <h1 className="member-title">Attendid</h1>
      <p className="member-desc">Scan your QR code to clock in or out.</p>

      {!scanning && (
        <button className="scan-btn" onClick={handleStartScanning}>
          Start Scanning
        </button>
      )}

      {scanning && (
        <>
          <video ref={videoRef} className="qr-video" />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <button className="stop-scan-button" onClick={handleStopScanning}>x</button>
        </>
      )}
    </div>
  );
};

export default MemberClockin;
