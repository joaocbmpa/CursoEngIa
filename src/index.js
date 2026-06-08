// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './styles/theme.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { AuthProvider } from './context/AuthContext'; // 👈 Importa o AuthProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* 👈 Envolve toda a aplicação com o contexto de autenticação */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
