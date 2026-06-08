import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Alert,
  Form,
  Row,
  Col,
  ButtonGroup,
  Spinner,
  Dropdown,
  Badge,
  Modal,
} from "react-bootstrap";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import axios from "axios"; // 👈 NOVO

// === CONFIGURE AQUI ======================================
// Troque pela URL da sua Cloud Function HTTP (Admin SDK)
const ADMIN_CREATE_USER_URL =
  "https://us-central1-xadrezjl-828b4.cloudfunctions.net/adminCreateUser";
// =========================================================

// -------- util --------
const debounce = (fn, ms = 300) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

const toDate = (v) => {
  if (!v) return null;
  if (v?.seconds) return new Date(v.seconds * 1000);
  const d = new Date(v);
  return isNaN(d) ? null : d;
};

const formatDateTime = (v) => {
  const d = toDate(v);
  if (!d) return "—";
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
};

function exportCSV(rows, filename) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ListaUsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [pedidosPorUser, setPedidosPorUser] = useState({});
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(true);

  // filtros/estado UI
  const [busca, setBusca] = useState("");
  const [roleFiltro, setRoleFiltro] = useState("todos");
  const [sortKey, setSortKey] = useState("nome");
  const [sortDir, setSortDir] = useState("asc");

  // seleção/bulk actions
  const [selecionados, setSelecionados] = useState(new Set());

  // paginação
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // edição (modal)
  const [showEdit, setShowEdit] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // criação (modal)
  const [showCreate, setShowCreate] = useState(false);      // 👈 NOVO
  const [creating, setCreating] = useState(false);          // 👈 NOVO
  const [createErr, setCreateErr] = useState("");           // 👈 NOVO
  const [createForm, setCreateForm] = useState({            // 👈 NOVO
    nome: "",
    email: "",
    senha: "",
    role: "cliente",     // cliente | admin | editor | influencer
    cupom: "",
    comissao: 0.05,      // 5% por padrão
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErro(null);
      try {
        const snap = await getDocs(collection(db, "usuarios"));
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsuarios(lista);

        const pSnap = await getDocs(query(collection(db, "pedidos")));
        const counts = {};
        pSnap.docs.forEach((d) => {
          const data = d.data() || {};
          const uid = data.usuarioId ?? null;
          if (!uid) return;
          counts[uid] = (counts[uid] || 0) + 1;
        });
        setPedidosPorUser(counts);
      } catch (err) {
        console.error("Erro ao carregar usuários/pedidos:", err);
        setErro("Erro ao carregar usuários.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // busca com debounce
  const [buscaLocal, setBuscaLocal] = useState("");
  useEffect(() => {
    const apply = debounce(setBusca, 300);
    apply(buscaLocal);
  }, [buscaLocal]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleSelect = (id) => {
    setSelecionados((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAllPage = (ids) => {
    setSelecionados((prev) => {
      const n = new Set(prev);
      const allSelected = ids.every((id) => n.has(id));
      if (allSelected) ids.forEach((id) => n.delete(id));
      else ids.forEach((id) => n.add(id));
      return n;
    });
  };

  const usuariosFiltrados = useMemo(() => {
    const term = busca.trim().toLowerCase();
    let list = usuarios.filter((u) => {
      const hitTerm =
        !term ||
        u.nome?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term);
      const hitRole =
        roleFiltro === "todos" || (u.role || "cliente") === roleFiltro;
      return hitTerm && hitRole;
    });

    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const A = (a[sortKey] ?? "").toString().toLowerCase();
      const B = (b[sortKey] ?? "").toString().toLowerCase();

      if (sortKey === "criadoEm") {
        const da = toDate(a.criadoEm)?.getTime() || 0;
        const dbt = toDate(b.criadoEm)?.getTime() || 0;
        return (da - dbt) * dir;
      }
      if (A < B) return -1 * dir;
      if (A > B) return 1 * dir;
      return 0;
    });

    return list;
  }, [usuarios, busca, roleFiltro, sortKey, sortDir]);

  // paginação
  const totalPages = Math.max(1, Math.ceil(usuariosFiltrados.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const pageSlice = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return usuariosFiltrados.slice(start, start + pageSize);
  }, [usuariosFiltrados, pageSafe]);

  useEffect(() => {
    setPage(1);
  }, [busca, roleFiltro, sortKey, sortDir]);

  const excluirUsuario = async (id, email) => {
    if (!window.confirm(`Excluir o usuário ${email}? Essa ação é irreversível.`)) return;
    try {
      await deleteDoc(doc(db, "usuarios", id));
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      setSelecionados((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir usuário.");
    }
  };

  const alterarRole = async (id, novaRole) => {
    try {
      await updateDoc(doc(db, "usuarios", id), { role: novaRole });
      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, role: novaRole } : u)));
    } catch (err) {
      console.error("Erro ao atualizar role:", err);
      alert("Erro ao atualizar papel do usuário.");
    }
  };

  const bulkExcluir = async () => {
    if (selecionados.size === 0) return;
    if (!window.confirm(`Excluir ${selecionados.size} usuário(s)?`)) return;
    try {
      await Promise.all(
        Array.from(selecionados).map((id) => deleteDoc(doc(db, "usuarios", id)))
      );
      setUsuarios((prev) => prev.filter((u) => !selecionados.has(u.id)));
      setSelecionados(new Set());
    } catch (err) {
      console.error("Erro em exclusão em massa:", err);
      alert("Erro ao excluir em massa.");
    }
  };

  const bulkRole = async (novaRole) => {
    if (selecionados.size === 0) return;
    if (!window.confirm(`Definir papel "${novaRole}" para ${selecionados.size} usuário(s)?`))
      return;
    try {
      await Promise.all(
        Array.from(selecionados).map((id) => updateDoc(doc(db, "usuarios", id), { role: novaRole }))
      );
      setUsuarios((prev) =>
        prev.map((u) => (selecionados.has(u.id) ? { ...u, role: novaRole } : u))
      );
    } catch (err) {
      console.error("Erro ao alterar papel em massa:", err);
      alert("Erro ao alterar papel em massa.");
    }
  };

  const exportarUsuariosCSV = () => {
    const header = ["ID","Nome","E-mail","Papel","Criado em","Último CEP","Pedidos","Cupom","Comissão(%)"];
    const rows = [header].concat(
      usuariosFiltrados.map((u) => [
        u.id,
        u.nome || "",
        u.email || "",
        u.role || "cliente",
        formatDateTime(u.criadoEm),
        u.ultimoCep || "",
        pedidosPorUser[u.id] || 0,
        u.cupom || "",
        Math.round(((typeof u.comissao === "number" ? u.comissao : 0) * 100)),
      ])
    );
    exportCSV(rows, `usuarios-${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.csv`);
  };

  // ---- edição ----
  const abrirEdicao = (user) => {
    setEditUser({
      id: user.id,
      nome: user.nome || "",
      email: user.email || "",
      role: user.role || "cliente",
      ultimoCep: user.ultimoCep || "",
      cupom: user.cupom || "",
      comissao: (typeof user.comissao === "number" ? user.comissao : 0),
    });
    setShowEdit(true);
  };

  const salvarEdicao = async () => {
    if (!editUser) return;
    const { id, nome, email, role, ultimoCep, cupom, comissao } = editUser;

    if (!nome.trim()) return alert("Informe o nome.");
    if (!email.trim()) return alert("Informe o e-mail.");
    const comPerc = Number(comissao);
    const comNorm = isNaN(comPerc) ? 0 : Math.max(0, Math.min(1, comPerc)); // 0..1

    try {
      setSavingEdit(true);
      await updateDoc(doc(db, "usuarios", id), {
        nome: nome.trim(),
        email: email.trim(), // ⚠️ apenas Firestore
        role,
        ultimoCep: ultimoCep.trim() || null,
        cupom: cupom?.trim() ? cupom.trim().toUpperCase() : null,
        comissao: comNorm,
      });
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                nome: nome.trim(),
                email: email.trim(),
                role,
                ultimoCep: ultimoCep.trim() || null,
                cupom: cupom?.trim() ? cupom.trim().toUpperCase() : null,
                comissao: comNorm,
              }
            : u
        )
      );
      setShowEdit(false);
      setEditUser(null);
    } catch (err) {
      console.error("Erro ao salvar edição:", err);
      alert("Erro ao salvar edição.");
    } finally {
      setSavingEdit(false);
    }
  };

  // ---- criação ----
  const abrirCriacao = () => {                               // 👈 NOVO
    setCreateErr("");
    setCreateForm({
      nome: "",
      email: "",
      senha: "",
      role: "cliente",
      cupom: "",
      comissao: 0.05,
    });
    setShowCreate(true);
  };

  const salvarCriacao = async () => {                        // 👈 NOVO
    setCreateErr("");
    const { nome, email, senha, role, cupom, comissao } = createForm;

    if (!nome.trim()) return setCreateErr("Informe o nome.");
    if (!email.trim()) return setCreateErr("Informe o e-mail.");
    if (!senha.trim() || senha.length < 6)
      return setCreateErr("Informe uma senha temporária (mín. 6 caracteres).");

    const comPerc = Number(comissao);
    const comNorm = isNaN(comPerc) ? 0 : Math.max(0, Math.min(1, comPerc)); // 0..1

    try {
      setCreating(true);

      // Chama sua Cloud Function (Admin SDK no back-end)
      // Esperado: { ok: true, uid, user: { ...docUsuarios } }
      const resp = await axios.post(ADMIN_CREATE_USER_URL, {
        nome: nome.trim(),
        email: email.trim(),
        senha: senha.trim(),
        role,
        cupom: cupom?.trim() ? cupom.trim().toUpperCase() : null,
        comissao: comNorm,
      });

      const payload = resp.data || {};
      if (!payload.ok) {
        throw new Error(payload?.error || "Falha ao criar usuário (Auth/Firestore).");
      }

      // Atualiza a lista sem recarregar
      const novo = payload.user || {
        id: payload.uid,
        uid: payload.uid,
        nome: nome.trim(),
        email: email.trim(),
        role,
        cupom: cupom?.trim() ? cupom.trim().toUpperCase() : null,
        comissao: comNorm,
        criadoEm: new Date().toISOString(),
      };
      // garanta id
      novo.id = novo.id || novo.uid;

      setUsuarios((prev) => [novo, ...prev]);
      setShowCreate(false);
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      setCreateErr(err?.message || "Erro ao criar usuário.");
    } finally {
      setCreating(false);
    }
  };

  const idsPagina = pageSlice.map((u) => u.id);
  const allSelectedThisPage = idsPagina.every((id) => selecionados.has(id));

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h2 className="mb-0">👥 Usuários Cadastrados</h2>
        <div className="d-flex gap-2">
          <Button variant="success" size="sm" onClick={abrirCriacao}>
            ➕ Criar Usuário
          </Button>
          <Button variant="outline-dark" size="sm" onClick={exportarUsuariosCSV}>
            ⬇️ Exportar CSV
          </Button>
          <Dropdown as={ButtonGroup}>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => selectAllPage(idsPagina)}
            >
              {allSelectedThisPage ? "Desmarcar página" : "Selecionar página"}
            </Button>
            <Dropdown.Toggle split size="sm" variant="outline-secondary" />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSelecionados(new Set())}>
                Limpar seleção
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown as={ButtonGroup}>
            <Button
              variant="outline-primary"
              size="sm"
              disabled={selecionados.size === 0}
              onClick={() => bulkRole("cliente")}
            >
              Definir como Cliente
            </Button>
            <Dropdown.Toggle split size="sm" variant="outline-primary" />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => bulkRole("admin")}>
                Definir como Admin
              </Dropdown.Item>
              <Dropdown.Item onClick={() => bulkRole("editor")}>
                Definir como Editor
              </Dropdown.Item>
              <Dropdown.Item onClick={() => bulkRole("influencer")}>
                Definir como Influencer
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button
            variant="outline-danger"
            size="sm"
            disabled={selecionados.size === 0}
            onClick={bulkExcluir}
          >
            Excluir Selecionados
          </Button>
        </div>
      </div>

      {/* ... resto da listagem permanece igual ... */}

      {/* Modal de Edição */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!editUser ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
            </div>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type="text"
                  value={editUser.nome}
                  onChange={(e) =>
                    setEditUser((p) => ({ ...p, nome: e.target.value }))
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser((p) => ({ ...p, email: e.target.value }))
                  }
                />
                <Form.Text className="text-muted">
                  ⚠️ Edita apenas o registro no Firestore (não altera o e-mail do Firebase Auth).
                </Form.Text>
              </Form.Group>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Papel</Form.Label>
                  <Form.Select
                    value={editUser.role}
                    onChange={(e) =>
                      setEditUser((p) => ({ ...p, role: e.target.value }))
                    }
                  >
                    <option value="cliente">Cliente</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="influencer">Influencer</option>
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Último CEP</Form.Label>
                  <Form.Control
                    type="text"
                    value={editUser.ultimoCep}
                    onChange={(e) =>
                      setEditUser((p) => ({ ...p, ultimoCep: e.target.value }))
                    }
                    placeholder="00000-000"
                  />
                </Col>
              </Row>

              {/* Campos específicos de influencer */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Cupom (influencer)</Form.Label>
                  <Form.Control
                    type="text"
                    value={editUser.cupom}
                    placeholder="EX.: RAFAEL5"
                    onChange={(e) =>
                      setEditUser((p) => ({ ...p, cupom: e.target.value.toUpperCase() }))
                    }
                  />
                  <Form.Text className="text-muted">
                    Usar letras/números sem espaços. O código será maiúsculo.
                  </Form.Text>
                </Col>
                <Col md={6}>
                  <Form.Label>Comissão (0 a 1)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={editUser.comissao}
                    onChange={(e) =>
                      setEditUser((p) => ({ ...p, comissao: e.target.value }))
                    }
                  />
                  <Form.Text className="text-muted">
                    Ex.: 0.05 = 5%
                  </Form.Text>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={salvarEdicao} disabled={savingEdit}>
            {savingEdit ? "Salvando..." : "Salvar alterações"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Criação */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Criar Usuário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {createErr && <Alert variant="danger">{createErr}</Alert>}
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  value={createForm.nome}
                  onChange={(e) => setCreateForm((p) => ({ ...p, nome: e.target.value }))}
                  placeholder="Nome completo"
                />
              </Col>
              <Col md={6}>
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Senha temporária</Form.Label>
                <Form.Control
                  type="text"
                  value={createForm.senha}
                  onChange={(e) => setCreateForm((p) => ({ ...p, senha: e.target.value }))}
                  placeholder="mín. 6 caracteres"
                />
                <Form.Text className="text-muted">
                  O usuário poderá redefinir depois.
                </Form.Text>
              </Col>
              <Col md={6}>
                <Form.Label>Papel</Form.Label>
                <Form.Select
                  value={createForm.role}
                  onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))}
                >
                  <option value="cliente">Cliente</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="influencer">Influencer</option>
                </Form.Select>
              </Col>
            </Row>

            {/* Campos de influencer */}
            <Row className="mb-1">
              <Col md={6}>
                <Form.Label>Cupom (se influencer)</Form.Label>
                <Form.Control
                  value={createForm.cupom}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, cupom: e.target.value.toUpperCase() }))
                  }
                  placeholder="EX.: RAFAEL5"
                />
                <Form.Text className="text-muted">
                  Se informar, será salvo também em /cupons.
                </Form.Text>
              </Col>
              <Col md={6}>
                <Form.Label>Comissão (0 a 1)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={createForm.comissao}
                  onChange={(e) => setCreateForm((p) => ({ ...p, comissao: e.target.value }))}
                />
                <Form.Text className="text-muted">Ex.: 0.05 = 5%</Form.Text>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={salvarCriacao} disabled={creating}>
            {creating ? "Criando..." : "Criar usuário"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
