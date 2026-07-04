# CursoEngIa

Repositório acadêmico da formação **Engenharia de Software com IA Aplicada**. O objetivo é organizar exercícios independentes, documentados e publicáveis, cada um demonstrando uma etapa prática de aplicações web com Inteligência Artificial.

## Estrutura

```text
CursoEngIa/
  README.md
  package.json
  package-lock.json
  .gitignore
  exercicios/
    exercicio-01-recomendador-ia/
    exercicio-02-game-ai/
```

## Exercícios

| Exercício | Tema | Status | Como rodar |
|---|---|---|---|
| 01 | IA Chess Store / Recomendador de produtos com TensorFlow.js | Implementado | `cd exercicios/exercicio-01-recomendador-ia && npm install && npm start` |
| 02 | Game AI / Web Machine Learning - Como Vencer Qualquer Jogo | Implementado | `cd exercicios/exercicio-02-game-ai && npm install && npm start` |

## Comandos úteis

```bash
npm run test:ex01
npm run build:ex01
npm run test:ex02
npm run build:ex02
```

Cada exercício também pode ser executado de forma isolada dentro da própria pasta com `npm install`, `npm start`, `npm test -- --watchAll=false` e `npm run build`.

## Segurança acadêmica

Este repositório não usa Firebase real, Mercado Pago, credenciais, tokens, arquivos `.env` ou dados reais. Os dados dos exercícios são mockados para fins didáticos.
