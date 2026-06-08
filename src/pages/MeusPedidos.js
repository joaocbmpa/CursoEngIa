// src/pages/MeusPedidos.js
import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  Container, Row, Col, Card, Spinner, Alert, Button, ButtonGroup, Collapse
} from 'react-bootstrap';
import {
  collection, query, where, orderBy, getDocs, limit, startAfter
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthContext } from '../context/AuthContext';

const iconeStatus = {
  pendente: '⏳',
  enviado: '📦',
  concluido: '✅',
  approved: '✅'
};

export default function MeusPedidos() {
  const { usuario } = useContext(AuthContext);
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState('todos');
  const [ultimaPagina, setUltimaPagina] = useState(null);
  const [paginando, setPaginando] = useState(false);
  const [detalhesVisiveis, setDetalhesVisiveis] = useState({});

  const LIMITE = 6;

  const carregarPedidos = useCallback(async (filtroAtual = 'todos', startAfterDoc = null) => {
    if (!usuario) return;

    setCarregando(!startAfterDoc);
    setPaginando(!!startAfterDoc);
    setErro(null);

    try {
      const ref = collection(db, 'pedidos');
      let q = query(
        ref,
        where('uid', '==', usuario.uid),
        filtroAtual === 'todos' ? orderBy('criadoEm', 'desc') : where('status', '==', filtroAtual),
        orderBy('criadoEm', 'desc'),
        limit(LIMITE)
      );

      if (startAfterDoc) q = query(q, startAfter(startAfterDoc));

      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), ref: doc }));

      setPedidos(prev => startAfterDoc ? [...prev, ...lista] : lista);
      setUltimaPagina(snapshot.docs[snapshot.docs.length - 1]);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      setErro('❌ Erro ao buscar seus pedidos.');
    } finally {
      setCarregando(false);
      setPaginando(false);
    }
  }, [usuario]);

  useEffect(() => {
    carregarPedidos(filtro);
  }, [usuario, filtro, carregarPedidos]);

  const handleFiltro = (status) => {
    setFiltro(status);
    setUltimaPagina(null);
    setPedidos([]);
  };

  const toggleDetalhes = (id) => {
    setDetalhesVisiveis(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Container className="my-5">
      <h2 className="mb-3">📦 Meus Pedidos</h2>

      <ButtonGroup className="mb-4">
        {['todos', 'pendente', 'approved', 'enviado', 'concluido'].map(status => (
          <Button
            key={status}
            variant={filtro === status ? 'primary' : 'outline-primary'}
            onClick={() => handleFiltro(status)}
          >
            {status === 'todos' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </ButtonGroup>

      {carregando && <Spinner animation="border" />}<br />
      {erro && <Alert variant="danger">{erro}</Alert>}
      {pedidos.length === 0 && !carregando && (
        <Alert variant="info">Você não possui pedidos com este status!</Alert>
      )}

      <Row>
        {pedidos.map(pedido => (
          <Col key={pedido.id} md={6} lg={4} className="mb-4">
            <Card>
              <Card.Header>
                <strong>📄 Pedido #{pedido.id.slice(-6).toUpperCase()}</strong>
              </Card.Header>
              <Card.Body>
                <p><strong>Status:</strong> {iconeStatus[pedido.status] || '📄'} {pedido.status}</p>
                <p><strong>Total:</strong> R$ {pedido.total?.toFixed(2)}</p>
                <p><strong>Data:</strong> {pedido.criadoEm?.toDate?.()
                  ? new Date(pedido.criadoEm.toDate()).toLocaleString()
                  : '---'}</p>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => toggleDetalhes(pedido.id)}
                  className="mt-2"
                >
                  {detalhesVisiveis[pedido.id] ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                </Button>

                <Collapse in={detalhesVisiveis[pedido.id]}>
                  <div className="mt-3">
                    <strong>Itens:</strong>
                    <ul>
                      {pedido.itens?.map((item, idx) => (
                        <li key={idx}>
                          {item.nome} ({item.variacao || 'único'}) - {item.quantidade}x
                          {item.produtoId && pedido.status === 'approved' && (
                            <div className="mt-1">
                              <a
                                href={`/download-ebook/${item.produtoId}/${pedido.id}`}
                                className="btn btn-success btn-sm mt-1"
                              >
                                📥 Baixar eBook
                              </a>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>

                    {pedido.frete && (
                      <p><strong>Frete:</strong> R$ {pedido.frete?.toFixed(2)}</p>
                    )}
                    {pedido.prazoEntrega && (
                      <p><strong>Prazo de Entrega:</strong> {pedido.prazoEntrega} dias úteis</p>
                    )}

                    {pedido.endereco && typeof pedido.endereco === "object" && (
                      <>
                        <strong>Entrega:</strong>
                        <p>
                          {pedido.endereco.rua}, {pedido.endereco.numero}<br />
                          {pedido.endereco.bairro} - {pedido.endereco.cidade}/{pedido.endereco.estado}<br />
                          CEP: {pedido.endereco.cep}
                        </p>
                      </>
                    )}
                    {pedido.observacao && (
                      <p><strong>Obs.:</strong> {pedido.observacao}</p>
                    )}
                  </div>
                </Collapse>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {ultimaPagina && !paginando && (
        <div className="text-center mt-4">
          <Button variant="secondary" onClick={() => carregarPedidos(filtro, ultimaPagina)}>
            Carregar mais
          </Button>
        </div>
      )}
    </Container>
  );
}
