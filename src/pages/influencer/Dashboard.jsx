import React, { useEffect, useMemo, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

const toBRL = (n = 0) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const getValor = (p) => Number(p?.total ?? p?.valorTotal ?? 0);
const getDate = (p) => {
  const t = p?.criadoEm?.toDate?.() || p?.data?.toDate?.();
  return t ? t.toLocaleString('pt-BR') : '—';
};

// normaliza status (Mercado Pago → pt-BR) e escolhe badge
const normStatus = (s = '') => {
  const m = String(s).toLowerCase();
  if (m === 'approved' || m === 'aprovado') return 'Aprovado';
  if (m === 'pending' || m === 'pendente') return 'Pendente';
  if (m === 'rejected' || m === 'cancelado' || m === 'cancelled') return 'Cancelado';
  if (m === 'enviado') return 'Enviado';
  if (m === 'concluido' || m === 'completed') return 'Concluído';
  return s || '—';
};
const badge = (s) => {
  const n = normStatus(s);
  if (n === 'Aprovado' || n === 'Concluído' || n === 'Enviado') return 'success';
  if (n === 'Pendente') return 'warning';
  if (n === 'Cancelado') return 'danger';
  return 'secondary';
};

export default function InfluencerDashboard() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // stream de pedidos do influencer
  useEffect(() => {
    if (!usuario?.uid) return;
    const q = query(
      collection(db, 'pedidos'),
      where('idInfluencer', '==', usuario.uid),
      orderBy('criadoEm', 'desc') // cai para 'data' se seu índice for por 'data'
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPedidos(list);
      setLoading(false);
    });
    return () => unsub();
  }, [usuario?.uid]);

  const kpis = useMemo(() => {
    const aprovados = pedidos.filter((p) => ['Aprovado', 'Concluído', 'Enviado'].includes(normStatus(p.status)));
    const totalVendas = aprovados.reduce((acc, p) => acc + getValor(p), 0);
    const comPerc = Number(usuario?.comissao || 0);
    const totalComissao = totalVendas * comPerc;

    const pendentes = pedidos.filter((p) => normStatus(p.status) === 'Pendente').length;
    const cancelados = pedidos.filter((p) => normStatus(p.status) === 'Cancelado').length;

    return {
      pedidosAprovados: aprovados.length,
      pendentes,
      cancelados,
      totalVendas,
      totalComissao,
      comPerc,
    };
  }, [pedidos, usuario?.comissao]);

  // exporta os 50 últimos (ou menos) para CSV
  const exportCSV = () => {
    const head = ['PedidoID', 'Data', 'Status', 'Valor', 'Cupom'];
    const body = pedidos.slice(0, 50).map((p) => [
      p.id,
      getDate(p),
      normStatus(p.status),
      getValor(p).toFixed(2).replace('.', ','),
      p.cupom || '',
    ]);
    const csv = [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-influencer-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h3 className="mb-0">Dashboard do Influencer</h3>
        <button className="btn btn-outline-dark btn-sm" onClick={exportCSV}>⬇️ Exportar CSV</button>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="small text-muted">Pedidos aprovados</div>
              <div className="h4 mb-0">{kpis.pedidosAprovados}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="small text-muted">Total vendido</div>
              <div className="h4 mb-0">{toBRL(kpis.totalVendas)}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="small text-muted">Comissão ({Math.round(kpis.comPerc * 100)}%)</div>
              <div className="h4 mb-0">{toBRL(kpis.totalComissao)}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="small text-muted">Cupom</div>
              <div className="h5 mb-1">{usuario?.cupom || '—'}</div>
              <div className="text-muted small">Pendentes: {kpis.pendentes} · Cancelados: {kpis.cancelados}</div>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-4" />

      <h5 className="mb-3">Últimos pedidos</h5>
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>Data</th>
              <th>Status</th>
              <th className="text-end">Valor</th>
              <th className="text-center">Cupom</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4}>Carregando…</td></tr>
            )}
            {!loading && pedidos.slice(0, 10).map((p) => (
              <tr key={p.id}>
                <td>{getDate(p)}</td>
                <td><span className={`badge text-bg-${badge(p.status)}`}>{normStatus(p.status)}</span></td>
                <td className="text-end">{toBRL(getValor(p))}</td>
                <td className="text-center">{p.cupom || '—'}</td>
              </tr>
            ))}
            {!loading && pedidos.length === 0 && (
              <tr><td colSpan={4}>Nenhum pedido ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
