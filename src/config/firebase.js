import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyAwB0U5ZVBi33D0penzuoOjmoZ8yLwDM50",
  authDomain: "lira-inmobiliaria.firebaseapp.com",
  projectId: "lira-inmobiliaria",
  storageBucket: "lira-inmobiliaria.firebasestorage.app",
  messagingSenderId: "455226878020",
  appId: "1:455226878020:web:9a5d712446efb85a463411",
  measurementId: "G-K7RJBDRMNX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const storage = getStorage(app);

export const provider = new GoogleAuthProvider();
