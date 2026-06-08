import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container, Alert, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

export default function Obrigado() {
  const { search } = useLocation();
  const status = new URLSearchParams(search).get('status');
  const { usuario } = useContext(AuthContext);

  const [ebooks, setEbooks] = useState([]);

  useEffect(() => {
    const buscarEbooks = async () => {
      if (!usuario || status !== 'success') return;

      try {
        const pedidosRef = collection(db, 'pedidos');
        const q = query(
          pedidosRef,
          where('uid', '==', usuario.uid),
          where('status', 'in', ['approved', 'enviado', 'concluido']),
          orderBy('criadoEm', 'desc'),
          limit(1)
        );

        const snap = await getDocs(q);
        if (!snap.empty) {
          const pedido = snap.docs[0];
          const data = pedido.data();

          const encontrados = [];

          for (const item of data.itens || []) {
            if (!item.produtoId) continue;

            const produtoSnap = await getDoc(doc(db, 'produtos', item.produtoId));
            const produto = produtoSnap.data();

            if (produto?.digital && produto?.arquivoUrl) {
              encontrados.push({
                nome: produto.nome,
                url: produto.arquivoUrl,
                produtoId: item.produtoId,
                pedidoId: pedido.id
              });
            }
          }

          setEbooks(encontrados);
        }
      } catch (error) {
        console.error("Erro ao buscar eBooks:", error);
      }
    };

    buscarEbooks();
  }, [usuario, status]);

  const registrarDownload = async (pedidoId, produtoId) => {
    if (!usuario || !pedidoId || !produtoId) return;

    try {
      const ref = doc(db, 'pedidos', pedidoId, 'downloads', usuario.uid);
      await setDoc(ref, {
        produtoId,
        uid: usuario.uid,
        baixadoEm: serverTimestamp()
      });
    } catch (e) {
      console.error('Erro ao registrar download:', e);
    }
  };

  const mensagens = {
    success: {
      titulo: '🎉 Obrigado pela sua compra!',
      texto: 'Seu pedido foi confirmado e está sendo processado.'
    },
    pending: {
      titulo: '⏳ Pagamento Pendente',
      texto: 'Estamos aguardando a confirmação do seu pagamento. Você receberá um e-mail assim que for aprovado.'
    },
    failure: {
      titulo: '❌ Pagamento Não Realizado',
      texto: 'Ocorreu um problema com seu pagamento. Você pode tentar novamente.'
    },
    default: {
      titulo: '🎉 Obrigado pela sua compra!',
      texto: 'Seu pedido foi recebido com sucesso e está sendo processado.'
    }
  };

  const mensagem = mensagens[status] || mensagens.default;

  return (
    <Container className="text-center my-5">
      <Alert variant={status === 'failure' ? 'danger' : status === 'pending' ? 'warning' : 'success'}>
        <h2 className="mb-3">{mensagem.titulo}</h2>
        <p className="lead">{mensagem.texto}</p>
      </Alert>

      {status === 'success' && ebooks.length > 0 && (
        <div className="mt-4">
          <h5 className="mb-3">📘 Seus eBooks:</h5>
          {ebooks.map((ebook, idx) => (
            <div key={idx} className="mb-3">
              <p className="fw-bold">{ebook.nome}</p>
              <Button
                variant="success"
                href={ebook.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => registrarDownload(ebook.pedidoId, ebook.produtoId)}
              >
                📥 Baixar eBook
              </Button>
            </div>
          ))}
        </div>
      )}

      {status === 'success' && (
        <div className="mt-4">
          <p className="mt-4">
            <strong>📦 Deseja ver todos os seus pedidos?</strong>
          </p>
          <Link to="/meus-pedidos" className="btn btn-primary mt-2">
            Ver Meus Pedidos
          </Link>
        </div>
      )}

      <div className="mt-4">
        <Link to="/" className="btn btn-outline-secondary">← Voltar à loja</Link>
      </div>
    </Container>
  );
}
