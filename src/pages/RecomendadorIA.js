import React, { useEffect, useMemo, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Alert, Badge, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { produtosMock } from '../data/produtosMock';
import { usuariosMock } from '../data/usuariosMock';
import '../styles/RecomendadorIA.css';

const PESOS_FEATURES = {
  preco: 1.2,
  idadeMedia: 1,
  categoria: 1.5,
  cor: 1,
};

const usuarioTeste = {
  id: 'user-teste-sem-compras',
  nome: 'Usuário teste sem compras',
  idade: 13,
  compras: [],
};

function normalizar(valor, minimo, maximo) {
  if (maximo === minimo) return 0;
  return (valor - minimo) / (maximo - minimo);
}

function criarIndice(valores) {
  return valores.reduce((indice, valor, posicao) => ({ ...indice, [valor]: posicao }), {});
}

function calcularMedia(valores, fallback = 0) {
  if (!valores.length) return fallback;
  return valores.reduce((soma, valor) => soma + valor, 0) / valores.length;
}

function criarContexto(produtos, usuarios) {
  const precos = produtos.map((produto) => produto.preco);
  const idadesUsuarios = usuarios.map((usuario) => usuario.idade);
  const categorias = [...new Set(produtos.map((produto) => produto.categoria))];
  const cores = [...new Set(produtos.map((produto) => produto.cor))];
  const compradoresPorProduto = produtos.reduce((acumulador, produto) => {
    const compradores = usuarios.filter((usuario) => usuario.compras.includes(produto.id));
    return {
      ...acumulador,
      [produto.id]: compradores.map((usuario) => usuario.idade),
    };
  }, {});
  const mediaIdadeCompradoresPorProduto = produtos.reduce((acumulador, produto) => ({
    ...acumulador,
    [produto.id]: calcularMedia(compradoresPorProduto[produto.id], produto.idadeIndicada),
  }), {});

  return {
    minAge: Math.min(...idadesUsuarios),
    maxAge: Math.max(...idadesUsuarios),
    minPrice: Math.min(...precos),
    maxPrice: Math.max(...precos),
    categorias,
    cores,
    categoriaIndex: criarIndice(categorias),
    corIndex: criarIndice(cores),
    mediaIdadeCompradoresPorProduto,
  };
}

function encodeOneHot(valor, indice, tamanho, peso) {
  const vetor = Array(tamanho).fill(0);
  const posicao = indice[valor];
  if (posicao !== undefined) vetor[posicao] = peso;
  return vetor;
}

function encodeProduct(produto, contexto) {
  const precoNormalizado = normalizar(produto.preco, contexto.minPrice, contexto.maxPrice) * PESOS_FEATURES.preco;
  const idadeMediaNormalizada = normalizar(
    contexto.mediaIdadeCompradoresPorProduto[produto.id],
    contexto.minAge,
    contexto.maxAge
  ) * PESOS_FEATURES.idadeMedia;

  return [
    precoNormalizado,
    idadeMediaNormalizada,
    ...encodeOneHot(produto.categoria, contexto.categoriaIndex, contexto.categorias.length, PESOS_FEATURES.categoria),
    ...encodeOneHot(produto.cor, contexto.corIndex, contexto.cores.length, PESOS_FEATURES.cor),
  ];
}

function calcularMediaVetores(vetores) {
  if (!vetores.length) return [];
  return vetores[0].map((_, indice) => calcularMedia(vetores.map((vetor) => vetor[indice])));
}

function encodeUser(usuario, contexto, produtosPorId) {
  if (usuario.compras.length) {
    const produtosComprados = usuario.compras.map((produtoId) => produtosPorId[produtoId]).filter(Boolean);
    return calcularMediaVetores(produtosComprados.map((produto) => encodeProduct(produto, contexto)));
  }

  const tamanhoVetor = 2 + contexto.categorias.length + contexto.cores.length;
  const vetor = Array(tamanhoVetor).fill(0);
  vetor[1] = normalizar(usuario.idade, contexto.minAge, contexto.maxAge) * PESOS_FEATURES.idadeMedia;
  return vetor;
}

function criarParesTreino(produtos, usuarios, contexto, produtosPorId) {
  return usuarios.flatMap((usuario) => {
    const userVector = encodeUser(usuario, contexto, produtosPorId);
    return produtos.map((produto) => {
      const productVector = encodeProduct(produto, contexto);
      const comprouProduto = usuario.compras.includes(produto.id);
      return {
        features: [...userVector, ...productVector],
        label: comprouProduto ? 1 : 0,
      };
    });
  });
}

async function treinarModelo() {
  const contexto = criarContexto(produtosMock, usuariosMock);
  const produtosPorId = Object.fromEntries(produtosMock.map((produto) => [produto.id, produto]));
  const paresTreino = criarParesTreino(produtosMock, usuariosMock, contexto, produtosPorId);

  const xs = tf.tensor2d(paresTreino.map((par) => par.features));
  const ys = tf.tensor2d(paresTreino.map((par) => [par.label]));

  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [xs.shape[1]], units: 128, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });

  const history = await model.fit(xs, ys, {
    epochs: 100,
    batchSize: 32,
    shuffle: true,
    verbose: 0,
  });

  xs.dispose();
  ys.dispose();

  const lossFinal = history.history.loss.at(-1);
  const accuracyHistory = history.history.acc || history.history.accuracy || [];
  const accuracyFinal = accuracyHistory.at(-1);

  return { model, contexto, produtosPorId, loss: lossFinal, accuracy: accuracyFinal };
}

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
    let model;

    async function executarRecomendacao() {
      try {
        await tf.ready();
        const resultadoTreino = await treinarModelo();
        model = resultadoTreino.model;
        const userVector = encodeUser(usuarioTeste, resultadoTreino.contexto, resultadoTreino.produtosPorId);

        const recomendacoes = await Promise.all(
          produtosMock.map(async (produto) => {
            const productVector = encodeProduct(produto, resultadoTreino.contexto);
            const entrada = tf.tensor2d([[...userVector, ...productVector]]);
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
        setAccuracy(resultadoTreino.accuracy);
        setContextoTreino(resultadoTreino.contexto);
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
                <li>Nome: {usuarioTeste.nome}</li>
                <li>Idade: {usuarioTeste.idade} anos</li>
                <li>Histórico de compras: nenhum</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Pré-processamento</Card.Title>
              <p>
                O modelo aprende por pares usuário-produto: label <code>1</code> quando o usuário mockado comprou
                o produto e <code>0</code> quando não comprou. Idade e preço são normalizados por min-max,
                categoria e cor usam one-hot encoding ponderado, e o vetor do usuário é a média dos produtos comprados.
              </p>
              <p className="mb-1"><strong>Categorias:</strong> {featureInfo.categorias.join(', ')}</p>
              <p className="mb-0"><strong>Cores:</strong> {featureInfo.cores.join(', ')}</p>
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
