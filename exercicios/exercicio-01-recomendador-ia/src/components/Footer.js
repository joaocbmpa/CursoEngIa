// src/components/Footer.js
import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="ia-footer py-4">
      <Container className="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center">
        <div>
          <strong>IA Chess Store</strong>
          <p className="mb-0">Loja fictícia acadêmica para o Módulo 01 de IA aplicada.</p>
        </div>
        <div className="d-flex gap-3 flex-wrap">
          <Link to="/" className="text-decoration-none">Início</Link>
          <Link to="/recomendador-ia" className="text-decoration-none">Recomendador IA</Link>
          <Link to="/sobre" className="text-decoration-none">Sobre</Link>
        </div>
      </Container>
    </footer>
  );
}
