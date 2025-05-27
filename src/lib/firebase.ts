// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9rBubO644uLujowvGgZ88kijyhr6UX1A",
  authDomain: "nomnom-103d6.firebaseapp.com",
  projectId: "nomnom-103d6",
  storageBucket: "nomnom-103d6.firebasestorage.app",
  messagingSenderId: "981324903048",
  appId: "1:981324903048:web:8618ca311b5ca78093e53d",
  measurementId: "G-4BPWCVDEQW"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };