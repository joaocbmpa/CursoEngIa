import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { produtosMock } from '../data/produtosMock';
import { usuariosMock } from '../data/usuariosMock';
import {
  criarContexto,
  criarUsuarioTeste,
  gerarRankingRecomendacoes,
  getComprasUsuario,
  usuarioTesteRecomendacao,
} from '../ia/recomendadorIA';
import '../styles/RecomendadorIA.css';

function criarEstadoUsuario(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    idade: usuario.idade,
    categoriaPreferida: usuario.categoriaPreferida || 'tabuleiro',
    corPreferida: usuario.corPreferida || 'azul',
    precoPreferido: usuario.precoPreferido || 120,
    purchases: getComprasUsuario(usuario),
  };
}

export default function RecomendadorIA() {
  const categorias = useMemo(() => [...new Set(produtosMock.map((produto) => produto.categoria))], []);
  const cores = useMemo(() => [...new Set(produtosMock.map((produto) => produto.cor))], []);
  const [usuarioSelecionadoId, setUsuarioSelecionadoId] = useState(usuarioTesteRecomendacao.id);
  const [usuarioForm, setUsuarioForm] = useState(() => criarEstadoUsuario(usuarioTesteRecomendacao));
  const [ranking, setRanking] = useState([]);
  const [rankingAnterior, setRankingAnterior] = useState([]);
  const [status, setStatus] = useState('Treinando modelo no navegador...');
  const [erro, setErro] = useState('');
  const [loss, setLoss] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rankingMudou, setRankingMudou] = useState(false);
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

  const comprasSelecionadas = usuarioForm.purchases || [];
  const usuarioAtivo = criarUsuarioTeste(usuarioForm);

  const recalcular = async () => {
    setLoading(true);
    setErro('');
    setStatus('Treinando modelo no navegador...');
    try {
      const resultado = await gerarRankingRecomendacoes({
        usuario: usuarioAtivo,
        comprasSimuladas: comprasSelecionadas,
      });
      const novoRanking = resultado.ranking || [];
      const mudou = ranking.length > 0 && ranking.map((item) => item.id).join('|') !== novoRanking.map((item) => item.id).join('|');

      setRankingAnterior(ranking);
      setRanking(novoRanking);
      setLoss(resultado.loss);
      setAccuracy(resultado.accuracy);
      setContextoTreino(resultado.contexto);
      setRankingMudou(mudou);
      setStatus('Ranking recalculado com usuário e compras simuladas.');
    } catch (error) {
      setErro('Não foi possível treinar o modelo localmente neste navegador.');
      setStatus('Falha ao treinar modelo.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    recalcular();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selecionarUsuario = (id) => {
    setUsuarioSelecionadoId(id);
    if (id === usuarioTesteRecomendacao.id) {
      setUsuarioForm(criarEstadoUsuario(usuarioTesteRecomendacao));
      return;
    }
    const usuarioMock = usuariosMock.find((usuario) => usuario.id === id);
    if (usuarioMock) setUsuarioForm(criarEstadoUsuario(usuarioMock));
  };

  const atualizarCampo = (campo, valor) => {
    setUsuarioForm((atual) => ({ ...atual, [campo]: valor }));
  };

  const alternarCompra = (produtoId) => {
    setUsuarioForm((atual) => {
      const comprasAtuais = atual.purchases || [];
      const existe = comprasAtuais.includes(produtoId);
      const purchases = existe
        ? comprasAtuais.filter((id) => id !== produtoId)
        : [...comprasAtuais, produtoId];
      return { ...atual, purchases, compras: purchases };
    });
  };

  return (
    <Container className="recomendador-ia py-5">
      <div className="recomendador-ia__hero mb-4">
        <Badge bg="info" text="dark" className="mb-3">Módulo 01 • IA aplicada</Badge>
        <h1>Recomendador IA da IA Chess Store</h1>
        <p>
          Selecione usuários, edite preferências e simule compras para observar o ranking da rede neural
          mudar em tempo real controlado pelo botão Recalcular.
        </p>
      </div>

      <Alert variant="warning">
        Altere idade, categoria, cor ou compras para observar como a rede neural muda o ranking.
        Todos os dados são fictícios e não há Firebase, pagamento ou credenciais reais.
      </Alert>

      <Row className="g-4 mb-4">
        <Col lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Controles interativos</Card.Title>
              <Form className="d-grid gap-3">
                <Form.Group>
                  <Form.Label>Usuário</Form.Label>
                  <Form.Select value={usuarioSelecionadoId} onChange={(event) => selecionarUsuario(event.target.value)}>
                    <option value={usuarioTesteRecomendacao.id}>Criar usuário teste sem compras</option>
                    {usuariosMock.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>{usuario.nome}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Idade</Form.Label>
                  <Form.Control
                    type="number"
                    min="6"
                    max="80"
                    value={usuarioForm.idade}
                    onChange={(event) => atualizarCampo('idade', Number(event.target.value))}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Preço preferido</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="10"
                    value={usuarioForm.precoPreferido}
                    onChange={(event) => atualizarCampo('precoPreferido', Number(event.target.value))}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Categoria preferida</Form.Label>
                  <Form.Select value={usuarioForm.categoriaPreferida} onChange={(event) => atualizarCampo('categoriaPreferida', event.target.value)}>
                    {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Cor preferida</Form.Label>
                  <Form.Select value={usuarioForm.corPreferida} onChange={(event) => atualizarCampo('corPreferida', event.target.value)}>
                    {cores.map((cor) => <option key={cor} value={cor}>{cor}</option>)}
                  </Form.Select>
                </Form.Group>
                <Button onClick={recalcular} disabled={loading} variant="primary">
                  {loading ? 'Recalculando...' : 'Recalcular ranking'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Compras usadas como histórico</Card.Title>
              <p className="text-muted">
                Marque ou desmarque produtos para simular o histórico de compras do usuário ativo.
              </p>
              <Row className="g-2">
                {produtosMock.map((produto) => (
                  <Col md={6} key={produto.id}>
                    <Form.Check
                      type="checkbox"
                      checked={comprasSelecionadas.includes(produto.id)}
                      onChange={() => alternarCompra(produto.id)}
                      label={`${produto.nome} (${produto.categoria}, ${produto.cor})`}
                    />
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Usuário selecionado</Card.Title>
              <ul className="mb-0">
                <li>Nome: {usuarioForm.nome}</li>
                <li>Idade: {usuarioForm.idade} anos</li>
                <li>Categoria: {usuarioForm.categoriaPreferida}</li>
                <li>Cor: {usuarioForm.corPreferida}</li>
                <li>Compras: {comprasSelecionadas.length}</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Features consideradas</Card.Title>
              <p>
                O treino combina vetores de usuário e produto. O label é <code>1</code> quando um
                usuário mockado comprou o produto e <code>0</code> quando não comprou.
              </p>
              <p className="mb-1"><strong>Categorias:</strong> {featureInfo.categorias.join(', ')}</p>
              <p className="mb-0"><strong>Cores:</strong> {featureInfo.cores.join(', ')}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {rankingMudou && <Alert variant="success">O ranking foi atualizado após a simulação.</Alert>}
      {rankingAnterior.length > 0 && (
        <Alert variant="light">
          <strong>Ranking anterior:</strong> {rankingAnterior.slice(0, 5).map((produto) => produto.nome).join(' → ')}
        </Alert>
      )}

      <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
        {(ranking.length === 0 || loading) && !erro && <Spinner animation="border" size="sm" />}
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
            <Card className={`h-100 recomendador-ia__card shadow-sm ${rankingMudou ? 'ranking-updated' : ''}`}>
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
