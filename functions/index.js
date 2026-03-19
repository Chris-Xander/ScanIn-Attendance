/* eslint-env node */
const { setGlobalOptions } = require('firebase-functions/v2');
const { onRequest, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

admin.initializeApp();
setGlobalOptions({ maxInstances: 10, region: 'us-central1' });

// Allowed origins for CORS (use HTTP endpoint from client)
const CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://chris-xander.github.io',
  'https://attendance-app-3efdc.web.app',
  'https://attendance-app-3efdc.firebaseapp.com',
];

const BATCH_SIZE = 500; // Firestore batch limit

async function countSessionDocs(db, sessionId) {
  const logsQ = db.collection('attendanceLogs').where('sessionId', '==', sessionId);
  const recordsQ = db.collection('attendanceRecords').where('sessionId', '==', sessionId);
  const [logsSnap, recSnap] = await Promise.all([logsQ.get(), recordsQ.get()]);
  return logsSnap.size + recSnap.size;
}

async function deleteChunkFrom(db, col, sessionId) {
  const q = db.collection(col).where('sessionId', '==', sessionId).limit(BATCH_SIZE);
  const snap = await q.get();
  if (snap.empty) return 0;
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snap.size;
}

async function deleteAllDocsForSession(db, sessionId) {
  let deleted = 0;
  while (true) {
    const deletedFromLogs = await deleteChunkFrom(db, 'attendanceLogs', sessionId);
    const deletedFromRecords = await deleteChunkFrom(db, 'attendanceRecords', sessionId);
    const totalDeletedThisIteration = deletedFromLogs + deletedFromRecords;
    if (!totalDeletedThisIteration) break;
    deleted += totalDeletedThisIteration;
    // small delay to reduce hot-looping
    await new Promise((r) => setTimeout(r, 200));
  }
  /* eslint-enable no-constant-condition */

  // finally delete the session doc
  await db.collection('sessions').doc(sessionId).delete();
  return deleted;
}

async function enqueueDeletionJob(db, sessionId, requestedBy, totalCount) {
  const jobRef = db.collection('deletionJobs').doc();
  const job = {
    sessionId,
    requestedBy,
    status: 'pending',
    totalCount,
    processedCount: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await jobRef.set(job);
  return jobRef.id;
}

function setCors(res, origin) {
  const allowOrigin = origin && CORS_ORIGINS.includes(origin) ? origin : CORS_ORIGINS[0];
  res.set('Access-Control-Allow-Origin', allowOrigin);
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Max-Age', '86400');
}

function sendError(res, origin, code, message, status = 400) {
  setCors(res, origin);
  res.status(status).json({ error: { code, message } });
}

exports.deleteSessionHttp = onRequest(
  { region: 'us-central1', cors: CORS_ORIGINS },
  async (req, res) => {
    let origin = req.get('Origin');
    if (!origin && req.get('Referer')) {
      try { origin = new URL(req.get('Referer')).origin; } catch { /* ignore */ }
    }
    setCors(res, origin);

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      sendError(res, origin, 'invalid-argument', 'Method not allowed', 405);
      return;
    }

    try {
      const authHeader = req.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendError(res, origin, 'unauthenticated', 'Authentication required.', 401);
        return;
      }
      const idToken = authHeader.split('Bearer ')[1];
      const decoded = await admin.auth().verifyIdToken(idToken);
      const uid = decoded.uid;
      const customClaims = decoded;

      const body = typeof req.body === 'object' ? req.body : {};
      const sessionId = body.sessionId;

      if (!sessionId || typeof sessionId !== 'string') {
        sendError(res, origin, 'invalid-argument', 'A valid sessionId must be provided.', 400);
        return;
      }

      const db = admin.firestore();
      const sessDoc = await db.collection('sessions').doc(sessionId).get();

      if (!sessDoc.exists) {
        sendError(res, origin, 'not-found', 'Session not found.', 404);
        return;
      }

      const sess = sessDoc.data();
      const isOwner = sess.adminId === uid;
      const isGlobalAdmin = !!(customClaims.admin === true);
      if (!isOwner && !isGlobalAdmin) {
        sendError(res, origin, 'permission-denied', 'Not authorized to delete this session.', 403);
        return;
      }

      const totalToDelete = await countSessionDocs(db, sessionId);
      logger.info(
        `deleteSession: session ${sessionId} total related docs=${totalToDelete}`,
        { sessionId, totalToDelete }
      );

      if (totalToDelete <= BATCH_SIZE) {
        const deleted = await deleteAllDocsForSession(db, sessionId);
        logger.info(`deleteSession synchronous deleted ${deleted} docs for session ${sessionId}`);
        res.status(200).json({
          result: {
            success: true,
            mode: 'synchronous',
            deleted,
            message: `Session and ${deleted} related record(s) deleted successfully.`,
          },
        });
        return;
      }

      const jobId = await enqueueDeletionJob(db, sessionId, uid, totalToDelete);
      logger.info(`deleteSession enqueued job ${jobId} for session ${sessionId}`);
      res.status(200).json({
        result: { jobId, status: 'queued', message: 'Deletion queued for large session.' },
      });
    } catch (err) {
      logger.error('deleteSession error', err);
      if (err.code === 'auth/id-token-expired' || err.code === 'auth/argument-error') {
        sendError(res, origin, 'unauthenticated', 'Invalid or expired token.', 401);
        return;
      }
      setCors(res, origin);
      res.status(500).json({ error: { code: 'internal', message: 'Server error while deleting session.' } });
    }
  }
);

// Worker: process deletion jobs
exports.processDeletionJob = onDocumentCreated(
  { document: 'deletionJobs/{jobId}', region: 'us-central1' },
  async (event) => {
  const jobId = event.params.jobId;
  const jobData = event.data;
  logger.info('processDeletionJob started', { jobId, jobData });

  const db = admin.firestore();
  const jobRef = db.collection('deletionJobs').doc(jobId);

  // If job has already been processed or started, skip
  const jobSnap = await jobRef.get();
  if (!jobSnap.exists) return null;
  const job = jobSnap.data();
  if (job.status && job.status !== 'pending') {
    logger.info('processDeletionJob skipping non-pending job', { jobId, status: job.status });
    return null;
  }

  try {
    await jobRef.update({ status: 'processing', lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp() });

    let totalProcessed = job.processedCount || 0;
    // Loop and process chunks until none left or we've processed totalCount
    while (true) {
      const deletedFromLogs = await deleteChunkFrom(db, 'attendanceLogs', job.sessionId);
      const deletedFromRecords = await deleteChunkFrom(db, 'attendanceRecords', job.sessionId);
      const numDeleted = deletedFromLogs + deletedFromRecords;
      if (!numDeleted) break;
      totalProcessed += numDeleted;
      await jobRef.update({ processedCount: totalProcessed, lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp() });
      // guard against long-running functions by checking time left is not possible here; rely on function timeouts
      await new Promise((r) => setTimeout(r, 200));
    }
    /* eslint-enable no-constant-condition */

    // Delete session doc itself
    await db.collection('sessions').doc(job.sessionId).delete();
    await jobRef.update({ processedCount: totalProcessed, status: 'completed', lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp() });

    logger.info('processDeletionJob completed', { jobId, totalProcessed });
    return null;
  } catch (err) {
    logger.error('processDeletionJob failed', { jobId, err });
    await jobRef.update({ status: 'failed', error: err.message, lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return null;
  }
  }
);