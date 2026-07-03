# Exercício 02 — Game AI / Web Machine Learning

Aplicação React independente para o módulo **“Web Machine Learning - Como Vencer Qualquer Jogo”**. O exercício apresenta um mini game com alvo móvel, modo manual e modo IA.

## O que a aplicação demonstra

- Um agente visual observa o estado do jogo.
- A percepção inclui posição e velocidade do alvo.
- A decisão calcula a coordenada de mira.
- A ação dispara automaticamente no modo IA.
- Acertos e erros são registrados no placar.
- Um painel exibe coordenadas do alvo, mira e status.
- A inferência é simulada em um **Web Worker** para separar a thread principal da etapa de decisão.
- A comunicação usa `postMessage` entre a interface e o worker.

## Simulação didática vs. modelo real

Este exercício **não usa TensorFlow.js** porque o foco é demonstrar o ciclo de Web Machine Learning — estado, percepção, decisão e ação — sem depender de um modelo real de visão computacional. Em um jogo real, um modelo treinado poderia receber pixels, detectar objetos e retornar uma ação. Aqui, o worker recebe diretamente o estado estruturado do alvo e simula a inferência.

## Como executar

```bash
npm install
npm start
npm test -- --watchAll=false
npm run build
```
