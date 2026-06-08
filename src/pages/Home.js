import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../styles/Home.css';
import Hero from '../components/Hero';
import ProdutosDestaque from '../components/ProdutosDestaque';
import Beneficios from '../components/Beneficios'; // ✅ Importado

export default function Home() {
  return (
    <div>
      {/* Carrossel de Produtos em Destaque no Hero */}
      <Hero />

      {/* Produtos em Destaque */}
      <Container className="py-5 animated-section fade-in-up">
        <h2 className="mb-4 text-center">🔒 Produtos em Destaque</h2>
        <ProdutosDestaque />
      </Container>

      {/* Depoimentos */}
      <Container className="py-5 animated-section fade-in-up">
        <h2 className="mb-4 text-center">🧑‍💬 O que dizem nossos clientes</h2>
        <Row>
          {[
            { nome: "Carlos M.", texto: "Adorei os produtos, entrega rápida e ótimo atendimento!" },
            { nome: "Juliana P.", texto: "Comprei um tabuleiro para meu filho e a qualidade é excelente." },
            { nome: "Rafael S.", texto: "Site fácil de navegar e ótimos preços. Recomendo demais." },
          ].map((depoimento, idx) => (
            <Col md={4} key={idx} className="mb-3">
              <div className="depoimento p-3 border rounded shadow-sm fade-in-up">
                <p>"{depoimento.texto}"</p>
                <strong>- {depoimento.nome}</strong>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Benefícios com carrossel de cards */}
      <Beneficios /> {/* ✅ Substituído por componente carrossel */}
    </div>
  );
}
