import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import {
  Container, Row, Col, Image, Button, Spinner, Alert, Breadcrumb, Carousel, Modal
} from 'react-bootstrap';
import { CarrinhoContext } from '../context/CarrinhoContext';
import '../styles/ProdutoDetalhe.css';

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const { usuario } = useContext(AuthContext);
  const { adicionarAoCarrinho } = useContext(CarrinhoContext);
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [jaComprado, setJaComprado] = useState(false);
  const [imagemModal, setImagemModal] = useState(null);

  useEffect(() => {
    const carregarProduto = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const docRef = doc(db, 'produtos', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const dadosProduto = { id: snap.id, ...snap.data() };
          setProduto(dadosProduto);

          if (usuario && dadosProduto.digital) {
            const pedidosRef = collection(db, 'pedidos');
            const q = query(
              pedidosRef,
              where('uid', '==', usuario.uid),
              where('status', 'in', ['approved', 'enviado', 'concluido'])
            );
            const snapshot = await getDocs(q);
            const comprou = snapshot.docs.some(ped => {
              const itens = ped.data().itens || [];
              return itens.some(item => item.produtoId === id);
            });
            setJaComprado(comprou);
          }
        } else {
          setErro('Produto não encontrado.');
        }
      } catch (e) {
        console.error(e);
        setErro('Erro ao carregar o produto.');
      } finally {
        setCarregando(false);
      }
    };

    carregarProduto();
  }, [id, usuario]);

  if (carregando) return <Spinner animation="border" />;
  if (erro) return <Alert variant="danger">{erro}</Alert>;
  if (!produto) return null;

  return (
    <Container className="my-5">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href={`/categoria/${produto.categoria}`}>
          {produto.categoria?.charAt(0).toUpperCase() + produto.categoria?.slice(1)}
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{produto.nome}</Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        <Col md={6} className="text-center mb-4">
          {produto.imagens?.length > 1 ? (
            <Carousel interval={null} fade>
              {produto.imagens.map((url, idx) => (
                <Carousel.Item key={idx}>
                  <Image
                    src={url}
                    fluid
                    rounded
                    onClick={() => setImagemModal(url)}
                    style={{ cursor: 'zoom-in' }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <Image
              src={produto.imagens?.[0] || '/placeholder.jpg'}
              fluid
              rounded
              onClick={() => setImagemModal(produto.imagens?.[0])}
              style={{ cursor: 'zoom-in' }}
            />
          )}
        </Col>

        <Col md={6}>
          <h2>{produto.nome}</h2>
          <p dangerouslySetInnerHTML={{ __html: produto.descricao }} />
          <h4 className="text-success">R$ {produto.preco?.toFixed(2)}</h4>

          {!produto.digital && (
            <div className="alert alert-success py-2 px-3 my-3 small">
              🚚 Frete Grátis para todo o Brasil.
            </div>
          )}

          {produto.digital && jaComprado ? (
            <Button
              variant="success"
              href={produto.arquivoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              📥 Baixar eBook
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => adicionarAoCarrinho(produto)}
              disabled={produto.digital && !usuario}
            >
              Adicionar ao Carrinho
            </Button>
          )}
        </Col>
      </Row>

      <Modal show={!!imagemModal} onHide={() => setImagemModal(null)} centered size="lg">
        <Modal.Body className="text-center p-0">
          <Image src={imagemModal} fluid />
        </Modal.Body>
      </Modal>
    </Container>
  );
}
