import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

const deleteSessionFunction = httpsCallable(functions, 'deleteSession');

export const deleteSession = async (sessionId) => {
    try {
        const result = await deleteSessionFunction({ sessionId });
        return result.data;
    } catch (error) {
        console.error('Error deleting session:', error);
        throw error;
    }
};

