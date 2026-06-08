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

1. Usa uma lista local de produtos mockados.
2. Considera as features:
   - idade;
   - preço;
   - categoria;
   - cor.
3. Normaliza idade e preço com min-max scaling.
4. Aplica one-hot encoding para categoria e cor.
5. Treina um modelo pequeno no navegador.
6. Exibe um ranking de produtos recomendados para um usuário teste.

## Dados fictícios

Os produtos do exercício ficam em `src/data/produtosMock.js`. Eles foram criados apenas para simulação didática e não correspondem a estoque, preços, vendas ou clientes reais.

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
