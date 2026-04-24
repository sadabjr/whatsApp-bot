import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAZpybQa_c_zYRXuyiJz2VMdqU3KWugwuw",
  authDomain: "whatsapp-agent-209a2.firebaseapp.com",
  databaseURL: "https://whatsapp-agent-209a2-default-rtdb.firebaseio.com",
  projectId: "whatsapp-agent-209a2",
  storageBucket: "whatsapp-agent-209a2.firebasestorage.app",
  messagingSenderId: "470069034756",
  appId: "1:470069034756:web:68541a8042b548ff399a51"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
