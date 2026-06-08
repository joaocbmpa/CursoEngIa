// src/admin/ProtectedAdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedAdminRoute({ children }) {
  const { usuario, carregando } = useAuth();

  if (carregando) return <p>Carregando...</p>;

  if (!usuario || usuario.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
