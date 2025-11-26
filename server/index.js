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

// Attendance submission endpoint
app.post('/api/attendance', async (req, res) => {
  try {
    const data = req.body;
    console.log('Received attendance:', data);
    await admin.firestore().collection('attendanceRecords').add(data);
    res.status(200).send({ success: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`LAN Attendance Server running on port ${PORT}`);
});
