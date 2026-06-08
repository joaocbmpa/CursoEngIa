// src/admin/Relatorios/ListaRelatoriosAdmin.js
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function ListaRelatoriosAdmin() {
  const [relatorios, setRelatorios] = useState({
    produtos: 0,
    pedidos: 0,
    usuarios: 0,
    cuponsAtivos: 0
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [produtosSnap, pedidosSnap, usuariosSnap, cuponsSnap] = await Promise.all([
          getDocs(collection(db, 'produtos')),
          getDocs(collection(db, 'pedidos')),
          getDocs(collection(db, 'usuarios')),
          getDocs(collection(db, 'cupons'))
        ]);

        const cuponsAtivos = cuponsSnap.docs.filter(doc => doc.data().ativo).length;

        setRelatorios({
          produtos: produtosSnap.size,
          pedidos: pedidosSnap.size,
          usuarios: usuariosSnap.size,
          cuponsAtivos
        });
      } catch (err) {
        console.error('Erro ao carregar relatórios:', err);
        setErro('Erro ao carregar dados dos relatórios.');
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  return (
    <div className="p-3">
      <h3 className="mb-4">📊 Relatórios</h3>

      {carregando && <Spinner animation="border" />}
      {erro && <Alert variant="danger">{erro}</Alert>}

      {!carregando && !erro && (
        <Row className="g-4">
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <Card.Title>Produtos</Card.Title>
                <Card.Text className="display-6">{relatorios.produtos}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <Card.Title>Pedidos</Card.Title>
                <Card.Text className="display-6">{relatorios.pedidos}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <Card.Title>Usuários</Card.Title>
                <Card.Text className="display-6">{relatorios.usuarios}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <Card.Title>Cupons Ativos</Card.Title>
                <Card.Text className="display-6">{relatorios.cuponsAtivos}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
