// src/pages/FaleConosco.js
import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

export default function FaleConosco() {
  return (
    <Container className="my-5">
      <h2 className="mb-4 text-center">📞 Fale Conosco</h2>

      <Row className="mb-4">
        <Col md={6}>
          <h5>Informações de Contato</h5>
          <p>📱 WhatsApp: (91) 98326-1572</p>
          <p>📧 E-mail: joaoluizcbmpa@gmail.com</p>
        </Col>

        <Col md={6}>
          <h5>Envie uma Mensagem</h5>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control type="text" placeholder="Seu nome" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>E-mail</Form.Label>
              <Form.Control type="email" placeholder="Seu e-mail" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mensagem</Form.Label>
              <Form.Control as="textarea" rows={4} placeholder="Digite sua mensagem..." />
            </Form.Group>

            <Button variant="primary" disabled>
              Enviar (em breve)
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
