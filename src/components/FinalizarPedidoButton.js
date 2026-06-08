// src/components/FinalizarPedidoButton.js
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import FormularioPedidoModal from './FormularioPedidoModal';

export default function FinalizarPedidoButton({ carrinho }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant="success"
        onClick={() => setShowModal(true)}
        className="fw-semibold"
      >
        Finalizar Pedido
      </Button>

      <FormularioPedidoModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        carrinho={carrinho}
      />
    </>
  );
}
