import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { gerarRankingRecomendacoes, usuarioTesteRecomendacao } from '../services/recomendadorIAService';
import '../styles/Home.css';

export default function Home() {
  const [recomendados, setRecomendados] = useState([]);
  const [status, setStatus] = useState('Treinando rede neural no navegador...');
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregarTopRecomendacoes() {
      try {
        const resultado = await gerarRankingRecomendacoes({ usuario: usuarioTesteRecomendacao, limite: 3 });
        if (!ativo) return;
        setRecomendados(resultado?.ranking || []);
        setStatus('Top 3 gerado com histórico mockado de compras.');
      } catch (error) {
        if (!ativo) return;
        setErro('Não foi possível treinar a rede neural neste navegador.');
        setStatus('Falha ao gerar recomendações.');
        console.error(error);
      }
    }

    carregarTopRecomendacoes();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <main className="ia-store-home">
      <section className="ia-store-hero">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={7}>
              <Badge bg="info" text="dark" className="mb-3">Projeto acadêmico • Módulo 01</Badge>
              <h1>Loja fictícia com recomendação por Inteligência Artificial</h1>
              <p className="lead">
                A IA Chess Store demonstra uma vitrine de xadrez totalmente fictícia, onde o ranking
                de produtos é gerado por uma rede neural treinada no navegador com TensorFlow.js.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Button as={Link} to="/recomendador-ia" variant="light" size="lg">
                  Ver Recomendador IA
                </Button>
                <Button as={Link} to="/sobre" variant="outline-light" size="lg">
                  Sobre o Exercício
                </Button>
              </div>
            </Col>
            <Col lg={5}>
              <Card className="ia-store-hero-card shadow-lg">
                <Card.Body>
                  <Card.Title>Como o ranking é criado?</Card.Title>
                  <p>
                    A rede aprende padrões em compras fictícias, transforma usuários e produtos em vetores
                    e prevê a chance de recomendação para um visitante sem histórico.
                  </p>
                  <div className="d-flex align-items-center gap-2 text-info-emphasis">
                    {recomendados.length === 0 && !erro && <Spinner animation="border" size="sm" />}
                    <span>{status}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        <div className="section-heading text-center mb-4">
          <Badge bg="primary" className="mb-2">Top 3</Badge>
          <h2>Produtos recomendados pela IA</h2>
          <p>Recomendações calculadas localmente com dados mockados e sem qualquer integração real.</p>
        </div>

        {erro && <Alert variant="danger">{erro}</Alert>}

        <Row className="g-4">
          {recomendados.length === 0 && !erro && [1, 2, 3].map((item) => (
            <Col md={4} key={item}>
              <Card className="h-100 product-card-placeholder">
                <Card.Body className="d-flex align-items-center justify-content-center">
                  <Spinner animation="border" />
                </Card.Body>
              </Card>
            </Col>
          ))}

          {recomendados.map((produto, index) => (
            <Col md={4} key={produto.id}>
              <Card className="h-100 ia-product-card shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Badge bg={index === 0 ? 'success' : 'dark'}>#{index + 1}</Badge>
                    <span className="ia-product-score">{(produto.score * 100).toFixed(1)}%</span>
                  </div>
                  <Card.Title>{produto.nome}</Card.Title>
                  <Card.Text>{produto.descricao}</Card.Text>
                  <div className="d-flex flex-wrap gap-2">
                    <Badge bg="light" text="dark">{produto.categoria}</Badge>
                    <Badge bg="light" text="dark">{produto.cor}</Badge>
                    <Badge bg="light" text="dark">R$ {produto.preco.toFixed(2)}</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <section className="ia-how-section py-5">
        <Container>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <h3>1. Dados mockados</h3>
                  <p>Produtos e usuários são fictícios, criados apenas para o exercício acadêmico.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <h3>2. Features usadas</h3>
                  <p>Preço, idade média dos compradores, categoria e cor viram vetores numéricos.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <h3>3. Rede neural</h3>
                  <p>O modelo aprende com compras mockadas e ordena o ranking no próprio navegador.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}
