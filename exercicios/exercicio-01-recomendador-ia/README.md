# Exercício 01 — IA Chess Store / Recomendador IA

Aplicação React acadêmica que simula uma loja fictícia de xadrez e recomenda produtos com uma rede neural treinada no navegador usando o pacote oficial **@tensorflow/tfjs**.

## Conceitos praticados

- Usuários mockados com idade e histórico fictício de compras.
- Produtos mockados com categoria, cor, preço e idade indicada.
- Normalização de idade e preço para reduzir diferenças de escala.
- One-hot encoding para representar categoria e cor.
- Composição de `userVector + productVector` para formar as features de treinamento.
- Rede neural binária que aprende pares usuário-produto com label `1` para compra simulada e `0` para não compra.
- Execução local no navegador, sem backend produtivo.

## Como executar

```bash
npm install
npm start
npm test -- --watchAll=false
npm run build
```

## Observações

A dependência de IA é o pacote oficial `@tensorflow/tfjs` declarado no `package.json`; não há vendor local ou shim acadêmico.

Todos os dados são fictícios. Não há Firebase real, Mercado Pago, checkout produtivo, credenciais, tokens ou `.env`.
