import * as tf from '@tensorflow/tfjs';
import { produtosMock } from '../data/produtosMock';
import { usuariosMock } from '../data/usuariosMock';

export const usuarioTesteRecomendacao = {
  id: 'user-teste-sem-compras',
  nome: 'Visitante acadêmico',
  idade: 13,
  purchases: [],
  compras: [],
};

const PESOS_FEATURES = {
  preco: 1.2,
  idadeMedia: 1,
  categoria: 1.5,
  cor: 1,
};

function normalizar(valor, minimo, maximo) {
  if (maximo === minimo) return 0;
  return (valor - minimo) / (maximo - minimo);
}

function calcularMedia(valores, fallback = 0) {
  if (!valores.length) return fallback;
  return valores.reduce((soma, valor) => soma + valor, 0) / valores.length;
}

function criarIndice(valores) {
  return valores.reduce((indice, valor, posicao) => ({ ...indice, [valor]: posicao }), {});
}

function getComprasUsuario(usuario) {
  return usuario.compras || usuario.purchases || [];
}

export function criarContexto(produtos = produtosMock, usuarios = usuariosMock) {
  const precos = produtos.map((produto) => produto.preco);
  const idadesUsuarios = usuarios.map((usuario) => usuario.idade);
  const categorias = [...new Set(produtos.map((produto) => produto.categoria))];
  const cores = [...new Set(produtos.map((produto) => produto.cor))];
  const compradoresPorProduto = produtos.reduce((acumulador, produto) => {
    const compradores = usuarios.filter((usuario) => getComprasUsuario(usuario).includes(produto.id));
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

export function encodeProduct(produto, contexto) {
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

export function encodeUser(usuario, contexto, produtosPorId) {
  const compras = getComprasUsuario(usuario);

  if (compras.length) {
    const produtosComprados = compras.map((produtoId) => produtosPorId[produtoId]).filter(Boolean);
    return calcularMediaVetores(produtosComprados.map((produto) => encodeProduct(produto, contexto)));
  }

  const tamanhoVetor = 2 + contexto.categorias.length + contexto.cores.length;
  const vetor = Array(tamanhoVetor).fill(0);
  vetor[1] = normalizar(usuario.idade, contexto.minAge, contexto.maxAge) * PESOS_FEATURES.idadeMedia;
  return vetor;
}

export function criarParesTreino(produtos, usuarios, contexto, produtosPorId) {
  return usuarios.flatMap((usuario) => {
    const userVector = encodeUser(usuario, contexto, produtosPorId);
    return produtos.map((produto) => {
      const productVector = encodeProduct(produto, contexto);
      const comprouProduto = getComprasUsuario(usuario).includes(produto.id);
      return {
        features: [...userVector, ...productVector],
        label: comprouProduto ? 1 : 0,
      };
    });
  });
}

export async function treinarModeloRecomendador(produtos = produtosMock, usuarios = usuariosMock) {
  await tf.ready();
  const contexto = criarContexto(produtos, usuarios);
  const produtosPorId = Object.fromEntries(produtos.map((produto) => [produto.id, produto]));
  const paresTreino = criarParesTreino(produtos, usuarios, contexto, produtosPorId);
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

  const loss = history.history.loss.at(-1);
  const accuracyHistory = history.history.acc || history.history.accuracy || [];
  const accuracy = accuracyHistory.at(-1);

  return { model, contexto, produtosPorId, loss, accuracy };
}

export async function gerarRankingRecomendacoes({
  usuario = usuarioTesteRecomendacao,
  produtos = produtosMock,
  usuarios = usuariosMock,
  limite,
} = {}) {
  const resultadoTreino = await treinarModeloRecomendador(produtos, usuarios);
  const userVector = encodeUser(usuario, resultadoTreino.contexto, resultadoTreino.produtosPorId);

  try {
    const ranking = await Promise.all(
      produtos.map(async (produto) => {
        const productVector = encodeProduct(produto, resultadoTreino.contexto);
        const entrada = tf.tensor2d([[...userVector, ...productVector]]);
        const predicao = resultadoTreino.model.predict(entrada);
        const [score] = await predicao.data();
        entrada.dispose();
        predicao.dispose();
        return { ...produto, score };
      })
    );

    const rankingOrdenado = ranking.sort((a, b) => b.score - a.score);
    return {
      ...resultadoTreino,
      ranking: limite ? rankingOrdenado.slice(0, limite) : rankingOrdenado,
      usuario,
    };
  } finally {
    resultadoTreino.model.dispose();
  }
}
