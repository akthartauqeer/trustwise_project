// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4HDRnacyi2tLNfsMQcJdaknFSVwzsN_o",
  authDomain: "trustwise-96b7e.firebaseapp.com",
  projectId: "trustwise-96b7e",
  storageBucket: "trustwise-96b7e.firebasestorage.app",
  messagingSenderId: "837978865053",
  appId: "1:837978865053:web:4b258c82a87e9e326ec374",
  measurementId: "G-S95GX45QCE"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore(app)
