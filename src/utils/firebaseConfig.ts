// Import the functions you need from the SDKs you need
import { initializeApp,getApps  } from "firebase/app";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJiH9B0KthXW63NKIF6Aoj-HT12SuL6hA",
  authDomain: "vtrack-de155.firebaseapp.com",
  projectId: "vtrack-de155",
  storageBucket: "vtrack-de155.firebasestorage.app",
  messagingSenderId: "911229433453",
  appId: "1:911229433453:web:56e5dbc5f20c4423feb164",
  measurementId: "G-BN3NKXT45Y"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const messaging = getMessaging(app);