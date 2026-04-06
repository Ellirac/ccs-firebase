// src/config/firebase.js
// ─── Firebase SDK Initialization ──────────────────────────────────────────────
// Replace the firebaseConfig values with your actual project credentials from:
// Firebase Console → Project Settings → General → Your apps → Web app → Config

import { initializeApp }              from "firebase/app";
import { getAuth }                    from "firebase/auth";
import { getFirestore }               from "firebase/firestore";
import { getStorage }                 from "firebase/storage";

// ✅ Project: ccs-profiling-pnc — Pamantasan ng Cabuyao · CCS
const firebaseConfig = {
  apiKey:            "AIzaSyCd2fIQqDFDB0acgGbGsz02O8tmFa1dKdY",
  authDomain:        "ccs-profiling-pnc.firebaseapp.com",
  projectId:         "ccs-profiling-pnc",
  storageBucket:     "ccs-profiling-pnc.firebasestorage.app",
  messagingSenderId: "261388314792",
  appId:             "1:261388314792:web:9d0e3d1c32d35169e43a9d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

export default app;
