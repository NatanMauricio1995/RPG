import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth } from "./config";

export const login = (email: string, pass: string) => 
  signInWithEmailAndPassword(auth, email, pass);

export const register = (email: string, pass: string) => 
  createUserWithEmailAndPassword(auth, email, pass);

export const logout = () => signOut(auth);

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => 
  onAuthStateChanged(auth, callback);
