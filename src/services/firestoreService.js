// src/services/firestoreService.js
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

// Busca produtos por categoria
export const getProdutosPorCategoria = async (categoria) => {
  const produtosRef = collection(db, "produtos");
  const q = query(produtosRef, where("categoria", "==", categoria));

  const querySnapshot = await getDocs(q);
  const produtos = [];

  querySnapshot.forEach((doc) => {
    produtos.push({ id: doc.id, ...doc.data() });
  });

  return produtos;
};
