// src/components/Beneficios.js
import React from 'react';
import { Container, Card } from 'react-bootstrap';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Beneficios() {
  const beneficios = [
    {
      titulo: 'Frete Grátis',
      descricao: 'Entrega sem custo em todo o Brasil. Valor do frete já incluso no preço final.',
      icone: '📦'
    },
    {
      titulo: 'Envio Rápido',
      descricao: 'Postamos em até 24h úteis após a confirmação do pagamento.',
      icone: '🚚'
    },
    {
      titulo: 'Produtos de Qualidade',
      descricao: 'Selecionamos os melhores itens para quem ama xadrez.',
      icone: '♟️'
    },
    {
      titulo: 'Atendimento Ágil',
      descricao: 'Dúvidas? Nosso suporte é rápido e eficiente.',
      icone: '💬'
    },
    {
      titulo: 'Checkout Seguro',
      descricao: 'Fluxo demonstrativo sem transações reais ou dados sensíveis.',
      icone: '🔒'
    }
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 250,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 992, // tablets
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 576, // celulares
        settings: { slidesToShow: 1 }
      }
    ]
  };

  return (
    <Container className="my-5">
      <h2 className="mb-4 text-center">📦 Por que comprar com a gente?</h2>
      <Slider {...settings}>
        {beneficios.map((b, idx) => (
          <div key={idx} className="px-2">
            <Card className="text-center h-100 border-0 shadow-sm">
              <Card.Body>
                <div style={{ fontSize: '2rem' }}>{b.icone}</div>
                <Card.Title className="mt-2">{b.titulo}</Card.Title>
                <Card.Text>{b.descricao}</Card.Text>
              </Card.Body>
            </Card>
          </div>
        ))}
      </Slider>
    </Container>
  );
}
