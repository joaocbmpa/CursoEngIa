// src/components/ModalCarrinho.js
import React, { useContext } from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';
import { CarrinhoContext } from '../context/CarrinhoContext';
import { Link } from 'react-router-dom';

export default function ModalCarrinho({ show, handleClose }) {
  const { carrinho, removerDoCarrinho, limparCarrinho } = useContext(CarrinhoContext);

  const total = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Seu Carrinho</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {carrinho.length === 0 ? (
          <p>Seu carrinho está vazio.</p>
        ) : (
          <ListGroup variant="flush">
            {carrinho.map((item, idx) => (
              <ListGroup.Item key={idx}>
                <div className="d-flex justify-content-between">
                  <div>
                    <strong>{item.nome}</strong> <br />
                    Variação: {item.variacao} <br />
                    Quantidade: {item.quantidade}
                  </div>
                  <div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removerDoCarrinho(item.id, item.variacao)}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className="me-auto fw-bold">Total: R$ {total.toFixed(2)}</div>
        <Button variant="secondary" onClick={limparCarrinho}>
          Limpar
        </Button>

        {/* ✅ Redirecionamento interno para /checkout */}
        <Button
          as={Link}
          to="/checkout"
          variant="success"
          onClick={handleClose}
        >
          Finalizar Pedido
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
