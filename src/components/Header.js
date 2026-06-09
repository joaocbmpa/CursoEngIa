// src/components/Header.js
import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

export default function Header() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar expand="lg" className="ia-navbar" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="ia-navbar__brand">
          <span className="ia-navbar__logo">♟</span>
          IA Chess Store
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="ia-navbar-nav" />
        <Navbar.Collapse id="ia-navbar-nav">
          <Nav className="ms-auto align-items-lg-center gap-lg-2">
            <Nav.Link as={Link} to="/" active={isActive('/')}>Início</Nav.Link>
            <Nav.Link as={Link} to="/recomendador-ia" active={isActive('/recomendador-ia')}>
              Recomendador IA
            </Nav.Link>
            <Nav.Link as={Link} to="/sobre" active={isActive('/sobre')}>Sobre o Exercício</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
