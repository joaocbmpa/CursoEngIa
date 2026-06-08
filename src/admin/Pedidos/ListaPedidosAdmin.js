// src/pages/admin/ListaPedidosAdmin.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Spinner,
  Alert,
  Collapse,
  Button,
  ButtonGroup,
  Dropdown,
} from "react-bootstrap";
import { db } from "../../firebase/config";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import axios from "axios";

// ---------- Ícones e status ----------
const iconeStatus = {
  pendente: "⏳",
  approved: "✅",
  enviado: "📦",
  concluido: "🏁",
  rejected: "❌",
};
const STATUS_LIST = ["todos", "pendente", "approved", "enviado", "concluido", "rejected"];

// ---------- Utils ----------
const toNum = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
const formatBRL = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    toNum(v)
  );
const subTotalItem = (it) => toNum(it?.preco) * toNum(it?.quantidade || 1);
const totalSeguro = (pedido) => {
  const salvo = toNum(pedido?.total);
  if (salvo > 0) return salvo;
  const itens = Array.isArray(pedido?.itens) ? pedido.itens : [];
  const soma = itens.reduce((acc, it) => acc + subTotalItem(it), 0);
  const frete = toNum(pedido?.frete);
  return soma + frete;
};
const toJSDate = (v) => {
  if (!v) return null;
  if (v?.seconds) return new Date(v.seconds * 1000);
  const d = new Date(v);
  return isNaN(d) ? null : d;
};

// ---------- Exportar CSV ----------
function exportarCSV(pedidos) {
  const header = [
    "ID","Data","Status","Cliente","Email","Tipo","Origem","Telefone",
    "Total","Frete","CEP","Rua","Número","Complemento","Bairro","Cidade","UF",
    "Observação","Itens",
  ];
  const linhas = pedidos.map((p) => {
    const data = toJSDate(p?.criadoEm);
    const dataFmt = data ? `${data.toLocaleDateString()} ${data.toLocaleTimeString()}` : "";
    const end = p?.enderecoDetalhado || {};
    const itensTxt = (p?.itens || [])
      .map((it) => `${(it?.nome || "").replace(/;/g, ",")} x${toNum(it?.quantidade)} (${formatBRL(it?.preco)})`)
      .join(" | ");
    return [
      p?.id || "",
      dataFmt,
      p?.status || "",
      p?.nome || "",
      p?.email || "",
      p?.isGuest ? "Convidado" : "Cliente",
      p?.origem || "",
      p?.telefone || "",
      toNum(p?.total).toString().replace(".", ","),
      toNum(p?.frete).toString().replace(".", ","),
      end?.cep || "",
      end?.rua || "",
      end?.numero || "",
      end?.complemento || "",
      end?.bairro || "",
      end?.cidade || "",
      end?.uf || "",
      (p?.observacao || "").replace(/\n/g, " ").replace(/;/g, ","),
      itensTxt.replace(/;/g, ","),
    ];
  });
  const csv = [header, ...linhas]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pedidos-${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Exportar PDF (print) ----------
function exportarPDF(pedidos) {
  const rows = pedidos.map((p) => {
    const data = toJSDate(p?.criadoEm);
    const dataFmt = data ? `${data.toLocaleDateString()} ${data.toLocaleTimeString()}` : "";
    const total = formatBRL(totalSeguro(p));
    const itens = (p?.itens || [])
      .map(
        (it) =>
          `<div class="it">${(it?.nome || "-")}&nbsp;|&nbsp;Qtd: ${toNum(it?.quantidade)}&nbsp;|&nbsp;Preço: ${formatBRL(
            it?.preco
          )}&nbsp;|&nbsp;Subtotal: ${formatBRL(subTotalItem(it))}</div>`
      )
      .join("");
    const end = p?.enderecoDetalhado
      ? `${p.enderecoDetalhado.rua || ""}, ${p.enderecoDetalhado.numero || ""}${
          p.enderecoDetalhado.complemento ? `, ${p.enderecoDetalhado.complemento}` : ""
        } - ${p.enderecoDetalhado.bairro || ""}, ${p.enderecoDetalhado.cidade || ""} - ${
          p.enderecoDetalhado.uf || ""
        } (CEP ${p.enderecoDetalhado.cep || ""})`
      : p?.endereco || "-";
    return `
      <tr>
        <td>${(p?.id || "").slice(0,8)}</td>
        <td>${p?.nome || "-"}<br/><small>${p?.email || "-"}</small></td>
        <td>${p?.status || "-"}</td>
        <td>${dataFmt}</td>
        <td>${p?.isGuest ? "Convidado" : "Cliente"}</td>
        <td>${p?.origem || "-"}</td>
        <td>${total}</td>
      </tr>
      <tr>
        <td colspan="7">
          <div class="addr"><strong>Endereço:</strong> ${end}</div>
          <div class="obs"><strong>Obs.:</strong> ${p?.observacao || "-"}</div>
          <div class="itens"><strong>Itens:</strong> ${itens || "-"}</div>
        </td>
      </tr>`;
  }).join("");
  const html = `
<!doctype html>
<html><head><meta charset="utf-8"/>
<title>Pedidos</title>
<style>
body{font-family:Arial,sans-serif;font-size:12px;color:#222}
h1{font-size:18px;margin:0 0 12px}
table{width:100%;border-collapse:collapse}
th,td{border:1px solid #ddd;padding:6px 8px;vertical-align:top}
th{background:#f3f3f3;text-align:left}
.addr,.obs,.itens{margin-top:4px}
.it{margin-left:10px}
@media print{@page{margin:14mm}}
</style></head>
<body>
<h1>Relatório de Pedidos</h1>
<table>
<thead><tr><th>ID</th><th>Cliente</th><th>Status</th><th>Data</th><th>Tipo</th><th>Origem</th><th>Total</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<script>window.print();</script>
</body></html>`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
}

// ---------- Componente principal ----------
export default function ListaPedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [detalhesVisiveis, setDetalhesVisiveis] = useState({});
  const [filtroStatus, setFiltroStatus] = useState("todos");

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    setCarregando(true);
    try {
      const ref = collection(db, "pedidos");
      let snap;
      try {
        snap = await getDocs(query(ref, orderBy("criadoEm", "desc")));
      } catch {
        snap = await getDocs(ref); // fallback
      }
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPedidos(lista);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      setErro("Erro ao carregar pedidos.");
    } finally {
      setCarregando(false);
    }
  };

  const toggleDetalhes = (id) =>
    setDetalhesVisiveis((prev) => ({ ...prev, [id]: !prev[id] }));

  const atualizarStatus = async (id, novoStatus) => {
    try {
      await updateDoc(doc(db, "pedidos", id), { status: novoStatus });
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status: novoStatus } : p)));
    } catch {
      alert("Erro ao atualizar status.");
    }
  };

  const reenviarEmail = async (pedidoId) => {
    try {
      await axios.post(
        "https://us-central1-xadrezjl-828b4.cloudfunctions.net/reenviarEmailConfirmacao",
        { id: pedidoId }
      );
      alert("✅ E-mail reenviado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao reenviar e-mail.");
    }
  };

  const excluirPedido = async (id) => {
    if (!window.confirm("Deseja realmente excluir este pedido?")) return;
    try {
      await deleteDoc(doc(db, "pedidos", id));
      setPedidos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Erro ao excluir pedido.");
    }
  };

  const pedidosFiltrados = useMemo(() => {
    if (filtroStatus === "todos") return pedidos;
    return pedidos.filter((p) => (p?.status || "pendente") === filtroStatus);
  }, [pedidos, filtroStatus]);

  return (
    <div className="container py-4">
      {/* Cores de status (pode mover para CSS global) */}
      <style>{`
        .status-pendente{color:#ff9800;font-weight:600}
        .status-approved{color:#2e7d32;font-weight:700}
        .status-enviado{color:#1976d2;font-weight:600}
        .status-concluido{color:#1b5e20;font-weight:700}
        .status-rejected{color:#d32f2f;font-weight:700}
      `}</style>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">📦 Pedidos Recebidos</h3>
        <div className="d-flex gap-2">
          <Button variant="outline-dark" size="sm" onClick={() => exportarCSV(pedidosFiltrados)}>
            ⬇️ Exportar CSV
          </Button>
          <Button variant="outline-dark" size="sm" onClick={() => exportarPDF(pedidosFiltrados)}>
            🖨️ Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-3">
        <ButtonGroup>
          {STATUS_LIST.map((s) => (
            <Button
              key={s}
              variant={filtroStatus === s ? "primary" : "outline-primary"}
              size="sm"
              onClick={() => setFiltroStatus(s)}
            >
              {s === "todos" ? "Todos" : `${iconeStatus[s] || ""} ${s}`}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {carregando && <Spinner animation="border" />}
      {erro && <Alert variant="danger">{erro}</Alert>}
      {!carregando && pedidosFiltrados.length === 0 && (
        <Alert variant="info">Nenhum pedido encontrado.</Alert>
      )}

      {!carregando && pedidosFiltrados.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Status</th>
              <th>Data</th>
              <th>Origem</th>
              <th>Tipo</th>
              <th>Total</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map((pedido) => {
              const data = toJSDate(pedido?.criadoEm);
              const dataFormatada = data
                ? data.toLocaleDateString() + " " + data.toLocaleTimeString()
                : "---";
              const total = totalSeguro(pedido);
              const statusClass = `status-${pedido?.status || "pendente"}`;

              return (
                <React.Fragment key={pedido.id}>
                  <tr>
                    <td title={pedido.id}>{pedido.id.slice(0, 8)}</td>
                    <td>
                      {pedido?.nome || "-"}
                      <br />
                      <small>{pedido?.email || "-"}</small>
                    </td>
                    <td className={statusClass}>
                      {iconeStatus[pedido?.status] || "📄"} {pedido?.status || "pendente"}
                    </td>
                    <td>{dataFormatada}</td>
                    <td>{pedido?.origem || "—"}</td>
                    <td>{pedido?.isGuest ? "Convidado" : "Cliente"}</td>
                    <td className="fw-bold">{formatBRL(total)}</td>
                    <td>
                      <ButtonGroup>
                        <Dropdown>
                          <Dropdown.Toggle size="sm" variant="outline-secondary">
                            Status
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            {["approved", "enviado", "concluido", "rejected"].map((st) => (
                              <Dropdown.Item key={st} onClick={() => atualizarStatus(pedido.id, st)}>
                                {iconeStatus[st]} {st}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>

                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => toggleDetalhes(pedido.id)}
                        >
                          {detalhesVisiveis[pedido.id] ? "Ocultar" : "Ver"}
                        </Button>

                        {["approved", "enviado", "concluido"].includes(pedido?.status) && (
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => reenviarEmail(pedido.id)}
                          >
                            📨 Reenviar
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => excluirPedido(pedido.id)}
                        >
                          Excluir
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan="8" style={{ padding: 0, border: "none" }}>
                      <Collapse in={detalhesVisiveis[pedido.id]}>
                        <div className="p-3 bg-light">
                          <strong>Itens:</strong>
                          <Table size="sm" className="mt-2">
                            <thead>
                              <tr>
                                <th>Produto</th>
                                <th>Variação</th>
                                <th>Qtd</th>
                                <th>Preço</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(pedido?.itens || []).map((it, idx) => (
                                <tr key={idx}>
                                  <td>{it?.nome || "-"}</td>
                                  <td>{it?.variacao ?? "-"}</td>
                                  <td>{toNum(it?.quantidade)}</td>
                                  <td>{formatBRL(it?.preco)}</td>
                                  <td>{formatBRL(subTotalItem(it))}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>

                          {pedido?.frete !== undefined && pedido?.frete !== null && (
                            <p>
                              <strong>Frete:</strong> {formatBRL(pedido.frete)}
                            </p>
                          )}

                          {pedido?.prazoEntrega && (
                            <p>
                              <strong>Prazo de Entrega:</strong> {String(pedido.prazoEntrega)}
                            </p>
                          )}

                          {pedido?.observacao && (
                            <p>
                              <strong>Observação:</strong> {pedido.observacao}
                            </p>
                          )}

                          {/* Endereço: objeto detalhado ou string simples */}
                          {pedido?.enderecoDetalhado ? (
                            <p>
                              <strong>Endereço:</strong>{" "}
                              {`${pedido.enderecoDetalhado.rua || ""}, ${pedido.enderecoDetalhado.numero || ""}${
                                pedido.enderecoDetalhado.complemento
                                  ? `, ${pedido.enderecoDetalhado.complemento}`
                                  : ""
                              } - ${pedido.enderecoDetalhado.bairro || ""}, ${
                                pedido.enderecoDetalhado.cidade || ""
                              } - ${pedido.enderecoDetalhado.uf || ""}, CEP: ${
                                pedido.enderecoDetalhado.cep || ""
                              }`}
                            </p>
                          ) : pedido?.endereco ? (
                            <p>
                              <strong>Endereço:</strong> {pedido.endereco}
                            </p>
                          ) : null}
                        </div>
                      </Collapse>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
