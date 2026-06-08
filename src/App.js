// src/App.js
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from 'react-router-dom';

import Header from './components/Header';
import ListaProdutos from './components/ListaProdutos';
import ModalCarrinho from './components/ModalCarrinho';
import { CarrinhoProvider } from './context/CarrinhoContext';

import CategoriaProdutos from './pages/CategoriaProdutos';
import Home from './pages/Home';
import Footer from './components/Footer';
import ProdutoDetalhe from './pages/ProdutoDetalhe';
import Sobre from './pages/Sobre';
import Privacidade from './pages/privacidade';
import TermosUso from './pages/TermosUso';
import FaleConosco from './pages/FaleConosco';
import Obrigado from './pages/Obrigado';
import MeusPedidos from './pages/MeusPedidos';
import Checkout from './pages/Checkout';
import MeusEbooks from './pages/MeusEbooks';
import MinhasCompras from './pages/MinhasCompras';
import RecomendadorIA from './pages/RecomendadorIA';

// 🔐 Admin
import AdminDashboard from './admin/AdminDashboard';
import ProtectedAdminRoute from './admin/ProtectedAdminRoute';

// 🔐 Auth
import { AuthProvider, useAuth } from './context/AuthContext';

// 🔐 Influencer (layout + páginas)
import InfluencerLayout from './pages/influencer/InfluencerLayout';
import InfluencerDashboard from './pages/influencer/Dashboard';
import InfluencerPedidos from './pages/influencer/Pedidos';
import InfluencerPerfil from './pages/influencer/Perfil';

// -----------------------------
// Guard do Influencer (apenas protege a rota)
// -----------------------------
function ProtectedInfluencerRoute({ children }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/" replace />;
  if (usuario.role !== 'influencer' && usuario.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}

// -----------------------------
// Shell interno para permitir useNavigate/useLocation
// -----------------------------
function AppShell() {
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll para o topo ao mudar de rota
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Navega para o checkout ao clicar em "Finalizar Pedido" no modal
  const irParaCheckout = () => {
    setMostrarCarrinho(false);
    navigate('/checkout');
  };

  return (
    <>
      <Header onAbrirCarrinho={() => setMostrarCarrinho(true)} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produtos" element={<ListaProdutos />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/categoria/:categoria" element={<CategoriaProdutos />} />
        <Route path="/meus-pedidos" element={<MeusPedidos />} />
        <Route path="/produto/:id" element={<ProdutoDetalhe />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/termos" element={<TermosUso />} />
        <Route path="/contato" element={<FaleConosco />} />
        <Route path="/obrigado" element={<Obrigado />} />
        <Route path="/meus-ebooks" element={<MeusEbooks />} />
        <Route path="/minhas-compras" element={<MinhasCompras />} />
        <Route path="/recomendador-ia" element={<RecomendadorIA />} />

        {/* 🔐 Rota protegida Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        {/* 🔐 Rota protegida Influencer - acesso somente pelo menu/URL (sem auto-redirect) */}
        <Route
          path="/influencer/*"
          element={
            <ProtectedInfluencerRoute>
              <InfluencerLayout />
            </ProtectedInfluencerRoute>
          }
        >
          <Route index element={<InfluencerDashboard />} />
          <Route path="pedidos" element={<InfluencerPedidos />} />
          <Route path="perfil" element={<InfluencerPerfil />} />
        </Route>
      </Routes>

      {/* Modal do carrinho com ação de finalizar → checkout */}
      <ModalCarrinho
        show={mostrarCarrinho}
        handleClose={() => setMostrarCarrinho(false)}
        onFinalizar={irParaCheckout}
      />

      <Footer />
    </>
  );
}

// -----------------------------
// App raiz com Providers e Router
// -----------------------------
export default function App() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <Router>
          <AppShell />
        </Router>
      </CarrinhoProvider>
    </AuthProvider>
  );
}
