// src/components/Depoimentos.js
import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';

const depoimentos = [
  {
    nome: 'Carlos M.',
    texto: 'Adorei os produtos, entrega rápida e ótimo atendimento!'
  },
  {
    nome: 'Juliana P.',
    texto: 'Comprei um tabuleiro para meu filho e a qualidade é excelente.'
  },
  {
    nome: 'Rafael S.',
    texto: 'Site fácil de navegar e ótimos preços. Recomendo demais.'
  }
];

export default function Depoimentos() {
  return (
    <Container className="my-5">
      <h3 className="mb-4">🗣️ O que dizem nossos clientes</h3>
      <Row>
        {depoimentos.map((dep, idx) => (
          <Col md={4} key={idx} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Text>"{dep.texto}"</Card.Text>
                <Card.Subtitle className="text-muted mt-2">- {dep.nome}</Card.Subtitle>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
