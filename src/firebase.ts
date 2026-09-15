import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDVRzkeY2reKjR5Gv0dHx55geqgivUjEAQ",
  authDomain: "urf1forall.firebaseapp.com",
  databaseURL: "https://urf1forall-default-rtdb.firebaseio.com",
  projectId: "urf1forall",
  storageBucket: "urf1forall.firebasestorage.app",
  messagingSenderId: "335719421403",
  appId: "1:335719421403:web:2b4a2b16150b6f6ba4c3fe",
  measurementId: "G-7DWZB1QBWQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

/** Path helper theo rules users/$uid */
export function logsPath(uid: string) {
  return `users/${uid}/logs`;
}
