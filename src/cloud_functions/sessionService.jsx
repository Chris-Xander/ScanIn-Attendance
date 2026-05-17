import { auth } from '../firebase/config';

const PROJECT_ID = 'attendance-app-3efdc';
const REGION = 'us-central1';
const DELETE_SESSION_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/deleteSessionHttp`;

export const deleteSession = async (sessionId) => {
    const user = auth.currentUser;
    if (!user) {
        const err = new Error('Authentication required to delete sessions.');
        err.code = 'unauthenticated';
        throw err;
    }
    const token = await user.getIdToken();
    const res = await fetch(DELETE_SESSION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
    });
    const data = await res.json();

    if (!res.ok) {
        const err = new Error(data?.error?.message || 'Failed to delete session');
        err.code = data?.error?.code || 'internal';
        throw err;
    }
    return data.result;
};
