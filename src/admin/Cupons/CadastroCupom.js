import React, { useEffect, useState } from 'react';
import { Form, Button, Container, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase/config';
import {
  addDoc, collection, doc, getDoc, updateDoc, serverTimestamp,
  getDocs, query, where
} from 'firebase/firestore';

const DEFAULT_FORM = {
  codigo: '',
  tipo: 'percentual',        // 'percentual' | 'valor_fixo'
  valor: '',                 // número (percentual ou R$)
  validade: '',              // 'YYYY-MM-DD' (string) ou vazio
  ativo: true,
  minimoPedido: '',          // número opcional
  limiteUsoTotal: '',        // inteiro opcional (ex.: 100 usos)
  usoPorUsuario: ''          // inteiro opcional (ex.: 1 uso por CPF/e-mail)
};

export default function CadastroCupom() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [mensagem, setMensagem] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const carregarCupom = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'cupons', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            codigo: data.codigo || '',
            tipo: data.tipo || 'percentual',
            valor: data.valor?.toString?.() ?? '',
            validade: data.validade || '',
            ativo: typeof data.ativo === 'boolean' ? data.ativo : true,
            minimoPedido: data.minimoPedido?.toString?.() ?? '',
            limiteUsoTotal: data.limiteUsoTotal?.toString?.() ?? '',
            usoPorUsuario: data.usoPorUsuario?.toString?.() ?? '',
          });
        }
      } catch (error) {
        console.error('Erro ao carregar cupom:', error);
        setErro('Erro ao carregar cupom.');
      }
    };
    carregarCupom();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validar = () => {
    setErro(null);

    if (!form.codigo.trim()) {
      setErro('Informe o código do cupom.');
      return false;
    }
    if (!form.valor || isNaN(parseFloat(form.valor))) {
      setErro('Informe um valor de desconto válido.');
      return false;
    }
    if (form.tipo === 'percentual') {
      const v = parseFloat(form.valor);
      if (v <= 0 || v > 100) {
        setErro('Percentual deve estar entre 0 e 100.');
        return false;
      }
    }
    if (form.minimoPedido && isNaN(parseFloat(form.minimoPedido))) {
      setErro('Mínimo de pedido inválido.');
      return false;
    }
    if (form.limiteUsoTotal && (isNaN(parseInt(form.limiteUsoTotal)) || parseInt(form.limiteUsoTotal) < 0)) {
      setErro('Limite de uso total inválido.');
      return false;
    }
    if (form.usoPorUsuario && (isNaN(parseInt(form.usoPorUsuario)) || parseInt(form.usoPorUsuario) < 0)) {
      setErro('Uso por usuário inválido.');
      return false;
    }
    if (form.validade && !/^\d{4}-\d{2}-\d{2}$/.test(form.validade)) {
      setErro('Validade deve ser uma data no formato AAAA-MM-DD.');
      return false;
    }
    return true;
  };

  const codigoExiste = async (codigoUpper) => {
    // Evita duplicidade de código (case-insensitive)
    const q = query(collection(db, 'cupons'), where('codigo', '==', codigoUpper));
    const snap = await getDocs(q);
    return snap.docs.find(d => d.id !== id); // se edição, ignora o próprio
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setCarregando(true);
    setMensagem(null);
    setErro(null);

    try {
      const codigoUpper = form.codigo.trim().toUpperCase();

      if (!id) {
        const existe = await codigoExiste(codigoUpper);
        if (existe) {
          setErro('Já existe um cupom com esse código.');
          setCarregando(false);
          return;
        }
      }

      const dados = {
        codigo: codigoUpper,
        tipo: form.tipo, // 'percentual' | 'valor_fixo'
        valor: parseFloat(form.valor),
        validade: form.validade || '', // string 'YYYY-MM-DD' ou vazio
        ativo: !!form.ativo,
        minimoPedido: form.minimoPedido ? parseFloat(form.minimoPedido) : null,
        limiteUsoTotal: form.limiteUsoTotal ? parseInt(form.limiteUsoTotal) : null,
        usoPorUsuario: form.usoPorUsuario ? parseInt(form.usoPorUsuario) : null,
        atualizadoEm: serverTimestamp(),
      };

      if (id) {
        await updateDoc(doc(db, 'cupons', id), dados);
        setMensagem('✅ Cupom atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'cupons'), {
          ...dados,
          criadoEm: serverTimestamp(),
          usos: 0, // contador de usos (opcional – útil para relatórios)
        });
        setMensagem('✅ Cupom cadastrado com sucesso!');
        setForm(DEFAULT_FORM);
      }

      // Volta para a lista após breve feedback
      setTimeout(() => navigate('/admin/cupons'), 1200);
    } catch (err) {
      console.error(err);
      setErro('❌ Erro ao salvar cupom.');
    } finally {
      setCarregando(false);
    }
  };

  const labelValor = form.tipo === 'percentual' ? 'Percentual de desconto' : 'Valor do desconto (R$)';

  return (
    <Container className="my-4">
      <h2>{id ? '✏️ Editar Cupom' : '🏷️ Novo Cupom'}</h2>

      {erro && <Alert variant="danger" className="mt-3">{erro}</Alert>}
      {mensagem && <Alert variant="success" className="mt-3">{mensagem}</Alert>}

      <Form onSubmit={handleSubmit} className="mt-3">
        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Código do Cupom</Form.Label>
            <Form.Control
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              placeholder="EX.: FRETEGRATIS, BEMVINDO10"
              required
            />
          </Col>
          <Col md={3}>
            <Form.Label>Tipo</Form.Label>
            <Form.Select name="tipo" value={form.tipo} onChange={handleChange}>
              <option value="percentual">Percentual (%)</option>
              <option value="valor_fixo">Valor Fixo (R$)</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label>{labelValor}</Form.Label>
            <InputGroup>
              {form.tipo === 'valor_fixo' && <InputGroup.Text>R$</InputGroup.Text>}
              <Form.Control
                type="number"
                step="0.01"
                name="valor"
                value={form.valor}
                onChange={handleChange}
                required
              />
              {form.tipo === 'percentual' && <InputGroup.Text>%</InputGroup.Text>}
            </InputGroup>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={3}>
            <Form.Label>Validade (opcional)</Form.Label>
            <Form.Control
              type="date"
              name="validade"
              value={form.validade}
              onChange={handleChange}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Mínimo do Pedido (opcional)</Form.Label>
            <InputGroup>
              <InputGroup.Text>R$</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                name="minimoPedido"
                value={form.minimoPedido}
                onChange={handleChange}
                placeholder="Ex.: 100.00"
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Label>Limite de uso total (opcional)</Form.Label>
            <Form.Control
              type="number"
              name="limiteUsoTotal"
              value={form.limiteUsoTotal}
              onChange={handleChange}
              placeholder="Ex.: 100"
            />
          </Col>
          <Col md={3}>
            <Form.Label>Uso por usuário (opcional)</Form.Label>
            <Form.Control
              type="number"
              name="usoPorUsuario"
              value={form.usoPorUsuario}
              onChange={handleChange}
              placeholder="Ex.: 1"
            />
          </Col>
        </Row>

        <Form.Check
          type="checkbox"
          label="Cupom Ativo"
          name="ativo"
          checked={form.ativo}
          onChange={handleChange}
          className="mb-3"
        />

        <Button type="submit" disabled={carregando}>
          {carregando ? 'Salvando...' : 'Salvar Cupom'}
        </Button>
        <Button
          variant="secondary"
          className="ms-2"
          onClick={() => navigate('/admin/cupons')}
          disabled={carregando}
        >
          Voltar
        </Button>
      </Form>
    </Container>
  );
}
