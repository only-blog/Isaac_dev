// Firebase configuration and initialization
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBO_lkHCi7QIOcE1vbNEtx3gknsDfZHAps",
  authDomain: "banco-de-dadossy.firebaseapp.com",
  projectId: "banco-de-dadossy",
  storageBucket: "banco-de-dadossy.firebasestorage.app",
  messagingSenderId: "1972078944",
  appId: "1:1972078944:web:d5c938bb64f05448f87605",
  measurementId: "G-R5DQCJ1N66",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
