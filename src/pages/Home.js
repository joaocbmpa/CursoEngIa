import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { produtosMock } from '../data/produtosMock';
import { usuariosMock } from '../data/usuariosMock';
import {
  criarUsuarioTeste,
  gerarRankingRecomendacoes,
  getComprasUsuario,
  usuarioTesteRecomendacao,
} from '../services/recomendadorIAService';
import '../styles/Home.css';

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

export default function Home() {
  const categorias = useMemo(() => [...new Set(produtosMock.map((produto) => produto.categoria))], []);
  const cores = useMemo(() => [...new Set(produtosMock.map((produto) => produto.cor))], []);
  const [usuarioSelecionadoId, setUsuarioSelecionadoId] = useState(usuarioTesteRecomendacao.id);
  const [usuarioForm, setUsuarioForm] = useState(() => criarEstadoUsuario(usuarioTesteRecomendacao));
  const [recomendados, setRecomendados] = useState([]);
  const [rankingAnterior, setRankingAnterior] = useState([]);
  const [status, setStatus] = useState('Treinando rede neural no navegador...');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [rankingMudou, setRankingMudou] = useState(false);

  const recalcular = async () => {
    setLoading(true);
    setErro('');
    setStatus('Treinando rede neural no navegador...');
    try {
      const usuarioAtivo = criarUsuarioTeste(usuarioForm);
      const resultado = await gerarRankingRecomendacoes({ usuario: usuarioAtivo, limite: 3 });
      const novoRanking = resultado?.ranking || [];
      const mudou = recomendados.length > 0 && recomendados.map((item) => item.id).join('|') !== novoRanking.map((item) => item.id).join('|');
      setRankingAnterior(recomendados);
      setRecomendados(novoRanking);
      setRankingMudou(mudou);
      setStatus('Top 3 recalculado com histórico e preferências simuladas.');
    } catch (error) {
      setErro('Não foi possível treinar a rede neural neste navegador.');
      setStatus('Falha ao gerar recomendações.');
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
                  <Card.Title>Simulador de usuário</Card.Title>
                  <p>
                    Altere idade, categoria, cor ou preço para observar como a rede neural muda o ranking.
                  </p>
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
                    <Row className="g-3">
                      <Col sm={6}>
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
                      </Col>
                      <Col sm={6}>
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
                      </Col>
                    </Row>
                    <Row className="g-3">
                      <Col sm={6}>
                        <Form.Group>
                          <Form.Label>Categoria</Form.Label>
                          <Form.Select value={usuarioForm.categoriaPreferida} onChange={(event) => atualizarCampo('categoriaPreferida', event.target.value)}>
                            {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col sm={6}>
                        <Form.Group>
                          <Form.Label>Cor</Form.Label>
                          <Form.Select value={usuarioForm.corPreferida} onChange={(event) => atualizarCampo('corPreferida', event.target.value)}>
                            {cores.map((cor) => <option key={cor} value={cor}>{cor}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button onClick={recalcular} disabled={loading} variant="primary">
                      {loading ? 'Recalculando...' : 'Recalcular recomendações'}
                    </Button>
                    <div className="d-flex align-items-center gap-2 text-info-emphasis">
                      {loading && <Spinner animation="border" size="sm" />}
                      <span>{status}</span>
                    </div>
                  </Form>
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

        {rankingMudou && <Alert variant="success">O ranking mudou após a simulação do usuário.</Alert>}
        {rankingAnterior.length > 0 && (
          <Alert variant="light">
            <strong>Ranking anterior:</strong> {rankingAnterior.map((produto) => produto.nome).join(' → ')}
          </Alert>
        )}
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
              <Card className={`h-100 ia-product-card shadow-sm ${rankingMudou ? 'ranking-updated' : ''}`}>
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
