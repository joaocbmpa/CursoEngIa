// src/pages/Sobre.js
import React from 'react';
import { Alert, Badge, Card, Col, Container, Row } from 'react-bootstrap';

export default function Sobre() {
  return (
    <Container className="py-5">
      <div className="recomendador-ia__hero mb-4">
        <Badge bg="info" text="dark" className="mb-3">Sobre o exercício</Badge>
        <h1>IA Chess Store: loja fictícia acadêmica</h1>
        <p>
          Este projeto foi refatorado exclusivamente para responder ao exercício do Módulo 01 da
          formação Engenharia de Software com IA Aplicada.
        </p>
      </div>

      <Alert variant="warning">
        Todos os dados são fictícios. Não há loja real, Firebase real, gateway de pagamento real,
        URLs produtivas, tokens, chaves ou dados privados neste fluxo acadêmico.
      </Alert>

      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Objetivo acadêmico</Card.Title>
              <p>
                Demonstrar como uma aplicação React pode treinar uma rede neural no navegador com
                TensorFlow.js e gerar recomendações de produtos a partir de histórico mockado de compras.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Regra manual vs aprendizado</Card.Title>
              <p>
                Em vez de usar uma fórmula fixa de afinidade, o modelo aprende por comportamento:
                pares usuário-produto recebem label 1 quando houve compra fictícia e 0 quando não houve.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Features</Card.Title>
              <p>
                A recomendação usa preço normalizado, média de idade dos compradores, categoria e cor
                com one-hot encoding para representar produtos e usuários.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Execução local</Card.Title>
              <p>
                O treinamento acontece localmente no navegador. Nenhuma API produtiva é chamada para
                gerar o ranking da IA Chess Store.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
