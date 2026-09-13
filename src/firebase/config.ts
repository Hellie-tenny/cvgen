import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Values come from your .env file (VITE_FIREBASE_*), never hardcoded here.
// Firebase's client config isn't a secret in the traditional sense — it's
// safe to ship in the browser bundle — but Firestore security rules are
// what actually control access, not this config.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
