// src/components/Hero.js
import React, { useEffect, useState } from 'react';
import { Carousel, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import '../styles/Hero.css';

export default function Hero() {
  const [produtos, setProdutos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarProdutosDestaque = async () => {
      try {
        const ref = collection(db, 'produtos');
        const q = query(ref, where('destaque', '==', true), limit(5));
        const snap = await getDocs(q);
        const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProdutos(lista);
      } catch (error) {
        console.error('Erro ao buscar produtos em destaque:', error);
      }
    };
    carregarProdutosDestaque();
  }, []);

  return (
    <Container fluid className="p-0">
      <Carousel fade interval={6000}>
        {produtos.map(prod => (
          <Carousel.Item key={prod.id}>
            <div className="hero-slide">
              <img
                src={prod.imagens?.[0] || '/placeholder.jpg'}
                alt={prod.nome}
                className="hero-imagem-centro"
              />
              <div className="hero-overlay animate__animated animate__fadeInUp">
                <h2>{prod.nome}</h2>
                <p dangerouslySetInnerHTML={{ __html: prod.descricao?.slice(0, 150) + '...' }} />
                
                {/* Selo de Frete Grátis */}
                {!prod.digital && (
                  <div className="badge bg-success text-white px-3 py-2 rounded-pill mb-2 d-inline-block animate__animated animate__fadeInDown">
                    📦 Frete Grátis para todo o Brasil
                  </div>
                )}

                <Button
                  variant="light"
                  onClick={() => navigate(`/produto/${prod.id}`)}
                >
                  Ver Produto
                </Button>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </Container>
  );
}
