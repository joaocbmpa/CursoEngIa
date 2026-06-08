import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function InfluencerPerfil() {
  const { usuario } = useAuth();
  const urlCupom = usuario?.cupom
    ? `${window.location.origin}/?cupom=${encodeURIComponent(usuario.cupom)}`
    : null;

  return (
    <div>
      <h3 className="mb-4">Meu Perfil</h3>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Nome</label>
              <input className="form-control" value={usuario?.displayName || ''} readOnly />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">E-mail</label>
              <input className="form-control" value={usuario?.email || ''} readOnly />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Papel</label>
              <input className="form-control" value={usuario?.role || ''} readOnly />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">% Comissão</label>
              <input
                className="form-control"
                value={`${Math.round((usuario?.comissao || 0) * 100)}%`}
                readOnly
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Cupom</label>
              <input className="form-control" value={usuario?.cupom || '—'} readOnly />
            </div>

            <div className="col-12">
              <label className="form-label">Link com cupom</label>
              <div className="input-group">
                <input className="form-control" value={urlCupom || '—'} readOnly />
                {urlCupom ? (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigator.clipboard.writeText(urlCupom)}
                  >
                    Copiar
                  </button>
                ) : (
                  <button className="btn btn-outline-secondary" disabled>Copiar</button>
                )}
              </div>
              <div className="form-text">
                Compartilhe esse link para atribuir as compras ao seu cupom.
                {!usuario?.cupom && ' Seu cupom ainda não está configurado — fale com o Admin.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
