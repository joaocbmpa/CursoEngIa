import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GAME_AI_EVENTS } from '../gameAI/events';
import { avaliarDisparo } from '../gameAI/gameAIEngine';

const ARENA = { width: 720, height: 420 };
const INITIAL_TARGET = { x: 120, y: 120, vx: 3.2, vy: 2.4, radius: 24 };
const INITIAL_AIM = { x: 80, y: 80 };

function moverAlvo(target) {
  let { x, y, vx, vy, radius } = target;
  x += vx;
  y += vy;
  if (x < radius || x > ARENA.width - radius) vx *= -1;
  if (y < radius || y > ARENA.height - radius) vy *= -1;
  return { ...target, x: Math.max(radius, Math.min(ARENA.width - radius, x)), y: Math.max(radius, Math.min(ARENA.height - radius, y)), vx, vy };
}

export default function GameAI() {
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState('manual');
  const [target, setTarget] = useState(INITIAL_TARGET);
  const [aim, setAim] = useState(INITIAL_AIM);
  const [score, setScore] = useState({ hits: 0, misses: 0 });
  const [lastDecision, setLastDecision] = useState('Aguardando início da simulação.');
  const workerRef = useRef(null);

  const accuracy = useMemo(() => {
    const total = score.hits + score.misses;
    return total ? Math.round((score.hits / total) * 100) : 0;
  }, [score]);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../gameAI/gameAI.worker.js', import.meta.url));
    workerRef.current.onmessage = (event) => {
      if (event.data?.type !== GAME_AI_EVENTS.DECISION) return;
      const decision = event.data.payload;
      setAim(decision.aim);
      setScore((current) => ({
        hits: current.hits + (decision.hit ? 1 : 0),
        misses: current.misses + (decision.hit ? 0 : 1),
      }));
      setLastDecision(`IA mirou em (${decision.aim.x}, ${decision.aim.y}), distância ${decision.distance}px: ${decision.explanation}.`);
    };
    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => {
      setTarget((current) => {
        const next = moverAlvo(current);
        if (mode === 'ia') {
          workerRef.current?.postMessage({ type: GAME_AI_EVENTS.OBSERVE, payload: { target: next, arena: ARENA } });
        }
        return next;
      });
    }, 180);
    return () => clearInterval(timer);
  }, [running, mode]);

  const handleArenaClick = (event) => {
    if (mode !== 'manual' || !running) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nextAim = {
      x: Math.round(((event.clientX - rect.left) / rect.width) * ARENA.width),
      y: Math.round(((event.clientY - rect.top) / rect.height) * ARENA.height),
    };
    const result = avaliarDisparo(target, nextAim, target.radius);
    setAim(nextAim);
    setScore((current) => ({ hits: current.hits + (result.hit ? 1 : 0), misses: current.misses + (result.hit ? 0 : 1) }));
    setLastDecision(`Jogador mirou em (${nextAim.x}, ${nextAim.y}), distância ${result.distance}px.`);
  };

  const reset = () => {
    setRunning(false);
    setTarget(INITIAL_TARGET);
    setAim(INITIAL_AIM);
    setScore({ hits: 0, misses: 0 });
    setLastDecision('Simulação reiniciada.');
  };

  return (
    <main className="game-ai-page">
      <section className="game-ai-hero">
        <p className="eyebrow">Exercício 02 • Game AI</p>
        <h1>Web Machine Learning - Como Vencer Qualquer Jogo</h1>
        <p>Mini game didático com alvo móvel, modo manual e agente IA simulado em Web Worker.</p>
      </section>

      <section className="game-ai-layout">
        <div className="arena-card">
          <div className="arena" role="application" aria-label="Arena do mini game" onClick={handleArenaClick}>
            <div className="target" style={{ left: `${(target.x / ARENA.width) * 100}%`, top: `${(target.y / ARENA.height) * 100}%` }} />
            <div className="aim" style={{ left: `${(aim.x / ARENA.width) * 100}%`, top: `${(aim.y / ARENA.height) * 100}%` }} />
          </div>
        </div>

        <aside className="panel">
          <div className="controls">
            <button onClick={() => setRunning(true)}>Iniciar</button>
            <button onClick={() => setRunning(false)}>Pausar</button>
            <button onClick={reset}>Resetar</button>
          </div>
          <label>Modo</label>
          <select value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="manual">Manual</option>
            <option value="ia">IA</option>
          </select>
          <div className="stats"><strong>Acertos:</strong> {score.hits}</div>
          <div className="stats"><strong>Erros:</strong> {score.misses}</div>
          <div className="stats"><strong>Precisão:</strong> {accuracy}%</div>
          <hr />
          <h2>Painel de coordenadas</h2>
          <p>Alvo: x={Math.round(target.x)} y={Math.round(target.y)} vx={target.vx.toFixed(1)} vy={target.vy.toFixed(1)}</p>
          <p>Mira: x={aim.x} y={aim.y}</p>
          <p>Status: {running ? 'executando' : 'pausado'} • modo {mode.toUpperCase()}</p>
          <p className="decision">{lastDecision}</p>
        </aside>
      </section>
    </main>
  );
}
