// src/services/correiosService.js
import axios from "axios";

const URL_BASE_CORREIOS = "https://cors-anywhere.herokuapp.com/https://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx";

export async function calcularFrete({
  cepDestino,
  peso = 1,
  comprimento = 20,
  altura = 10,
  largura = 15,
  servico = "04510", // PAC por padrão
  cepOrigem = "66910-110" // Exemplo: CEP da Brasa da Ilha / Mosqueiro
}) {
  try {
    const params = {
      nCdEmpresa: "",
      sDsSenha: "",
      nCdServico: servico,
      sCepOrigem: cepOrigem.replace(/\D/g, ""),
      sCepDestino: cepDestino.replace(/\D/g, ""),
      nVlPeso: peso,
      nCdFormato: 1,
      nVlComprimento: comprimento,
      nVlAltura: altura,
      nVlLargura: largura,
      nVlDiametro: 0,
      sCdMaoPropria: "N",
      nVlValorDeclarado: 0,
      sCdAvisoRecebimento: "N",
      StrRetorno: "json"
    };

    const queryString = new URLSearchParams(params).toString();
    const url = `${URL_BASE_CORREIOS}?${queryString}`;

    const { data } = await axios.get(url);
    return data?.Servicos?.cServico?.[0];
  } catch (error) {
    console.error("Erro ao calcular frete:", error);
    throw new Error("Não foi possível calcular o frete no momento.");
  }
}
