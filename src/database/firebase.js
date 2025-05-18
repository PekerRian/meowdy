// Import the necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2GHJoUnmC4PrRO5Ln_gCYfwj1iAfrUQI",
  authDomain: "meowdycats-c1b50.firebaseapp.com",
  projectId: "meowdycats-c1b50",
  storageBucket: "meowdycats-c1b50.firebasestorage.app",
  messagingSenderId: "276581690245",
  appId: "1:276581690245:web:8276ac79fa898828c432ec",
  measurementId: "G-H3B5DQXQ5S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };