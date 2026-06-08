// src/components/CheckoutForm.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Form, Button, Row, Col, Alert, Card, ListGroup } from "react-bootstrap";
import { db } from "../firebase/config";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { CarrinhoContext } from "../context/CarrinhoContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";

console.log("Checkout vGuest-OK"); // <- precisa aparecer no console!

const functions = getFunctions();
const criarPreferenciaFn = httpsCallable(functions, "criarPreferencia");

export default function CheckoutForm() {
  const { carrinho } = useContext(CarrinhoContext);
  const { usuario } = useContext(AuthContext); // login é OPCIONAL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    observacoes: "",
    cupom: "",
  });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const total = useMemo(
    () => carrinho.reduce((s, i) => s + (Number(i.preco)||0) * (Number(i.quantidade)||1), 0),
    [carrinho]
  );
  const apenasDigitais = useMemo(
    () => carrinho.length > 0 && carrinho.every((i) => i?.digital === true),
    [carrinho]
  );

  // Prefill (ajuda, mas não trava)
  useEffect(() => {
    if (usuario) {
      setFormData((f) => ({
        ...f,
        nome: f.nome || usuario.displayName || "",
        email: f.email || usuario.email || "",
      }));
    }
  }, [usuario]);

  useEffect(() => {
    if (carrinho.length === 0) navigate("/");
  }, [carrinho.length, navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||"").trim());

  const validar = () => {
    if (!formData.nome.trim()) return "Informe seu nome.";
    if (!validarEmail(formData.email)) return "Informe um e-mail válido.";
    if (!formData.telefone.trim()) return "Informe um telefone.";
    if (!apenasDigitais && !formData.endereco.trim()) return "Informe o endereço.";
    if (carrinho.length === 0) return "Seu carrinho está vazio.";
    return "";
  };

  const salvarPedido = async () => {
    const itens = carrinho.map((i) => ({
      produtoId: i.id || i.produtoId || null,
      nome: i.nome,
      quantidade: Number(i.quantidade) || 1,
      precoUnitario: Number(i.preco) || 0,
      subtotal: (Number(i.preco)||0) * (Number(i.quantidade)||1),
      digital: !!i.digital,
      arquivoUrl: i.arquivoUrl || null,
      variacao: i.variacao || null,
    }));

    const pedido = {
      uid: usuario?.uid || null, // convidado = null
      cliente: {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim(),
        endereco: apenasDigitais ? null : formData.endereco.trim(),
      },
      itens,
      total: Number(total.toFixed(2)),
      cupom: formData.cupom.trim() || "",
      observacoes: formData.observacoes.trim() || "",
      status: "pendente",
      isDigitalOnly: apenasDigitais,
      isGuest: !usuario,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
      external_reference: null,
    };

    const docRef = await addDoc(collection(db, "pedidos"), pedido);
    await setDoc(doc(db, "pedidos", docRef.id), {
      external_reference: docRef.id,
      atualizadoEm: serverTimestamp(),
    }, { merge: true });
    return docRef.id;
  };

  const irParaPagamento = async (pedidoId) => {
    const payload = {
      pedidoId,
      items: carrinho.map((i) => ({
        title: i.nome,
        quantity: Number(i.quantidade) || 1,
        unit_price: Number(i.preco) || 0,
        currency_id: "BRL",
      })),
      back_urls: {
        success: `${window.location.origin}/pedido/${pedidoId}?status=success`,
        failure: `${window.location.origin}/pedido/${pedidoId}?status=failure`,
        pending: `${window.location.origin}/pedido/${pedidoId}?status=pending`,
      },
      external_reference: pedidoId,
      shipping_cost: 0,
      payer: { name: formData.nome.trim(), email: formData.email.trim() },
      cupom: formData.cupom.trim() || "",
    };

    const res = await criarPreferenciaFn(payload);
    const initPoint = res?.data?.init_point || res?.data?.sandbox_init_point;
    if (!initPoint) throw new Error("Não foi possível gerar o link de pagamento.");
    window.location.href = initPoint;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    const msg = validar();
    if (msg) { setErro(msg); return; }
    try {
      setCarregando(true);
      const pedidoId = await salvarPedido();
      await irParaPagamento(pedidoId);
    } catch (err) {
      console.error(err);
      setErro(err.message || "Erro ao finalizar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: 760 }}>
      <div className="mb-2"><small className="text-muted">vGuest-OK</small></div>
      <h2 className="mb-3">Finalizar Pedido</h2>

      {erro && <Alert variant="danger">{erro}</Alert>}

      <Card className="mb-4">
        <Card.Header>Seu pedido</Card.Header>
        <ListGroup variant="flush">
          {carrinho.map((i) => (
            <ListGroup.Item key={`${i.id}-${i.variacao || "padrao"}`}>
              <div className="d-flex justify-content-between">
                <div>
                  <div className="fw-semibold">{i.nome}</div>
                  <small className="text-muted">
                    {(Number(i.quantidade)||1)} × R$ {(Number(i.preco)||0).toFixed(2)}
                    {i.digital ? " • Digital" : ""}{i.variacao ? ` • ${i.variacao}` : ""}
                  </small>
                </div>
                <div>R$ {((Number(i.preco)||0)*(Number(i.quantidade)||1)).toFixed(2)}</div>
              </div>
            </ListGroup.Item>
          ))}
          <ListGroup.Item className="d-flex justify-content-between">
            <span>Total</span><strong>R$ {Number(total).toFixed(2)}</strong>
          </ListGroup.Item>
        </ListGroup>
      </Card>

      <Form onSubmit={onSubmit}>
        <Card className="mb-4">
          <Card.Header>Seus dados</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    name="nome"
                    value={formData.nome}
                    onChange={onChange}
                    autoComplete="name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {!apenasDigitais && (
              <Row className="mt-3">
                <Col>
                  <Form.Group>
                    <Form.Label>Endereço *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="endereco"
                      value={formData.endereco}
                      onChange={onChange}
                      placeholder="Rua, número, bairro, cidade/UF, CEP"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            <Row className="mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Telefone</Form.Label>
                  <Form.Control
                    name="telefone"
                    value={formData.telefone}
                    onChange={onChange}
                    autoComplete="tel"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Cupom (opcional)</Form.Label>
                  <Form.Control
                    name="cupom"
                    value={formData.cupom}
                    onChange={onChange}
                    placeholder="EX.: XADREZ5"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col>
                <Form.Group>
                  <Form.Label>Observação (opcional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={onChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="success" className="mt-3">
              🚚 Entrega gratuita. O valor final já inclui o custo de envio.
            </Alert>
          </Card.Body>
        </Card>

        <Button variant="success" type="submit" disabled={carregando}>
          {carregando ? "Processando..." : "Ir para o pagamento"}
        </Button>
      </Form>
    </div>
  );
}
