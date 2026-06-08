import React, { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CarrinhoContext } from "../context/CarrinhoContext";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

// ------- utilidades de máscara/validação -------
const onlyDigits = (v = "") => String(v).replace(/\D+/g, "");

const formatPhoneBR = (v = "") => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const formatCEP = (v = "") => {
  const d = onlyDigits(v).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
};

const isEmail = (v = "") => /^\S+@\S+\.\S+$/.test(v.trim());
const isCEP = (v = "") => onlyDigits(v).length === 8;
const isPhone = (v = "") => {
  const d = onlyDigits(v);
  return d.length === 10 || d.length === 11; // fixo ou celular
};
const isUF = (v = "") => /^[A-Z]{2}$/.test(v.trim().toUpperCase());

// Persistência simples do cupom (URL -> localStorage)
function useCupomPersistente() {
  const location = useLocation();
  const [cupom, setCupom] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromUrl = params.get("cupom");
    if (fromUrl) {
      const codigo = String(fromUrl).trim().toUpperCase();
      localStorage.setItem("cupom_afiliado", codigo);
      setCupom(codigo);
    } else {
      const stored = localStorage.getItem("cupom_afiliado");
      setCupom(stored || null);
    }
  }, [location.search]);

  return cupom;
}

// ------- componente -------
const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { carrinho, limparCarrinho } = useContext(CarrinhoContext);
  const { usuario } = useContext(AuthContext);

  const cupomCodigo = useCupomPersistente();

  const [loading, setLoading] = useState(false);
  const [erroVisivel, setErroVisivel] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    observacao: "",
  });

  // Prefill quando logado
  useEffect(() => {
    if (usuario) {
      setFormData((prev) => ({
        ...prev,
        nome: usuario.displayName || prev.nome,
        email: usuario.email || prev.email,
      }));
    }
  }, [usuario]);

  // Protege acesso com carrinho vazio
  useEffect(() => {
    if (!carrinho || carrinho.length === 0) {
      setErroVisivel("Seu carrinho está vazio. Adicione produtos para continuar.");
      toast.warn("Seu carrinho está vazio.");
      const t = setTimeout(() => navigate("/produtos"), 1200);
      return () => clearTimeout(t);
    }
  }, [carrinho, navigate]);

  const handleChange = (e) => {
    setErroVisivel("");
    const { name, value } = e.target;

    if (name === "telefone") {
      return setFormData((p) => ({ ...p, telefone: formatPhoneBR(value) }));
    }
    if (name === "cep") {
      return setFormData((p) => ({ ...p, cep: formatCEP(value) }));
    }
    if (name === "uf") {
      return setFormData((p) => ({ ...p, uf: value.toUpperCase().slice(0, 2) }));
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const somenteLeitura = !!usuario; // trava nome/email quando logado

  // Endereço composto para enviar ao backend
  const enderecoComposto = useMemo(() => {
    const { rua, numero, complemento, bairro, cidade, uf, cep } = formData;
    const comp = complemento?.trim() ? `, ${complemento.trim()}` : "";
    const cepDigits = onlyDigits(cep);
    return `${rua}, ${numero}${comp} - ${bairro} - ${cidade}/${uf} - CEP ${cepDigits}`;
  }, [formData]);

  const validar = () => {
    const faltando = [];
    if (!formData.nome.trim()) faltando.push("Nome");
    if (!formData.email.trim() || !isEmail(formData.email)) faltando.push("E-mail válido");
    if (!isPhone(formData.telefone)) faltando.push("Telefone/WhatsApp");
    if (!isCEP(formData.cep)) faltando.push("CEP");
    if (!formData.rua.trim()) faltando.push("Rua");
    if (!formData.numero.trim()) faltando.push("Número");
    if (!formData.bairro.trim()) faltando.push("Bairro");
    if (!formData.cidade.trim()) faltando.push("Cidade");
    if (!isUF(formData.uf)) faltando.push("UF");

    if (faltando.length) {
      const msg = `Preencha corretamente: ${faltando.join(", ")}.`;
      setErroVisivel(msg);
      toast.error(msg);
      return false;
    }
    if (!carrinho || carrinho.length === 0) {
      setErroVisivel("Seu carrinho está vazio.");
      toast.error("Seu carrinho está vazio.");
      return false;
    }
    return true;
  };

  const handleFinalizar = async () => {
    if (loading) return;
    if (!validar()) return;

    try {
      setLoading(true);

      const pedido = {
        // comprador
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim(),
        uid: usuario?.uid || null,
        usuarioId: usuario?.uid || null,
        isGuest: !usuario,

        // endereço “flat” para o MP e detalhado para nossos registros
        endereco: enderecoComposto,
        enderecoDetalhado: {
          cep: onlyDigits(formData.cep),
          rua: formData.rua.trim(),
          numero: formData.numero.trim(),
          complemento: formData.complemento.trim() || null,
          bairro: formData.bairro.trim(),
          cidade: formData.cidade.trim(),
          uf: formData.uf.trim().toUpperCase(),
        },

        observacao: formData.observacao || "",
        itens: carrinho.map((item) => ({
          nome: item.nome,
          preco: item.preco,
          quantidade: item.quantidade,
          produtoId: item.id,
          variacao: item.variacao || null,
        })),
        total: carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0),
        frete: "0.00",
        prazoEntrega: "Frete Grátis",
        origem: "web",

        // 🔗 cupom para mapeamento do influencer no backend
        cupomCodigo: cupomCodigo || null,
      };

      const FN_URL =
        "https://us-central1-xadrezjl-828b4.cloudfunctions.net/criarPreferencia";

      const { data } = await axios.post(FN_URL, pedido);

      toast.success("Redirecionando para o pagamento...");
      limparCarrinho();
      window.location.href = data.url;
    } catch (erro) {
      console.error("Erro no checkout:", erro);
      setErroVisivel("Erro ao processar o pagamento. Tente novamente em instantes.");
      toast.error("Erro ao processar o pagamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2>Finalizar Pedido</h2>

      {cupomCodigo && (
        <div className="alert alert-info mt-3" role="alert">
          Cupom aplicado: <strong>{cupomCodigo}</strong>
        </div>
      )}

      {erroVisivel && (
        <div className="alert alert-warning mt-3" role="alert">
          {erroVisivel}
        </div>
      )}

      {/* Dados do comprador */}
      <div className="row mt-3">
        <div className="col-md-6">
          <label className="form-label">Nome *</label>
          <input
            type="text"
            className="form-control"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            readOnly={somenteLeitura}
            placeholder="Seu nome completo"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">E-mail *</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
            readOnly={somenteLeitura}
            placeholder="seuemail@exemplo.com"
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-6">
          <label className="form-label">Telefone / WhatsApp *</label>
          <input
            type="text"
            className="form-control"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(99) 99999-9999"
            inputMode="numeric"
          />
        </div>
      </div>

      {/* Endereço */}
      <h5 className="mt-4">Endereço de Entrega</h5>
      <div className="row mt-2">
        <div className="col-md-3">
          <label className="form-label">CEP *</label>
          <input
            type="text"
            className="form-control"
            name="cep"
            value={formData.cep}
            onChange={handleChange}
            placeholder="00000-000"
            inputMode="numeric"
          />
        </div>
        <div className="col-md-7">
          <label className="form-label">Rua *</label>
          <input
            type="text"
            className="form-control"
            name="rua"
            value={formData.rua}
            onChange={handleChange}
            placeholder="Logradouro"
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Número *</label>
          <input
            type="text"
            className="form-control"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            placeholder="Nº"
          />
        </div>
      </div>

      <div className="row mt-2">
        <div className="col-md-4">
          <label className="form-label">Complemento</label>
          <input
            type="text"
            className="form-control"
            name="complemento"
            value={formData.complemento}
            onChange={handleChange}
            placeholder="Apto, bloco, referência..."
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Bairro *</label>
          <input
            type="text"
            className="form-control"
            name="bairro"
            value={formData.bairro}
            onChange={handleChange}
            placeholder="Bairro"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Cidade *</label>
          <input
            type="text"
            className="form-control"
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            placeholder="Cidade"
          />
        </div>
        <div className="col-md-1">
          <label className="form-label">UF *</label>
          <input
            type="text"
            className="form-control text-uppercase"
            name="uf"
            value={formData.uf}
            onChange={handleChange}
            placeholder="PA"
            maxLength={2}
          />
        </div>
      </div>

      <div className="form-group mt-3">
        <label>Observação (opcional)</label>
        <textarea
          className="form-control"
          name="observacao"
          value={formData.observacao}
          onChange={handleChange}
          placeholder="Ex.: deixar na portaria, chamar no interfone, etc."
        />
      </div>

      <div className="alert alert-success mt-3">
        🚚 Entrega gratuita. O valor final já inclui o custo de envio.
      </div>

      <button
        type="button"
        className="btn btn-success mt-4"
        onClick={handleFinalizar}
        disabled={loading || (carrinho?.length ?? 0) === 0}
      >
        {loading ? "Gerando pagamento..." : "Ir para o pagamento"}
      </button>
    </div>
  );
};

export default Checkout;
