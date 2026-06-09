# CursoEngIa — Projeto Acadêmico de IA Aplicada

Este repositório foi preparado para o exercício acadêmico do **Módulo 01 da formação Engenharia de Software com IA Aplicada**.

> **Importante:** este projeto usa dados fictícios e mockados. Ele não representa uma loja real, não realiza pagamentos reais e não deve receber chaves, tokens, credenciais, URLs produtivas ou dados privados.

## Objetivo do exercício

Demonstrar, em uma aplicação React, como preparar uma versão segura de um projeto para fins acadêmicos e como implementar um recomendador simples de produtos executado no navegador.

A nova página principal do exercício está disponível em:

```txt
/recomendador-ia
```

## O que foi sanitizado

- Nome e textos institucionais foram substituídos por uma marca fictícia: **Loja Acadêmica IA**.
- Configuração do Firebase foi convertida para valores demonstrativos e não produtivos.
- URLs de Cloud Functions foram trocadas por endpoints mockados em `example.invalid`.
- Contatos, redes sociais, telefone, e-mails e textos comerciais reais foram substituídos por dados fictícios.
- Referências a pagamento real foram removidas ou descritas como fluxo simulado.

## Recomendador com TensorFlow.js

A página `/recomendador-ia` implementa um exemplo simples com `@tensorflow/tfjs`:

1. Usa listas locais de produtos e usuários mockados.
2. Cada usuário fictício possui idade e histórico de compras que referencia produtos existentes.
3. O modelo aprende por pares usuário-produto: label `1` quando o usuário comprou o produto e label `0` quando não comprou.
4. O vetor de produto inclui preço normalizado, média de idade dos compradores normalizada, categoria com one-hot encoding ponderado e cor com one-hot encoding ponderado.
5. O vetor de usuário é a média dos vetores dos produtos comprados; para o usuário teste sem compras, usa idade normalizada e zeros nos demais campos.
6. Treina no navegador uma rede densa com saída sigmoid, `binaryCrossentropy`, `adam(0.01)`, 100 épocas e batch size 32.
7. Exibe loss, accuracy final e ranking de produtos recomendados para um usuário teste fictício sem compras.

O ranking não é gerado por uma fórmula manual de afinidade. A pontuação vem da predição do modelo treinado com o histórico mockado de compras.

## Dados fictícios

Os produtos do exercício ficam em `src/data/produtosMock.js` e os usuários em `src/data/usuariosMock.js`. Esses dados foram criados apenas para simulação didática e não correspondem a estoque, preços, vendas, clientes ou compras reais.

## Como executar

Instale as dependências e rode o projeto em ambiente local:

```bash
npm install
npm start
```

Depois acesse:

```txt
http://localhost:3000/recomendador-ia
```

## Scripts disponíveis

### `npm start`

Inicia a aplicação em modo de desenvolvimento.

### `npm test`

Executa os testes com Create React App.

### `npm run build`

Gera o build de produção local. Para este exercício, revise sempre se não há dados sensíveis antes de publicar qualquer artefato.

## Boas práticas de segurança para o exercício

- Não versionar `.env`, `.env.local`, `.env.production` ou credenciais.
- Não adicionar chaves reais de Firebase, gateways de pagamento ou APIs externas.
- Não usar dados reais de clientes, telefones, e-mails, pedidos ou endereços.
- Manter integrações produtivas desativadas ou substituídas por mocks.
