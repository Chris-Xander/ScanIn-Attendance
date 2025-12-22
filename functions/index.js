/* eslint-env node */
const { setGlobalOptions } = require('firebase-functions');
const { onCall } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

admin.initializeApp();
setGlobalOptions({ maxInstances: 10 });

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
  /* eslint-disable no-constant-condition */
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

exports.deleteSession = onCall(async (req) => {
  try {
    const { data, auth } = req;
    if (!auth || !auth.uid) {
      logger.warn('deleteSession call without auth');
      throw new Error('unauthenticated');
    }
    const uid = auth.uid;
    const sessionId = data && data.sessionId;
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('sessionId required');
    }

    const db = admin.firestore();
    const sessDoc = await db.collection('sessions').doc(sessionId).get();
    if (!sessDoc.exists) throw new Error('session-not-found');
    const sess = sessDoc.data();

    const isOwner = sess.adminId === uid;
    const isGlobalAdmin = !!(auth.token && auth.token.admin);
    if (!isOwner && !isGlobalAdmin) {
      throw new Error('not-authorized');
    }

    const totalToDelete = await countSessionDocs(db, sessionId);
    logger.info(`deleteSession: session ${sessionId} total related docs=${totalToDelete}`, { sessionId, totalToDelete });

    if (totalToDelete <= BATCH_SIZE) {
      const deleted = await deleteAllDocsForSession(db, sessionId);
      logger.info(`deleteSession synchronous deleted ${deleted} docs for session ${sessionId}`);
      return { success: true, mode: 'synchronous', deleted };
    }

    const jobId = await enqueueDeletionJob(db, sessionId, uid, totalToDelete);
    logger.info(`deleteSession enqueued job ${jobId} for session ${sessionId}`);
    return { jobId, status: 'queued' };
  } catch (err) {
    logger.error('deleteSession error', err);
    // Convert to generic error messages for clients
    const map = {
      'unauthenticated': { code: 'unauthenticated', message: 'Authentication required' },
      'session-not-found': { code: 'not-found', message: 'Session not found' },
      'not-authorized': { code: 'permission-denied', message: 'Not authorized to delete this session' },
    };
    if (map[err.message]) {
      throw new Error(JSON.stringify(map[err.message]));
    }
    throw new Error(JSON.stringify({ code: 'internal', message: 'Server error' }));
  }
});

// Worker: process deletion jobs
exports.processDeletionJob = onDocumentCreated('deletionJobs/{jobId}', async (event) => {
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
    /* eslint-disable no-constant-condition */
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
});