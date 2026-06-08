// src/components/ListaProdutos.js
import React, { useEffect, useState, useContext } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import ProdutoCard from './ProdutoCard';
import { CarrinhoContext } from '../context/CarrinhoContext';

export default function ListaProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const { adicionarAoCarrinho } = useContext(CarrinhoContext); // ✅ Aqui

  useEffect(() => {
    async function fetchProdutos() {
      try {
        const querySnapshot = await getDocs(
          query(collection(db, 'produtos'), where('destaque', '==', true))
        );
        const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProdutos(lista);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setErro("Erro ao carregar produtos.");
      } finally {
        setCarregando(false);
      }
    }

    fetchProdutos();
  }, []);

  return (
    <Container className="my-5">
      <h2 className="mb-4 text-center">Produtos em Destaque</h2>
      {carregando && <Spinner animation="border" />}
      {erro && <Alert variant="danger">{erro}</Alert>}
      <Row>
        {produtos.map(prod => (
          <Col key={prod.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <ProdutoCard produto={prod} aoAdicionar={adicionarAoCarrinho} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
