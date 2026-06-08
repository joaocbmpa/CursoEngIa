// src/admin/Usuarios/CadastroUsuario.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import { db } from '../../firebase/config';
import { addDoc, collection, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';

export default function CadastroUsuario() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    role: 'cliente',
    ativo: true
  });

  const [mensagem, setMensagem] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const carregarUsuario = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'usuarios', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setForm(docSnap.data());
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      }
    };
    carregarUsuario();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem(null);

    try {
      if (id) {
        await updateDoc(doc(db, 'usuarios', id), {
          ...form,
          atualizadoEm: serverTimestamp()
        });
        setMensagem('✅ Usuário atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'usuarios'), {
          ...form,
          criadoEm: serverTimestamp()
        });
        setMensagem('✅ Usuário cadastrado com sucesso!');
      }
      setTimeout(() => navigate('/admin/usuarios'), 2000);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setMensagem('❌ Erro ao salvar usuário.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Container className="my-4">
      <h2>{id ? '✏️ Editar Usuário' : '👤 Novo Usuário'}</h2>
      {mensagem && <Alert variant="info">{mensagem}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control name="nome" value={form.nome} onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" type="email" value={form.email} onChange={handleChange} required />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Telefone</Form.Label>
              <Form.Control name="telefone" value={form.telefone} onChange={handleChange} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>CEP</Form.Label>
              <Form.Control name="cep" value={form.cep} onChange={handleChange} />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Endereço</Form.Label>
          <Form.Control name="endereco" value={form.endereco} onChange={handleChange} />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Cidade</Form.Label>
              <Form.Control name="cidade" value={form.cidade} onChange={handleChange} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Control name="estado" value={form.estado} onChange={handleChange} />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Papel (role)</Form.Label>
              <Form.Select name="role" value={form.role} onChange={handleChange}>
                <option value="cliente">Cliente</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6} className="d-flex align-items-center">
            <Form.Check
              type="checkbox"
              label="Usuário Ativo"
              name="ativo"
              checked={form.ativo}
              onChange={handleChange}
              className="mt-3"
            />
          </Col>
        </Row>

        <Button type="submit" variant="success" disabled={carregando}>
          {carregando ? 'Salvando...' : 'Salvar Usuário'}
        </Button>
      </Form>
    </Container>
  );
}
