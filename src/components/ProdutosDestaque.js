import React, { useEffect, useState, useContext } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Row, Col, Spinner, Alert } from 'react-bootstrap';
import ProdutoCard from './ProdutoCard';
import { CarrinhoContext } from '../context/CarrinhoContext';

export default function ProdutosDestaque() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const { adicionarAoCarrinho } = useContext(CarrinhoContext);

  useEffect(() => {
    const buscarDestaques = async () => {
      setCarregando(true);
      try {
        const ref = collection(db, 'produtos');
        const q = query(ref, where('destaque', '==', true));
        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProdutos(lista);
      } catch (e) {
        console.error(e);
        setErro('Erro ao carregar produtos em destaque.');
      } finally {
        setCarregando(false);
      }
    };

    buscarDestaques();
  }, []);

  if (carregando) return <Spinner animation="border" />;
  if (erro) return <Alert variant="danger">{erro}</Alert>;
  if (produtos.length === 0) return <Alert variant="info">Nenhum produto em destaque no momento.</Alert>;

  return (
    <div className="my-5">
      <h3 className="mb-4">🛍️ Produtos em Destaque</h3>
      <Row>
        {produtos.map(prod => (
          <Col key={prod.id} sm={12} md={6} lg={4} className="mb-4">
            <ProdutoCard produto={prod} aoAdicionar={adicionarAoCarrinho} />
          </Col>
        ))}
      </Row>
    </div>
  );
}
