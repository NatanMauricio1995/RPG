"use client";

import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";

const firebaseConfig={

apiKey:"AIzaSyBbDABigMQYZo05Mr4fKH98jlcSoQYqC_0",
authDomain:"rpg-2026.firebaseapp.com",
projectId:"rpg-2026",
storageBucket:"rpg-2026.firebasestorage.app",
messagingSenderId:"527215651263",
appId:"1:527215651263:web:4e20b9c47aede5974e190a"

};

const app=initializeApp(firebaseConfig);

export const db=
getFirestore(app);

export const storage=
getStorage(app);

export default app;