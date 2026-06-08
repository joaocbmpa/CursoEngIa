import React, { useEffect, useMemo, useState } from 'react';
import {
  collection, query, where, orderBy, limit, startAfter, getDocs
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

const toBRL = (n = 0) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const getValor = (p) => Number(p?.total ?? p?.valorTotal ?? 0);
const getDate = (p) => {
  const t = p?.criadoEm?.toDate?.() || p?.data?.toDate?.();
  return t ? t.toLocaleString('pt-BR') : '—';
};
const normStatus = (s = '') => {
  const m = String(s).toLowerCase();
  if (m === 'approved' || m === 'aprovado') return 'aprovado';
  if (m === 'pending' || m === 'pendente') return 'pendente';
  if (m === 'rejected' || m === 'cancelado' || m === 'cancelled') return 'cancelado';
  if (m === 'enviado') return 'enviado';
  if (m === 'concluido' || m === 'completed') return 'concluido';
  return (s || '').toLowerCase();
};
const badge = (s) => {
  const n = normStatus(s);
  if (n === 'aprovado' || n === 'concluido' || n === 'enviado') return 'success';
  if (n === 'pendente') return 'warning';
  if (n === 'cancelado') return 'danger';
  return 'secondary';
};

export default function InfluencerPedidos() {
  const { usuario } = useAuth();
  const [items, setItems] = useState([]);
  const [filtro, setFiltro] = useState('todos'); // todos | aprovado | pendente | cancelado | enviado | concluido
  const [busca, setBusca] = useState('');        // por ID (simples)
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [temMais, setTemMais] = useState(true);

  const PAGE = 15;

  const baseQuery = useMemo(() => {
    if (!usuario?.uid) return null;
    return query(
      collection(db, 'pedidos'),
      where('idInfluencer', '==', usuario.uid),
      orderBy('criadoEm', 'desc'),
      limit(PAGE)
    );
  }, [usuario?.uid]);

  async function carregarPrimeira() {
    if (!baseQuery) return;
    setLoading(true);
    const snap = await getDocs(baseQuery);
    const list = snap.docs.map((d) => ({ id: d.id, ref: d, ...d.data() }));
    setItems(list);
    setCursor(snap.docs[snap.docs.length - 1] || null);
    setTemMais(snap.docs.length === PAGE);
    setLoading(false);
  }

  async function carregarMais() {
    if (!cursor || !usuario?.uid) return;
    setLoading(true);
    const q = query(
      collection(db, 'pedidos'),
      where('idInfluencer', '==', usuario.uid),
      orderBy('criadoEm', 'desc'),
      startAfter(cursor),
      limit(PAGE)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ref: d, ...d.data() }));
    setItems((prev) => [...prev, ...list]);
    setCursor(snap.docs[snap.docs.length - 1] || null);
    setTemMais(snap.docs.length === PAGE);
    setLoading(false);
  }

  useEffect(() => {
    carregarPrimeira();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.uid]);

  const exibidos = useMemo(() => {
    let arr = items;
    if (filtro !== 'todos') arr = arr.filter((i) => normStatus(i.status) === filtro);
    if (busca.trim()) arr = arr.filter((i) => i.id.toLowerCase().includes(busca.trim().toLowerCase()));
    return arr;
  }, [items, filtro, busca]);

  // totais do que está visível
  const totais = useMemo(() => {
    const totalVendas = exibidos.reduce((s, i) => s + getValor(i), 0);
    const comPerc = Number(usuario?.comissao || 0);
    return {
      qtd: exibidos.length,
      vendas: totalVendas,
      comissao: totalVendas * comPerc,
      comPerc,
    };
  }, [exibidos, usuario?.comissao]);

  const exportCSV = () => {
    const head = ['PedidoID', 'Data', 'Status', 'Valor', 'Cupom'];
    const body = exibidos.map((p) => [
      p.id, getDate(p), normStatus(p.status), getValor(p).toFixed(2).replace('.', ','), p.cupom || ''
    ]);
    const csv = [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos-influencer-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h3 className="mb-0">Pedidos por Cupom</h3>
        <button className="btn btn-outline-dark btn-sm" onClick={exportCSV}>⬇️ Exportar CSV</button>
      </div>

      {/* Filtros */}
      <div className="row g-2 align-items-end mb-3">
        <div className="col-12 col-md-4">
          <label className="form-label m-0">Filtrar status:</label>
          <select className="form-select form-select-sm" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="aprovado">Aprovado</option>
            <option value="pendente">Pendente</option>
            <option value="cancelado">Cancelado</option>
            <option value="enviado">Enviado</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label m-0">Buscar por ID:</label>
          <input
            className="form-control form-control-sm"
            placeholder="Ex.: 9fG3K..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between small">
                <div><strong>{totais.qtd}</strong> pedidos</div>
                <div>Vendido: <strong>{toBRL(totais.vendas)}</strong></div>
                <div>Comissão ({Math.round(totais.comPerc*100)}%): <strong>{toBRL(totais.comissao)}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>Data</th>
              <th>Status</th>
              <th className="text-end">Valor</th>
              <th className="text-center">Cupom</th>
              <th className="text-muted">ID</th>
            </tr>
          </thead>
          <tbody>
            {exibidos.map((p) => (
              <tr key={p.id}>
                <td>{getDate(p)}</td>
                <td><span className={`badge text-bg-${badge(p.status)}`}>{(normStatus(p.status) || '—').toUpperCase()}</span></td>
                <td className="text-end">{toBRL(getValor(p))}</td>
                <td className="text-center">{p.cupom || '—'}</td>
                <td className="text-muted small">{p.id}</td>
              </tr>
            ))}
            {exibidos.length === 0 && !loading && (
              <tr><td colSpan={5}>Nenhum pedido encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-center mt-3">
        <button className="btn btn-outline-primary" disabled={!temMais || loading} onClick={carregarMais}>
          {loading ? 'Carregando…' : temMais ? 'Carregar mais' : 'Fim da lista'}
        </button>
      </div>
    </div>
  );
}
