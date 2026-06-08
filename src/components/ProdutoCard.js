import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/ProdutoCard.css';

export default function ProdutoCard({ produto, aoAdicionar }) {
  const imagemPrincipal = produto.imagens?.[0] || '/placeholder.jpg';
  const descricaoLimpa = produto.descricao?.replace(/<[^>]+>/g, '').slice(0, 70) || '';

  return (
    <Card className="produto-card card-hover shadow-sm border-0 rounded p-2 h-100">
      <Row className="g-2 align-items-center">
        <Col xs={4}>
          <Link to={`/produto/${produto.id}`}>
            <Card.Img
              src={imagemPrincipal}
              alt={produto.nome}
              className="img-fluid rounded"
              style={{ height: '100px', objectFit: 'cover' }}
            />
          </Link>
        </Col>
        <Col xs={8}>
          <Card.Body className="p-0">
            <Link to={`/produto/${produto.id}`} className="text-decoration-none text-dark">
              <Card.Title className="fs-6 mb-1">{produto.nome}</Card.Title>
              <Card.Text style={{ fontSize: '0.85rem', height: '40px', overflow: 'hidden' }}>
                {descricaoLimpa}...
              </Card.Text>
              <div className="fw-bold text-success">R$ {Number(produto.preco).toFixed(2)}</div>
              {!produto.digital && (
                <div className="text-muted small">🛵 Frete Grátis</div>
              )}
            </Link>
            <div className="mt-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => aoAdicionar(produto)}
              >
                Comprar
              </Button>
            </div>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
}