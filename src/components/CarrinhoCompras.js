// src/components/CarrinhoCompras.jsx
import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function CarrinhoCompras({ show, handleClose, carrinho, onFinalizar, onRemoverItem }) {
  const navigate = useNavigate();

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + item.preco * item.quantidade, 0);
  };

  const finalizar = () => {
    // Se o pai passou um handler, usa. Senão, navega pro checkout.
    if (onFinalizar) onFinalizar();
    else {
      handleClose?.();
      navigate('/checkout');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Seu Carrinho</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {carrinho.length === 0 ? (
          <p>Seu carrinho está vazio.</p>
        ) : (
          <Table responsive>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Variação</th>
                <th>Quantidade</th>
                <th>Subtotal</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carrinho.map((item, index) => (
                <tr key={index}>
                  <td>{item.nome}</td>
                  <td>{item.variacao || '-'}</td>
                  <td>{item.quantidade}</td>
                  <td>R$ {(item.preco * item.quantidade).toFixed(2)}</td>
                  <td>
                    <Button size="sm" variant="danger" onClick={() => onRemoverItem?.(index)}>
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {carrinho.length > 0 && (
          <div className="text-end fw-bold mt-3">
            Total: R$ {calcularTotal().toFixed(2)}
            <div className="text-success small">🚚 Frete Grátis incluso</div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fechar
        </Button>
        {carrinho.length > 0 && (
          <Button variant="success" onClick={finalizar}>
            Finalizar Pedido
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
