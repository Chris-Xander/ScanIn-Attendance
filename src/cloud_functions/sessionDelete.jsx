import * as functions from  'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

//Cloud function for deleting sessions...
export const deleteSession = functions.https.onCall(async (data, context) => {
    //verify if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'User Unauthenticated',
            'Athentication required to delete sessions.'
        );
    }

    const { sessionId } = data;

    //Validate Input (this protects the function and avoids unecessary Firestore reads)
    if (!sessionId || typeof sessionId !='string') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'A valid sessionId must be provided.'
        );
    }
   
    try {
        const db = admin.firestore();
        const sessionRef =  db.collection('sessions').doc(sessionId);
        const sessionDoc = await sessionRef.get();

        //Check if session exists
        if (!sessionDoc.exists) {
            throw new functions.https.HttpsError(
                'session not found',
                'This Session does not exist'
            );
    }

    const sessionData = sessionDoc.data();
    const userId = context.auth.uid;
    const userToken = context.auth.token;

    //Check if user is admin or session owner and authorize deletion
    const isOwner =sessionData?.adminI === userId;
    const isAdmin = userToken?.admin === true;
    const hasNoAdminId = !sessionData?.adminId;

    if (isOwner && !isAdmin && !hasNoAdminId) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Insufficient Permissoins: Only Admins can delete sessions.'
        );
    }

    //start batch operation for atomic deletion

    const batch = db.batch();

    //Batch delete session doc(deletes the session itself)
    batch.delete(sessionRef);

    //Clean up related attendance logs
    const attendanceQuery = db.collection('attendanceLogs')
        .where('sessionId', '==', sessionId);
    const attendanceSnapshot = await attendanceQuery.get();

    attendanceSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    
    //Commit all deletions atomically
    await batch.commit();

    //Log the deletion for audit purposes
    console.log(`Session ${sessionId} deleted by user ${userId}`);

    return {
        success: true,
        message: `Session ${sessionId} and related attendance logs have been deleted successfully.`,
        deletedSessionId: sessionId,
        deletedAttendanceLogs: attendanceSnapshot.size
    };

} catch (error) {
        console.error('Session deletion error:', error);
        
        // Re-throw HttpsError as-is
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        // Wrap other errors
        throw new functions.https.HttpsError(
            'internal',
            'An unexpected error occurred: Failed to delete session.'
        );
    }
});