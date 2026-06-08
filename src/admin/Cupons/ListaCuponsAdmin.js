import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';

function formatDesconto(c) {
  if (c?.tipo === 'percentual') return `${(c.valor ?? 0)}%`;
  if (c?.tipo === 'valor_fixo') return `R$ ${(Number(c.valor) || 0).toFixed(2)}`;
  return '-';
}

function formatValidade(v) {
  if (!v) return '—';
  // Armazenamos como 'YYYY-MM-DD' string; força timezone neutro para evitar off-by-one.
  const d = new Date(`${v}T00:00:00`);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleDateString('pt-BR');
}

function estaVencido(validadeStr) {
  if (!validadeStr) return false;
  const hoje = new Date();
  const val = new Date(`${validadeStr}T23:59:59`);
  return val.getTime() < hoje.getTime();
}

export default function ListaCuponsAdmin() {
  const [cupons, setCupons] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  const carregar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const qy = query(collection(db, 'cupons'), orderBy('codigo'));
      const querySnapshot = await getDocs(qy);
      const lista = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setCupons(lista);
    } catch (err) {
      console.error('Erro ao buscar cupons:', err);
      setErro('Erro ao carregar os cupons.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const excluirCupom = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cupom?')) return;
    try {
      await deleteDoc(doc(db, 'cupons', id));
      setCupons(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Erro ao excluir cupom:', err);
      setErro('Erro ao excluir cupom.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>🎟️ Cupons</h3>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={carregar} disabled={carregando}>
            Atualizar
          </Button>
          <Button variant="success" onClick={() => navigate('/admin/cupons/novo')}>
            + Novo Cupom
          </Button>
        </div>
      </div>

      {carregando && <Spinner animation="border" />}
      {erro && <Alert variant="danger" className="mt-2">{erro}</Alert>}

      {!carregando && cupons.length === 0 && (
        <Alert variant="info">Nenhum cupom cadastrado.</Alert>
      )}

      {!carregando && cupons.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Código</th>
              <th>Desconto</th>
              <th>Tipo</th>
              <th>Validade</th>
              <th>Status</th>
              <th style={{ width: 220 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cupons.map(cupom => {
              const vencido = estaVencido(cupom.validade);
              const status = !cupom.ativo
                ? <Badge bg="secondary">Inativo</Badge>
                : vencido ? <Badge bg="danger">Vencido</Badge>
                : <Badge bg="success">Ativo</Badge>;

              return (
                <tr key={cupom.id}>
                  <td>{cupom.codigo}</td>
                  <td>{formatDesconto(cupom)}</td>
                  <td>{cupom.tipo === 'valor_fixo' ? 'Valor Fixo' : 'Percentual'}</td>
                  <td>{formatValidade(cupom.validade)}</td>
                  <td className="text-center">{status}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/admin/cupons/editar/${cupom.id}`)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => excluirCupom(cupom.id)}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
