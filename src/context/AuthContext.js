import React, { createContext, useState, useEffect, useContext } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const docRef = doc(db, "usuarios", user.uid);
          const snap = await getDoc(docRef);

          if (!snap.exists()) {
            // cria doc básico
            const novoUsuario = {
              uid: user.uid,
              email: user.email,
              role: "cliente",
              nome: user.displayName || "",
              ultimoCep: null,
              cupom: null,           // <- novo
              comissao: 0,           // <- novo (0 a 1) ex.: 0.05 = 5%
              criadoEm: new Date().toISOString(),
            };
            await setDoc(docRef, novoUsuario);
          }

          const data = (await getDoc(docRef)).data() || {};
          setUsuario({
            uid: user.uid,
            displayName: user.displayName || data.nome || "",
            email: user.email,
            role: data.role || "cliente",
            ultimoCep: data.ultimoCep || null,
            cupom: data.cupom || null,                 // <- novo
            comissao: typeof data.comissao === "number" ? data.comissao : 0, // <- novo
          });
        } else {
          setUsuario(null);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do usuário:", err);
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      throw error;
    }
  };

  const loginEmailSenha = async (email, senha) => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (error) {
      throw new Error("Erro ao fazer login: " + error.message);
    }
  };

  const cadastrarEmailSenha = async (nome, email, senha) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      if (nome && cred.user) {
        await updateProfile(cred.user, { displayName: nome });
      }

      const dados = {
        uid: cred.user.uid,
        email: cred.user.email,
        role: "cliente",
        nome: nome || "",
        ultimoCep: null,
        cupom: null,     // <- novo
        comissao: 0,     // <- novo
        criadoEm: new Date().toISOString(),
      };

      await setDoc(doc(db, "usuarios", cred.user.uid), dados);

      // reflete no estado imediatamente
      setUsuario({
        uid: cred.user.uid,
        displayName: nome || "",
        email: cred.user.email,
        role: "cliente",
        ultimoCep: null,
        cupom: null,
        comissao: 0,
      });
    } catch (error) {
      throw new Error("Erro ao criar conta: " + error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUsuario(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        logando: carregando,      // 🔁 alias p/ checkout
        login,
        loginComGoogle: login,     // 🔁 alias p/ checkout
        logout,
        loginEmailSenha,
        cadastrarEmailSenha,
      }}
    >
      {!carregando && children}
    </AuthContext.Provider>
  );
};

// Hooks práticos
export const useAuth = () => useContext(AuthContext);
