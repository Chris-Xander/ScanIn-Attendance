// Express server for LAN-only attendance submission (ES module version)
import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
const {default: serviceAccount} = await import('./serviceAccountKey.json', { assert: { type: 'json' } });

const app = express();
const PORT = 4000;

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://attendance-app-3efdc.firebaseio.com' // <- Firebase project
});

app.use(cors({
  origin: 'http://localhost:5173', // React app's origin
}));
app.use(express.json());

// LAN-only middleware (simple version)
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (ip.startsWith('::ffff:192.168.') || ip === '::1') {
    next();
  } else {
    res.status(403).send('Attendance submissions are only allowed on LAN.');
  }
});

// Attendance submission endpoint - Device token based
app.post('/api/attendance', async (req, res) => {
  try {
    const { memberId, sessionId, deviceToken, location } = req.body;
    
    // Validate required fields
    if (!memberId || !sessionId || !deviceToken) {
      return res.status(400).send({ 
        error: 'Missing required fields: memberId, sessionId, deviceToken' 
      });
    }

    // Verify member exists
    const memberDoc = await admin.firestore()
      .collection('members')
      .doc(memberId)
      .get();
    
    if (!memberDoc.exists()) {
      return res.status(404).send({ error: 'Member not found' });
    }

    // Verify session exists
    const sessionDoc = await admin.firestore()
      .collection('sessions')
      .doc(sessionId)
      .get();
    
    if (!sessionDoc.exists()) {
      return res.status(404).send({ error: 'Session not found' });
    }

    const sessionData = sessionDoc.data();

    // Validate geofence if configured
    if (location && sessionData.geofence && sessionData.geofence.latitude && sessionData.geofence.longitude) {
      const R = 6371; // Earth's radius in km
      const dLat = (sessionData.geofence.latitude - location.latitude) * (Math.PI / 180);
      const dLng = (sessionData.geofence.longitude - location.longitude) * (Math.PI / 180);
      
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(location.latitude * (Math.PI / 180)) * Math.cos(sessionData.geofence.latitude * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in km
      
      if (distance > (sessionData.geofence.radius / 1000)) {
        return res.status(403).send({ 
          error: 'Outside geofence boundary for this session',
          distance: (distance * 1000).toFixed(0) + ' meters away'
        });
      }
    }

    // Create attendance record
    const attendanceData = {
      memberId,
      sessionId,
      deviceToken,
      memberName: memberDoc.data().name,
      sessionName: sessionData.name,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      checkInTime: new Date(),
      status: 'present',
      ...(location && { location })
    };

    const docRef = await admin.firestore()
      .collection('attendanceRecords')
      .add(attendanceData);

    console.log('Attendance recorded:', docRef.id);
    
    res.status(200).send({ 
      success: true,
      recordId: docRef.id,
      message: `Check-in recorded for ${memberDoc.data().name}`
    });
  } catch (err) {
    console.error('Attendance submission error:', err);
    res.status(500).send({ error: err.message });
  }
});

// Validate device token endpoint
app.post('/api/validate-device', async (req, res) => {
  try {
    const { deviceToken } = req.body;
    
    if (!deviceToken) {
      return res.status(400).send({ error: 'Device token required' });
    }

    const deviceDoc = await admin.firestore()
      .collection('devices')
      .where('deviceToken', '==', deviceToken)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (deviceDoc.empty) {
      return res.status(404).send({ error: 'Device not found or inactive' });
    }

    const deviceData = deviceDoc.docs[0].data();
    res.status(200).send({ 
      success: true,
      memberId: deviceData.memberId,
      linkedAt: deviceData.linkedAt
    });
  } catch (err) {
    console.error('Device validation error:', err);
    res.status(500).send({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`LAN Attendance Server running on port ${PORT}`);
});
