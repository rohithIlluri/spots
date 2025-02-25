import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCql09Ap8rR9EgkPwM2lM89068kqkvTbWo",
  authDomain: "spots-b2657.firebaseapp.com",
  projectId: "spots-b2657",
  storageBucket: "spots-b2657.appspot.com",
  messagingSenderId: "279503567634",
  appId: "1:279503567634:web:2d3d04e469507d709591cb",
  measurementId: "G-0NVFZHMCB9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);