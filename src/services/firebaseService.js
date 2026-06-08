// src/services/firebaseService.js
import { db } from '../firebase/config';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';

// Buscar todas as categorias
export async function buscarCategorias() {
  const snapshot = await getDocs(collection(db, 'categorias'));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Buscar produtos por categoria
export async function buscarProdutosPorCategoria(idCategoria) {
  const q = query(
    collection(db, 'produtos'),
    where('categoriaId', '==', idCategoria)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Buscar variações de um produto
export async function buscarVariacoesProduto(produtoId) {
  const ref = collection(db, 'produtos', produtoId, 'variacoes');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Criar pedido (cria a coleção pedidos se não existir)
export async function criarPedido(pedido) {
  const ref = collection(db, 'pedidos');
  const docRef = await addDoc(ref, {
    ...pedido,
    status: 'pendente',
    criadoEm: Timestamp.now()
  });
  return docRef.id;
}

// Buscar pedidos de um usuário
export async function buscarPedidosDoUsuario(userId) {
  const q = query(
    collection(db, 'pedidos'),
    where('usuarioId', '==', userId),
    orderBy('criadoEm', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
