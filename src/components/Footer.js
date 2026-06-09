// src/components/Footer.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../logo.svg';


export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-5">
      <Container>
        <Row className="mb-4">
          {/* Coluna 1: Logo e descrição */}
          <Col md={4}>
            <img src={logo} alt="Logo acadêmico" width={50} className="mb-2" />
            <p className="mt-2">
              Loja Acadêmica IA é uma vitrine fictícia para exercícios de recomendação com IA.
            </p>
          </Col>

          {/* Coluna 2: Links úteis */}
          <Col md={4}>
            <h5>Institucional</h5>
            <ul className="list-unstyled">
              <li><Link to="/sobre" className="text-white text-decoration-none">Sobre Nós</Link></li>
              <li><Link to="/privacidade" className="text-white text-decoration-none">Política de Privacidade</Link></li>
              <li><Link to="/termos" className="text-white text-decoration-none">Termos de Uso</Link></li>
              <li><Link to="/contato" className="text-white text-decoration-none">Fale Conosco</Link></li>
              <li><Link to="/rastrear" className="text-white text-decoration-none">Rastrear Pedido</Link></li>
              <li>
                <button
                  className="btn btn-link text-white text-decoration-none p-0"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Voltar ao Topo
                </button>
              </li>
            </ul>
          </Col>

          {/* Coluna 3: Contato e redes sociais */}
          <Col md={4}>
            <h5>Contato</h5>
            <p className="mb-1">Contato fictício: contato@exemplo-academico.test</p>
            <p className="mb-2">Sem vendas, pagamentos ou atendimento reais.</p>
          </Col>
        </Row>

        <hr className="border-secondary" />
        <p className="text-center mb-0">© {new Date().getFullYear()} Loja Acadêmica IA. Projeto acadêmico com dados fictícios.</p>
      </Container>
    </footer>
  );
}
