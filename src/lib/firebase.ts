import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2XACpEVMdXvcxrzlobQUnGx4Vax-P3aQ",
  authDomain: "studentnest-cad3d.firebaseapp.com",
  projectId: "studentnest-cad3d",
  storageBucket: "studentnest-cad3d.firebasestorage.app",
  messagingSenderId: "199617626278",
  appId: "1:199617626278:web:741e92f3caed9dcf2f7467"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
