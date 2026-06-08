// src/pages/MinhasCompras.js
import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";

const icones = {
  pendente: "⏳",
  aprovado: "✅",
  enviado: "📦",
  concluido: "🎉",
};

export default function MinhasCompras() {
  const { usuario } = useContext(AuthContext);
  const [compras, setCompras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarCompras = async () => {
      if (!usuario) return;
      setCarregando(true);
      setErro(null);

      try {
        const pedidosRef = collection(db, "pedidos");
        const q = query(
          pedidosRef,
          where("uid", "==", usuario.uid),
          orderBy("criadoEm", "desc")
        );
        const snapshot = await getDocs(q);
        const resultado = [];

        for (const docPedido of snapshot.docs) {
          const pedido = docPedido.data();
          const data = pedido.criadoEm?.toDate?.()?.toLocaleString() || "---";

          for (const item of pedido.itens || []) {
            const prodRef = doc(db, "produtos", item.produtoId);
            const prodSnap = await getDoc(prodRef);
            const produto = prodSnap.exists() ? prodSnap.data() : null;

            resultado.push({
              nome: item.nome,
              variacao: item.variacao,
              quantidade: item.quantidade,
              status: pedido.status,
              pedidoId: docPedido.id,
              produtoId: item.produtoId,
              data,
              frete: pedido.frete || null,
              prazoEntrega: pedido.prazoEntrega || null,
              digital: produto?.digital || false,
              arquivoUrl: produto?.arquivoUrl || null,
            });
          }
        }

        setCompras(resultado);
      } catch (error) {
        console.error("Erro ao buscar compras:", error);
        setErro("❌ Erro ao buscar suas compras.");
      } finally {
        setCarregando(false);
      }
    };

    carregarCompras();
  }, [usuario]);

  const registrarDownload = async (pedidoId, produtoId) => {
    if (!usuario) return;
    try {
      const ref = doc(db, `pedidos/${pedidoId}/downloads/${usuario.uid}`);
      await setDoc(ref, {
        uid: usuario.uid,
        produtoId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Erro ao registrar download:", error);
    }
  };

  return (
    <Container className="my-5">
      <h2 className="mb-4">🛍️ Minhas Compras</h2>

      {carregando && <Spinner animation="border" />}
      {erro && <Alert variant="danger">{erro}</Alert>}

      {compras.length === 0 && !carregando && (
        <Alert variant="info">Você ainda não possui compras registradas.</Alert>
      )}

      <Row>
        {compras.map((compra, idx) => (
          <Col key={idx} md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Body className="d-flex flex-column justify-content-between">
                <div>
                  <Card.Title>{compra.nome}</Card.Title>
                  {compra.variacao && (
                    <Card.Text>
                      <strong>Variação:</strong> {compra.variacao}
                    </Card.Text>
                  )}
                  <Card.Text>
                    <strong>Quantidade:</strong> {compra.quantidade}
                  </Card.Text>
                  <Card.Text>
                    <strong>Status:</strong> {icones[compra.status]} {compra.status}
                  </Card.Text>
                  <Card.Text>
                    <strong>Pedido:</strong> #{compra.pedidoId.slice(-6).toUpperCase()}
                  </Card.Text>
                  <Card.Text>
                    <strong>Data:</strong> {compra.data}
                  </Card.Text>

                  {compra.frete && (
                    <Card.Text>
                      <strong>Frete:</strong> R$ {Number(compra.frete).toFixed(2)}
                    </Card.Text>
                  )}
                  {compra.prazoEntrega && (
                    <Card.Text>
                      <strong>Prazo de Entrega:</strong> {compra.prazoEntrega} dias úteis
                    </Card.Text>
                  )}
                </div>
                {compra.digital && compra.arquivoUrl && (
                  <Button
                    variant="success"
                    href={compra.arquivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => registrarDownload(compra.pedidoId, compra.produtoId)}
                  >
                    📥 Baixar Produto Digital
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
