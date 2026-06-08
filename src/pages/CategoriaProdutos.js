// src/pages/CategoriaProdutos.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Breadcrumb } from 'react-bootstrap';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ProdutoCard from '../components/ProdutoCard';
import { CarrinhoContext } from '../context/CarrinhoContext';

export default function CategoriaProdutos() {
  const { categoria } = useParams();
  const { adicionarAoCarrinho } = useContext(CarrinhoContext);

  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarProdutos = async () => {
      setCarregando(true);
      try {
        const ref = collection(db, 'produtos');
        const q = query(ref, where('categoria', '==', categoria.toLowerCase()));
        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProdutos(lista);
      } catch (e) {
        console.error(e);
        setErro('Erro ao carregar produtos.');
      } finally {
        setCarregando(false);
      }
    };

    carregarProdutos();
  }, [categoria]);

  const categoriaFormatada = categoria.replace('-', ' ').toUpperCase();

  return (
    <Container className="my-5">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{categoriaFormatada}</Breadcrumb.Item>
      </Breadcrumb>

      <h2 className="mb-4 text-capitalize">{categoriaFormatada}</h2>

      {carregando && <Spinner animation="border" />}
      {erro && <Alert variant="danger">{erro}</Alert>}

      <Row>
        {produtos.map(produto => (
          <Col key={produto.id} sm={12} md={6} lg={4} className="mb-4">
            <ProdutoCard
              produto={produto}
              aoAdicionar={() => adicionarAoCarrinho(produto, null, 1)}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
