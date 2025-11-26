import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDq33ZTFy2NKeJ7QN_E1_1-zHboytkayR8",
  authDomain: "attendance-app-3efdc.firebaseapp.com",
  projectId: "attendance-app-3efdc",
  storageBucket: "attendance-app-3efdc.firebasestorage.app",
  messagingSenderId: "497796473137",
  appId: "1:497796473137:web:f0e099936c2da1a1a99010",
  measurementId: "G-7Z9R9H9QBW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
// Initialize Firestore and export db
export const db = getFirestore(app);
// Initialize Storage
export const storage = getStorage(app);

export default app; 