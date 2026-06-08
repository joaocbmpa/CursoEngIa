// src/pages/ProdutosCategoria.js
import React, { useEffect, useState } from "react";
import { getProdutosPorCategoria } from "../services/firestoreService";

export default function ProdutosCategoria({ categoria }) {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    getProdutosPorCategoria(categoria).then(setProdutos);
  }, [categoria]);

  return (
    <div>
      <h2>Produtos da categoria: {categoria}</h2>
      <ul>
        {produtos.map((produto) => (
          <li key={produto.id}>
            <h3>{produto.nome}</h3>
            <p>{produto.descricao}</p>
            <p>R${produto.preco}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
