import React, { createContext, useContext, useEffect, useState } from "react";

export const CarrinhoContext = createContext();

const STORAGE_KEY = "carrinho_xadrezjl";

export const CarrinhoProvider = ({ children }) => {
  const [carrinho, setCarrinho] = useState([]);

  // carrega do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCarrinho(JSON.parse(raw));
    } catch {}
  }, []);

  // salva no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(carrinho));
    } catch {}
  }, [carrinho]);

  const adicionarAoCarrinho = (produto, variacao = "", quantidade = 1) => {
    const qnt = Number(quantidade) || 1;
    setCarrinho((prev) => {
      const idx = prev.findIndex(
        (item) => item.id === produto.id && item.variacao === variacao
      );
      if (idx >= 0) {
        const novo = [...prev];
        novo[idx] = { ...novo[idx], quantidade: (Number(novo[idx].quantidade) || 0) + qnt };
        return novo;
      }
      return [...prev, { ...produto, variacao, quantidade: qnt }];
    });
  };

  const removerDoCarrinho = (produtoId, variacao = "") => {
    setCarrinho((prev) =>
      prev.filter((item) => !(item.id === produtoId && item.variacao === variacao))
    );
  };

  const limparCarrinho = () => setCarrinho([]);

  const calcularTotal = () =>
    carrinho.reduce(
      (total, item) =>
        total + (Number(item.preco) || 0) * (Number(item.quantidade) || 1),
      0
    );

  return (
    <CarrinhoContext.Provider
      value={{
        carrinho,
        adicionarAoCarrinho,
        removerDoCarrinho,
        limparCarrinho,
        calcularTotal,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
};

// Hooks práticos
export const useCarrinho = () => useContext(CarrinhoContext);
