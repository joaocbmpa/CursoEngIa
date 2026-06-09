// src/pages/Sobre.js
import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import logoAcademico from '../logo.svg';

export default function Sobre() {
  return (
    <Container className="my-5">
      <Row className="align-items-center">
        <Col md={6} className="mb-4 mb-md-0 text-center">
          <Image src={logoAcademico} alt="Logo acadêmico" fluid style={{ maxWidth: '280px' }} />
        </Col>
        <Col md={6}>
          <h2 className="mb-4 text-center text-md-start">🧠 Sobre a Loja Acadêmica IA</h2>
          <p>
            A <strong>Loja Acadêmica IA</strong> é uma vitrine fictícia criada para estudar
            engenharia de software com IA aplicada. Nosso objetivo é demonstrar dados mockados,
            componentes React e uma experiência segura para exercícios acadêmicos.
          </p>
          <p>
            Combinamos tradição e tecnologia para entregar não apenas materiais, mas uma verdadeira
            experiência de aprendizado sobre recomendação, dados e interfaces web.
          </p>
          <p>
            Nenhuma compra, pagamento ou integração produtiva é realizada neste ambiente.
          </p>
        </Col>
      </Row>
    </Container>
  );
}
