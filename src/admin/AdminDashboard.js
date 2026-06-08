import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Routes, Route, Link } from 'react-router-dom';
import '../styles/AdminDashboard.css'; // ✅ Importando o CSS

// Produtos
import ListaProdutosAdmin from './Produtos/ListaProdutosAdmin';
import FormularioProduto from './Produtos/FormularioProduto';

// Categorias
import ListaCategoriasAdmin from './Categorias/ListaCategoriasAdmin';
import CadastroCategoria from './Categorias/CadastroCategoria';

// Pedidos
import ListaPedidosAdmin from './Pedidos/ListaPedidosAdmin';

// Cupons
import ListaCuponsAdmin from './Cupons/ListaCuponsAdmin';

// Relatórios
import ListaRelatoriosAdmin from './Relatorios/ListaRelatoriosAdmin';

// Usuários
import ListaUsuariosAdmin from './Usuarios/ListaUsuariosAdmin';
import CadastroUsuario from './Usuarios/CadastroUsuario';

export default function AdminDashboard() {
  return (
    <Container fluid className="my-4">
      <Row>
        {/* Menu lateral com estilo escuro e moderno */}
        <Col md={2} className="admin-sidebar border-end">
          <h5>Painel Admin</h5>
          <Nav className="flex-column">
            <Nav.Link as={Link} to="produtos">Produtos</Nav.Link>
            <Nav.Link as={Link} to="categorias">Categorias</Nav.Link>
            <Nav.Link as={Link} to="pedidos">Pedidos</Nav.Link>
            <Nav.Link as={Link} to="cupons">Cupons</Nav.Link>
            <Nav.Link as={Link} to="relatorios">Relatórios</Nav.Link>
            <Nav.Link as={Link} to="usuarios">Usuários</Nav.Link>
          </Nav>
        </Col>

        {/* Área de conteúdo das rotas */}
        <Col md={10} className="p-3">
          <Routes>
            {/* Produtos */}
            <Route path="produtos" element={<ListaProdutosAdmin />} />
            <Route path="produtos/novo" element={<FormularioProduto />} />
            <Route path="produtos/editar/:id" element={<FormularioProduto />} />

            {/* Categorias */}
            <Route path="categorias" element={<ListaCategoriasAdmin />} />
            <Route path="categorias/nova" element={<CadastroCategoria />} />
            <Route path="categorias/editar/:id" element={<CadastroCategoria />} />

            {/* Pedidos */}
            <Route path="pedidos" element={<ListaPedidosAdmin />} />

            {/* Cupons */}
            <Route path="cupons" element={<ListaCuponsAdmin />} />

            {/* Relatórios */}
            <Route path="relatorios" element={<ListaRelatoriosAdmin />} />

            {/* Usuários */}
            <Route path="usuarios" element={<ListaUsuariosAdmin />} />
            <Route path="usuarios/novo" element={<CadastroUsuario />} />
            <Route path="usuarios/editar/:id" element={<CadastroUsuario />} />

            {/* Página padrão */}
            <Route path="*" element={<h4>Escolha uma opção no menu</h4>} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
}
