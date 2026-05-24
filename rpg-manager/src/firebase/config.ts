import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBbDABigMQYZo05Mr4fKH98jlcSoQYqC_0",
  authDomain: "rpg-2026.firebaseapp.com",
  projectId: "rpg-2026",
  storageBucket: "rpg-2026.firebasestorage.app",
  messagingSenderId: "527215651263",
  appId: "1:527215651263:web:4e20b9c47aede5974e190a",
  measurementId: "G-1Y63LWT0BJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

if (typeof window !== "undefined") {
  isSupported().then(yes => yes && getAnalytics(app));
}

export default app;
