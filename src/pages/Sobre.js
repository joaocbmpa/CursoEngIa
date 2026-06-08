// src/pages/Sobre.js
import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import logoPreta from '../assets/1logo-xadrezjl.png'; // nova logo preta

export default function Sobre() {
  return (
    <Container className="my-5">
      <Row className="align-items-center">
        <Col md={6} className="mb-4 mb-md-0 text-center">
          <Image src={logoPreta} alt="Logo Xadrez JL" fluid style={{ maxWidth: '280px' }} />
        </Col>
        <Col md={6}>
          <h2 className="mb-4 text-center text-md-start">🧠 Sobre a Xadrez JL</h2>
          <p>
            A <strong>Xadrez JL</strong> nasceu da paixão pelo jogo de xadrez e o desejo de tornar
            o esporte mais acessível para todos. Nosso objetivo é oferecer produtos de qualidade, 
            conteúdos didáticos e um atendimento próximo e eficiente.
          </p>
          <p>
            Combinamos tradição e tecnologia para entregar não apenas materiais, mas uma verdadeira
            experiência de aprendizado e evolução no mundo do xadrez.
          </p>
          <p>
            Seja você iniciante ou jogador experiente, aqui é o seu lugar. Obrigado por fazer parte 
            da nossa comunidade!
          </p>
        </Col>
      </Row>
    </Container>
  );
}
