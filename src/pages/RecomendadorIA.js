import React, { useEffect, useMemo, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Alert, Badge, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { produtosMock } from '../data/produtosMock';
import '../styles/RecomendadorIA.css';

const usuarioTeste = {
  idade: 13,
  precoPreferido: 95,
  categoriaPreferida: 'pecas',
  corPreferida: 'preto',
};

const categorias = [...new Set(produtosMock.map((produto) => produto.categoria))];
const cores = [...new Set(produtosMock.map((produto) => produto.cor))];
const precos = produtosMock.map((produto) => produto.preco);
const idades = produtosMock.map((produto) => produto.idadeIndicada);

const limites = {
  idadeMin: Math.min(...idades),
  idadeMax: Math.max(...idades),
  precoMin: Math.min(...precos),
  precoMax: Math.max(...precos),
};

function normalizar(valor, minimo, maximo) {
  if (maximo === minimo) return 0;
  return (valor - minimo) / (maximo - minimo);
}

function oneHot(valor, opcoes) {
  return opcoes.map((opcao) => (opcao === valor ? 1 : 0));
}

function montarFeatures({ idade, preco, categoria, cor }) {
  return [
    normalizar(idade, limites.idadeMin, limites.idadeMax),
    normalizar(preco, limites.precoMin, limites.precoMax),
    ...oneHot(categoria, categorias),
    ...oneHot(cor, cores),
  ];
}

function calcularAfinidade(produto) {
  const distanciaIdade = Math.abs(produto.idadeIndicada - usuarioTeste.idade) / (limites.idadeMax - limites.idadeMin);
  const distanciaPreco = Math.abs(produto.preco - usuarioTeste.precoPreferido) / (limites.precoMax - limites.precoMin);
  const bonusCategoria = produto.categoria === usuarioTeste.categoriaPreferida ? 0.3 : 0;
  const bonusCor = produto.cor === usuarioTeste.corPreferida ? 0.2 : 0;
  const score = 1 - distanciaIdade * 0.35 - distanciaPreco * 0.35 + bonusCategoria + bonusCor;
  return Math.max(0.05, Math.min(0.98, score));
}

async function treinarModelo() {
  const xs = tf.tensor2d(
    produtosMock.map((produto) => montarFeatures({
      idade: produto.idadeIndicada,
      preco: produto.preco,
      categoria: produto.categoria,
      cor: produto.cor,
    }))
  );
  const ys = tf.tensor2d(produtosMock.map((produto) => [calcularAfinidade(produto)]));

  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [xs.shape[1]], units: 10, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 6, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
  model.compile({ optimizer: tf.train.adam(0.08), loss: 'meanSquaredError' });

  const history = await model.fit(xs, ys, {
    epochs: 120,
    shuffle: true,
    verbose: 0,
  });

  xs.dispose();
  ys.dispose();

  return { model, loss: history.history.loss.at(-1) };
}

export default function RecomendadorIA() {
  const [ranking, setRanking] = useState([]);
  const [status, setStatus] = useState('Treinando modelo no navegador...');
  const [erro, setErro] = useState('');
  const [loss, setLoss] = useState(null);

  const featureInfo = useMemo(() => ({ categorias, cores, limites }), []);

  useEffect(() => {
    let ativo = true;
    let model;

    async function executarRecomendacao() {
      try {
        await tf.ready();
        const resultadoTreino = await treinarModelo();
        model = resultadoTreino.model;

        const recomendacoes = await Promise.all(
          produtosMock.map(async (produto) => {
            const entrada = tf.tensor2d([
              montarFeatures({
                idade: usuarioTeste.idade,
                preco: produto.preco,
                categoria: produto.categoria,
                cor: produto.cor,
              }),
            ]);
            const predicao = model.predict(entrada);
            const [score] = await predicao.data();
            entrada.dispose();
            predicao.dispose();
            return { ...produto, score };
          })
        );

        if (!ativo) return;
        setRanking(recomendacoes.sort((a, b) => b.score - a.score));
        setLoss(resultadoTreino.loss);
        setStatus('Modelo treinado no navegador com dados fictícios.');
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
      if (model) model.dispose();
    };
  }, []);

  return (
    <Container className="recomendador-ia py-5">
      <div className="recomendador-ia__hero mb-4">
        <Badge bg="info" text="dark" className="mb-3">Módulo 01 • IA aplicada</Badge>
        <h1>Recomendador acadêmico de produtos com TensorFlow.js</h1>
        <p>
          Esta página usa apenas dados mockados para demonstrar, no navegador, um fluxo simples de
          recomendação com idade, preço, categoria e cor como features.
        </p>
      </div>

      <Alert variant="warning">
        Projeto acadêmico: os produtos, preferências e pontuações são fictícios. Nenhum dado real,
        chave de produção ou pagamento real é usado neste exercício.
      </Alert>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Usuário teste</Card.Title>
              <ul className="mb-0">
                <li>Idade: {usuarioTeste.idade} anos</li>
                <li>Preço preferido: R$ {usuarioTeste.precoPreferido.toFixed(2)}</li>
                <li>Categoria preferida: {usuarioTeste.categoriaPreferida}</li>
                <li>Cor preferida: {usuarioTeste.corPreferida}</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Pré-processamento</Card.Title>
              <p>
                Idade e preço são normalizados por min-max. Categoria e cor são convertidas com
                one-hot encoding antes do treinamento com <code>@tensorflow/tfjs</code>.
              </p>
              <p className="mb-1"><strong>Categorias:</strong> {featureInfo.categorias.join(', ')}</p>
              <p className="mb-0"><strong>Cores:</strong> {featureInfo.cores.join(', ')}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="d-flex align-items-center gap-2 mb-3">
        {ranking.length === 0 && !erro && <Spinner animation="border" size="sm" />}
        <span>{status}</span>
        {loss !== null && <Badge bg="secondary">loss: {Number(loss).toFixed(5)}</Badge>}
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
