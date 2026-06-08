import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function InfluencerLayout() {
  const { usuario, logout } = useAuth();

  return (
    <div className="container-fluid">
      <div className="row" style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside className="col-12 col-md-3 col-lg-2 bg-light border-end p-3">
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="rounded-circle bg-secondary" style={{ width: 40, height: 40 }} />
            <div className="small">
              <div className="fw-bold">{usuario?.displayName || 'Influencer'}</div>
              <div className="text-muted">{usuario?.email}</div>
            </div>
          </div>

          <nav className="nav flex-column">
            <NavLink
              end
              to="/influencer"
              className={({ isActive }) => 'nav-link' + (isActive ? ' fw-bold text-primary' : '')}
            >
              📊 Dashboard
            </NavLink>
            <NavLink
              to="/influencer/pedidos"
              className={({ isActive }) => 'nav-link' + (isActive ? ' fw-bold text-primary' : '')}
            >
              🧾 Pedidos
            </NavLink>
            <NavLink
              to="/influencer/perfil"
              className={({ isActive }) => 'nav-link' + (isActive ? ' fw-bold text-primary' : '')}
            >
              👤 Perfil
            </NavLink>
          </nav>

          <hr />
          <button className="btn btn-outline-danger btn-sm w-100" onClick={logout}>
            Sair
          </button>
        </aside>

        {/* Conteúdo */}
        <main className="col-12 col-md-9 col-lg-10 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
