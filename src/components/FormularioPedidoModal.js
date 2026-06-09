// src/components/FormularioPedidoModal.js
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function FormularioPedidoModal({ show, onHide, itensCarrinho }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [observacao, setObservacao] = useState('');
  const [enviando, setEnviando] = useState(false);

  const total = itensCarrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      await addDoc(collection(db, 'pedidos'), {
        nome,
        email,
        endereco,
        observacao,
        itens: itensCarrinho,
        total,
        criadoEm: Timestamp.now()
      });
      window.alert('Checkout fictício para o exercício acadêmico. Nenhum pagamento real será iniciado.');
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      alert('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Finalizar Pedido</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Endereço de Entrega</Form.Label>
            <Form.Control
              type="text"
              required
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Observação</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </Form.Group>

          <h5>Total: R$ {total.toFixed(2)}</h5>

          <div className="text-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancelar
            </Button>
            <Button type="submit" variant="success" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Ir para Pagamento'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
