// src/services/authService.js
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
  } from "firebase/auth";
  import { app } from "../firebase/config";
  
  const auth = getAuth(app);
  
  // Cria novo usuário
  export const cadastrarUsuario = async (email, senha) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };
  
  // Login
  export const loginUsuario = async (email, senha) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };
  
  // Logout
  export const logoutUsuario = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };
  
  // Escutar mudanças de login
  export const escutarUsuarioLogado = (callback) => {
    return onAuthStateChanged(auth, callback);
  };
  