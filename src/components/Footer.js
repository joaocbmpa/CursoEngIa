// src/components/Footer.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../assets/logo-xadrezjl.png';
import { FaFacebook, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-5">
      <Container>
        <Row className="mb-4">
          {/* Coluna 1: Logo e descrição */}
          <Col md={4}>
            <img src={logo} alt="Logo Xadrez JL" width={50} className="mb-2" />
            <p className="mt-2">
              Xadrez JL é sua loja especializada em produtos de xadrez!
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
            <p className="mb-1">WhatsApp: (91) 98326-1572</p>
            <p className="mb-2">E-mail: joaoluizcbmpa@gmail.com</p>
            <div className="d-flex gap-3">
              <a href="https://instagram.com/joaoluizcbmpa" target="_blank" rel="noopener noreferrer" className="text-white fs-4">
                <FaInstagram />
              </a>
              <a href="https://www.facebook.com/profile.php?id=100012181931880" target="_blank" rel="noopener noreferrer" className="text-white fs-4">
                <FaFacebook />
              </a>
            </div>
          </Col>
        </Row>

        <hr className="border-secondary" />
        <p className="text-center mb-0">© {new Date().getFullYear()} Xadrez JL. Todos os direitos reservados.</p>
      </Container>
    </footer>
  );
}
