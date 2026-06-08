// ✅ 1. Adicionar rastreamento de download ao clicar no botão de eBook
// src/components/BotaoDownloadEbook.js

import React from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

export default function BotaoDownloadEbook({ url, pedidoId, produtoId }) {
  const { usuario } = useAuth();

  const registrarDownload = async () => {
    if (!usuario || !pedidoId || !produtoId) return;

    const ref = doc(db, `pedidos/${pedidoId}/downloads/${usuario.uid}-${produtoId}`);
    await setDoc(ref, {
      uid: usuario.uid,
      produtoId,
      baixadoEm: serverTimestamp(),
    });
  };

  const handleClick = async () => {
    await registrarDownload();
    window.open(url, '_blank');
  };

  return (
    <button className="btn btn-success" onClick={handleClick}>
      📥 Baixar eBook
    </button>
  );
}
