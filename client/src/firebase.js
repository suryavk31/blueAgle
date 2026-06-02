import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_Placeholder",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "project-one.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "project-one",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "project-one.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
import { getAnalytics } from "firebase/analytics";

let app;
let auth;
let analytics;

const apiKey = firebaseConfig.apiKey;
if (!apiKey || apiKey.includes("Placeholder") || apiKey.includes("your_api_key")) {
    console.warn("⚠️ Firebase keys are missing or placeholders. Auth will be disabled.");
    auth = null;
} else {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        if (firebaseConfig.measurementId) {
            analytics = getAnalytics(app);
        }
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        auth = null;
    }
}

export { auth, analytics };
