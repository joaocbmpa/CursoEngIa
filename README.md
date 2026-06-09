# IA Chess Store — Recomendação com TensorFlow.js

A **IA Chess Store** é uma loja fictícia acadêmica criada exclusivamente para o exercício do **Módulo 01 da formação Engenharia de Software com IA Aplicada**.

> Segurança: este projeto não usa dados reais, loja real, Firebase real, gateway de pagamento real, URLs produtivas, `.env`, tokens, chaves ou credenciais. Todos os produtos, usuários e históricos de compra são fictícios.

## Objetivo do exercício

Demonstrar uma aplicação React que treina, no navegador, uma rede neural simples de recomendação de produtos usando `@tensorflow/tfjs`.

A experiência principal contém apenas:

- **Início** — vitrine fictícia com top 3 produtos recomendados pela IA.
- **Recomendador IA** — página didática com features, treinamento, métricas e ranking completo.
- **Sobre o Exercício** — explicação acadêmica do módulo, dos dados mockados e da diferença entre regra manual e aprendizado por comportamento.

## Tecnologias usadas

- React e Create React App.
- React Router.
- React Bootstrap.
- TensorFlow.js (`@tensorflow/tfjs`).
- Dados mockados em arquivos locais.

## Como a rede neural recomenda

O ranking não usa uma fórmula manual de afinidade. Ele é gerado por comportamento mockado de compra:

1. `src/data/produtosMock.js` define produtos fictícios de xadrez com `id`, `nome`, `descricao`, `categoria`, `cor`, `preco`, `idadeIndicada` e `destaque` opcional.
2. `src/data/usuariosMock.js` define usuários fictícios com `id`, `nome`, `idade` e histórico `purchases`/`compras` referenciando produtos existentes.
3. `src/services/recomendadorIAService.js` cria o contexto com:
   - `minAge` e `maxAge`;
   - `minPrice` e `maxPrice`;
   - categorias e cores;
   - índices de categoria/cor;
   - média de idade dos compradores por produto.
4. Produtos são codificados com preço normalizado ponderado, idade média normalizada e one-hot encoding ponderado para categoria e cor.
5. Usuários são codificados pela média dos vetores dos produtos comprados; usuários sem compras usam idade normalizada e zeros nos demais campos.
6. O treino combina pares `[userVector + productVector]`.
7. O label é `1` quando o usuário comprou o produto e `0` quando não comprou.

Arquitetura usada:

- Dense 128 `relu`;
- Dense 64 `relu`;
- Dense 32 `relu`;
- Dense 1 `sigmoid`;
- `adam(0.01)`;
- `binaryCrossentropy`;
- métrica `accuracy`;
- 100 épocas;
- batch size 32.

## Como rodar

```bash
npm install
npm start
```

Acesse:

```txt
http://localhost:3000
http://localhost:3000/recomendador-ia
```

## Testes e build

```bash
npm test -- --watchAll=false
npm run build
```

## Estrutura principal

```txt
src/data/produtosMock.js          # produtos fictícios de xadrez
src/data/usuariosMock.js          # usuários fictícios e compras mockadas
src/services/recomendadorIAService.js # treinamento e ranking com TensorFlow.js
src/pages/Home.js                 # vitrine fictícia com top 3 recomendado
src/pages/RecomendadorIA.js       # explicação e ranking completo
src/pages/Sobre.js                # contexto acadêmico do exercício
```

## Prints sugeridos

Para documentação do exercício, capture:

1. Home com o hero “Loja fictícia com recomendação por Inteligência Artificial”.
2. Top 3 produtos recomendados na Home.
3. Página `/recomendador-ia` exibindo loss, accuracy e ranking.
4. Página “Sobre o Exercício” com o aviso de dados fictícios.

## Aviso de segurança

- Não adicionar `.env`, `.env.local`, `.env.production` ou credenciais.
- Não adicionar chaves reais de Firebase, gateways de pagamento ou APIs externas.
- Não usar dados reais de clientes, lojas, telefones, e-mails, pedidos ou endereços.
- Manter integrações produtivas desativadas ou substituídas por dados fictícios.
