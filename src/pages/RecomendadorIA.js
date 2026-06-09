import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { produtosMock } from '../data/produtosMock';
import { usuariosMock } from '../data/usuariosMock';
import {
  criarContexto,
  gerarRankingRecomendacoes,
  usuarioTesteRecomendacao,
} from '../services/recomendadorIAService';
import '../styles/RecomendadorIA.css';

export default function RecomendadorIA() {
  const [ranking, setRanking] = useState([]);
  const [status, setStatus] = useState('Treinando modelo no navegador...');
  const [erro, setErro] = useState('');
  const [loss, setLoss] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [contextoTreino, setContextoTreino] = useState(() => criarContexto(produtosMock, usuariosMock));

  const featureInfo = useMemo(() => ({
    categorias: contextoTreino.categorias,
    cores: contextoTreino.cores,
    limites: {
      idadeMin: contextoTreino.minAge,
      idadeMax: contextoTreino.maxAge,
      precoMin: contextoTreino.minPrice,
      precoMax: contextoTreino.maxPrice,
    },
  }), [contextoTreino]);

  useEffect(() => {
    let ativo = true;

    async function executarRecomendacao() {
      try {
        const resultado = await gerarRankingRecomendacoes({ usuario: usuarioTesteRecomendacao });

        if (!ativo) return;
        setRanking(resultado.ranking);
        setLoss(resultado.loss);
        setAccuracy(resultado.accuracy);
        setContextoTreino(resultado.contexto);
        setStatus('Modelo treinado no navegador com histórico mockado de compras.');
      } catch (error) {
        if (!ativo) return;
        setErro('Não foi possível treinar o modelo localmente neste navegador.');
        setStatus('Falha ao treinar modelo.');
        console.error(error);
      }
    }

    executarRecomendacao();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <Container className="recomendador-ia py-5">
      <div className="recomendador-ia__hero mb-4">
        <Badge bg="info" text="dark" className="mb-3">Módulo 01 • IA aplicada</Badge>
        <h1>Recomendador IA da IA Chess Store</h1>
        <p>
          O ranking abaixo é gerado por uma rede neural treinada no navegador com dados fictícios
          de usuários, compras e produtos de xadrez.
        </p>
      </div>

      <Alert variant="warning">
        Projeto acadêmico: todos os produtos, usuários, compras e pontuações são fictícios. Não há
        Firebase real, gateway de pagamento real, credenciais ou dados de produção.
      </Alert>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Usuário teste</Card.Title>
              <ul className="mb-0">
                <li>Nome: {usuarioTesteRecomendacao.nome}</li>
                <li>Idade: {usuarioTesteRecomendacao.idade} anos</li>
                <li>Histórico de compras: nenhum</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Como a IA aprende</Card.Title>
              <p>
                O treino combina vetores de usuário e produto. O label é <code>1</code> quando um
                usuário mockado comprou o produto e <code>0</code> quando não comprou. O modelo usa
                normalização min-max, one-hot encoding para categoria/cor e aprende padrões de comportamento.
              </p>
              <p className="mb-1"><strong>Categorias:</strong> {featureInfo.categorias.join(', ')}</p>
              <p className="mb-0"><strong>Cores:</strong> {featureInfo.cores.join(', ')}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Features usadas</Card.Title>
              <ul className="mb-0">
                <li>Preço normalizado e ponderado.</li>
                <li>Média de idade dos compradores por produto.</li>
                <li>Categoria com one-hot encoding ponderado.</li>
                <li>Cor com one-hot encoding ponderado.</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Configuração da rede</Card.Title>
              <p className="mb-0">
                Dense 128/64/32 com ReLU, saída sigmoid, <code>adam(0.01)</code>,
                <code> binaryCrossentropy</code>, métrica <code>accuracy</code>, 100 épocas e batch size 32.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
        {ranking.length === 0 && !erro && <Spinner animation="border" size="sm" />}
        <span>{status}</span>
        {loss !== null && <Badge bg="secondary">loss: {Number(loss).toFixed(5)}</Badge>}
        {accuracy !== null && accuracy !== undefined && (
          <Badge bg="success">accuracy: {(Number(accuracy) * 100).toFixed(1)}%</Badge>
        )}
      </div>

      {erro && <Alert variant="danger">{erro}</Alert>}

      <Row className="g-4">
        {ranking.map((produto, index) => (
          <Col md={6} lg={4} key={produto.id}>
            <Card className="h-100 recomendador-ia__card shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Badge bg={index === 0 ? 'success' : 'primary'}>#{index + 1}</Badge>
                  <span className="recomendador-ia__score">{(produto.score * 100).toFixed(1)}%</span>
                </div>
                <Card.Title>{produto.nome}</Card.Title>
                <Card.Text>{produto.descricao}</Card.Text>
                <div className="d-flex flex-wrap gap-2">
                  <Badge bg="light" text="dark">{produto.categoria}</Badge>
                  <Badge bg="light" text="dark">{produto.cor}</Badge>
                  <Badge bg="light" text="dark">{produto.idadeIndicada}+ anos</Badge>
                  <Badge bg="light" text="dark">R$ {produto.preco.toFixed(2)}</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
