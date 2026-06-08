// Atualizado: MeusEbooks.js
import React, { useEffect, useState, useContext } from 'react';
import {
  Container, Row, Col, Card, Spinner, Alert, Button
} from 'react-bootstrap';
import {
  collection, query, where, getDocs, orderBy, doc, getDoc, setDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthContext } from '../context/AuthContext';

export default function MeusEbooks() {
  const { usuario } = useContext(AuthContext);
  const [ebooks, setEbooks] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const registrarDownload = async (pedidoId, produtoId) => {
    if (!usuario || !pedidoId || !produtoId) return;
    try {
      await setDoc(doc(db, `pedidos/${pedidoId}/downloads/${usuario.uid}`), {
        produtoId,
        uid: usuario.uid,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao registrar download:', error);
    }
  };

  useEffect(() => {
    const carregarEbooks = async () => {
      if (!usuario) return;
      setCarregando(true);
      setErro(null);

      try {
        const pedidosRef = collection(db, 'pedidos');
        const q = query(
          pedidosRef,
          where('uid', '==', usuario.uid),
          where('status', 'in', ['approved', 'enviado', 'concluido']),
          orderBy('criadoEm', 'desc')
        );

        const snapshot = await getDocs(q);
        const produtosMap = new Map();

        for (const docPedido of snapshot.docs) {
          const pedido = docPedido.data();
          const data = pedido.criadoEm?.toDate?.();

          for (const item of pedido.itens || []) {
            if (!item.produtoId) continue;

            if (!produtosMap.has(item.produtoId)) {
              const prodSnap = await getDoc(doc(db, 'produtos', item.produtoId));
              const produto = prodSnap.data();

              if (produto?.digital && produto?.arquivoUrl) {
                produtosMap.set(item.produtoId, {
                  nome: produto.nome,
                  pedidoId: docPedido.id,
                  url: produto.arquivoUrl,
                  produtoId: item.produtoId,
                  dataPedido: data ? data.toLocaleString() : '---'
                });
              }
            }
          }
        }

        setEbooks(Array.from(produtosMap.values()));
      } catch (error) {
        console.error("Erro ao carregar eBooks:", error);
        setErro("❌ Erro ao buscar seus eBooks.");
      } finally {
        setCarregando(false);
      }
    };

    carregarEbooks();
  }, [usuario]);

  return (
    <Container className="my-5">
      <h2 className="mb-4">📘 Meus eBooks</h2>

      {carregando && <Spinner animation="border" />}
      {erro && <Alert variant="danger">{erro}</Alert>}

      {ebooks.length === 0 && !carregando && (
        <Alert variant="info">Você ainda não possui eBooks liberados.</Alert>
      )}

      <Row>
        {ebooks.map((ebook, idx) => (
          <Col key={idx} md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Body className="d-flex flex-column justify-content-between">
                <div>
                  <Card.Title>{ebook.nome}</Card.Title>
                  <Card.Text><strong>Pedido:</strong> #{ebook.pedidoId.slice(-6).toUpperCase()}</Card.Text>
                  <Card.Text><strong>Data:</strong> {ebook.dataPedido}</Card.Text>
                </div>
                <Button
                  variant="success"
                  href={ebook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => registrarDownload(ebook.pedidoId, ebook.produtoId)}
                >
                  📥 Baixar eBook
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
