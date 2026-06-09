// src/components/Header.js
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Navbar, Nav, Container, Badge, NavDropdown, Modal, Form, Button
} from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import logo from '../logo.svg';
import { CarrinhoContext } from '../context/CarrinhoContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

export default function Header({ onAbrirCarrinho }) {
  const { carrinho } = useContext(CarrinhoContext);
  const {
    usuario,
    login,
    logout,
    loginEmailSenha,
    cadastrarEmailSenha
  } = useAuth();

  const location = useLocation();
  const navRef = useRef(null);

  const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);

  const [showModal, setShowModal] = useState(false);
  const [modoCadastro, setModoCadastro] = useState(false);
  const [formData, setFormData] = useState({ nome: "", email: "", senha: "" });

  // estados para controlar os dropdowns manualmente
  const [openUserDd, setOpenUserDd] = useState(false);
  const [openAuthDd, setOpenAuthDd] = useState(false);

  // controla o navbar (menu mobile) expandido/recolhido
  const [expanded, setExpanded] = useState(false);

  const userDdRef = useRef(null);
  const authDdRef = useRef(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      await loginEmailSenha(formData.email, formData.senha);
      setShowModal(false);
      closeAllMenus();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCadastro = async () => {
    try {
      await cadastrarEmailSenha(formData.nome, formData.email, formData.senha);
      setShowModal(false);
      closeAllMenus();
    } catch (error) {
      alert(error.message);
    }
  };

  const closeAllMenus = () => {
    setOpenUserDd(false);
    setOpenAuthDd(false);
    setExpanded(false);
  };

  // fechar dropdowns/menus ao clicar fora / ESC
  useEffect(() => {
    function onDocClick(e) {
      const clickInsideHeader = navRef.current && navRef.current.contains(e.target);
      // fecha dropdowns se clicar fora do respectivo
      const clickUser = userDdRef.current && userDdRef.current.contains(e.target);
      const clickAuth = authDdRef.current && authDdRef.current.contains(e.target);
      if (!clickUser) setOpenUserDd(false);
      if (!clickAuth) setOpenAuthDd(false);
      // fecha o navbar (menu mobile) se clicar fora do header
      if (!clickInsideHeader) setExpanded(false);
    }
    function onEsc(e) {
      if (e.key === 'Escape') {
        setOpenUserDd(false);
        setOpenAuthDd(false);
        setExpanded(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  // fechar tudo ao trocar de rota
  useEffect(() => {
    setOpenUserDd(false);
    setOpenAuthDd(false);
    setExpanded(false);
  }, [location.pathname]);

  const isAdmin = usuario?.role === 'admin';
  const isInfluencer = usuario && (usuario.role === 'influencer' || isAdmin);

  return (
    <>
      <Navbar
        ref={navRef}
        bg="dark"
        variant="dark"
        expand="lg"
        sticky="top"
        expanded={expanded}
      >
        <Container>
          <Navbar.Brand as={Link} to="/" onClick={() => { closeAllMenus(); }}>
            <img
              src={logo}
              width="40"
              height="40"
              className="d-inline-block align-top me-2"
              alt="Logo acadêmico"
            />
            Loja Acadêmica IA
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="navbar-menu"
            onClick={() => setExpanded((prev) => !prev)}
          />

          <Navbar.Collapse id="navbar-menu">
            <Nav className="ms-auto align-items-center">
              <Nav.Link as={Link} to="/categoria/livros-ebooks" onClick={closeAllMenus}>Livros/Ebooks</Nav.Link>
              <Nav.Link as={Link} to="/categoria/tabuleiros" onClick={closeAllMenus}>Tabuleiros</Nav.Link>
              <Nav.Link as={Link} to="/categoria/pecas" onClick={closeAllMenus}>Peças</Nav.Link>
              <Nav.Link as={Link} to="/categoria/kits" onClick={closeAllMenus}>Kits</Nav.Link>
              <Nav.Link as={Link} to="/categoria/acessorios" onClick={closeAllMenus}>Acessórios</Nav.Link>
              <Nav.Link as={Link} to="/recomendador-ia" onClick={closeAllMenus}>Recomendador IA</Nav.Link>

              {/* Submenu Institucional (usa comportamento padrão do react-bootstrap) */}
              <NavDropdown title="Institucional" id="institucional-dropdown" onToggle={() => {}}>
                <NavDropdown.Item as={Link} to="/sobre" onClick={closeAllMenus}>Sobre Nós</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/privacidade" onClick={closeAllMenus}>Política de Privacidade</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/termos" onClick={closeAllMenus}>Termos de Uso</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/contato" onClick={closeAllMenus}>Fale Conosco</NavDropdown.Item>
              </NavDropdown>

              <Nav.Link onClick={() => { closeAllMenus(); onAbrirCarrinho?.(); }}>
                🛒 Carrinho {totalItens > 0 && <Badge bg="light" text="dark">{totalItens}</Badge>}
              </Nav.Link>

              {/* Dropdown do usuário / autenticação (controlado manualmente p/ fechar fora) */}
              {usuario ? (
                <div ref={userDdRef} className="position-relative">
                  <NavDropdown
                    align="end"
                    show={openUserDd}
                    onToggle={(next) => setOpenUserDd(next)}
                    title={usuario.displayName || usuario.email}
                    id="user-dropdown"
                  >
                    <NavDropdown.Item as={Link} to="/meus-pedidos" onClick={closeAllMenus}>
                      Meus Pedidos
                    </NavDropdown.Item>

                    {/* Painel Influencer (influencer e admin) */}
                    {isInfluencer && (
                      <NavDropdown.Item as={Link} to="/influencer" onClick={closeAllMenus}>
                        Painel Influencer
                      </NavDropdown.Item>
                    )}

                    {/* Painel Admin (somente admin) */}
                    {isAdmin && (
                      <NavDropdown.Item as={Link} to="/admin" onClick={closeAllMenus}>
                        Painel Admin
                      </NavDropdown.Item>
                    )}

                    <NavDropdown.Item as={Link} to="/minhas-compras" onClick={closeAllMenus}>
                      Minhas Compras
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/meus-ebooks" onClick={closeAllMenus}>
                      Meus eBooks
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item
                      onClick={() => {
                        closeAllMenus();
                        logout();
                      }}
                    >
                      Sair
                    </NavDropdown.Item>
                  </NavDropdown>
                </div>
              ) : (
                <div ref={authDdRef} className="position-relative">
                  <NavDropdown
                    align="end"
                    show={openAuthDd}
                    onToggle={(next) => setOpenAuthDd(next)}
                    title="Entrar"
                    id="auth-dropdown"
                  >
                    <NavDropdown.Item
                      onClick={async () => {
                        closeAllMenus();
                        await login();
                      }}
                    >
                      Entrar com Google
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      onClick={() => {
                        setModoCadastro(false);
                        setShowModal(true);
                        setOpenAuthDd(false);
                        setExpanded(false);
                      }}
                    >
                      Entrar com E-mail/Senha
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      onClick={() => {
                        setModoCadastro(true);
                        setShowModal(true);
                        setOpenAuthDd(false);
                        setExpanded(false);
                      }}
                    >
                      Criar Conta
                    </NavDropdown.Item>
                  </NavDropdown>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Modal Login/Cadastro */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modoCadastro ? "Criar Conta" : "Login com E-mail e Senha"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {modoCadastro && (
              <Form.Group className="mb-3">
                <Form.Label>Nome completo</Form.Label>
                <Form.Control
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Digite seu nome"
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Digite seu e-mail"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleInputChange}
                placeholder="Digite sua senha"
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={modoCadastro ? handleCadastro : handleLogin}
            >
              {modoCadastro ? "Criar Conta" : "Entrar"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
