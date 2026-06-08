// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDuHSkhybt57v6v-v0nmGeXi1Rn3Q-08KY",
  authDomain: "xadrezjl-828b4.firebaseapp.com",
  projectId: "xadrezjl-828b4",
  storageBucket: "xadrezjl-828b4",
  messagingSenderId: "32481571842",
  appId: "1:32481571842:web:5bac6a68a79c8aeb73e31b",
  measurementId: "G-8CMR4FY78F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
