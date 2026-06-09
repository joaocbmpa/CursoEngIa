// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Configuração acadêmica e fictícia.
// Não use este arquivo para produção e não adicione chaves reais ao repositório.
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "projeto-academico-ia.example.invalid",
  projectId: "projeto-academico-ia",
  storageBucket: "projeto-academico-ia.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:demoacademico",
  measurementId: "G-DEMOACADEMICO"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
