// src/App.js
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';

import Header from './components/Header';
import Home from './pages/Home';
import RecomendadorIA from './pages/RecomendadorIA';
import Sobre from './pages/Sobre';
import Footer from './components/Footer';

function AppShell() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recomendador-ia" element={<RecomendadorIA />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
