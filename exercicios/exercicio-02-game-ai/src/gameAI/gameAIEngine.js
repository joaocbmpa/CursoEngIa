export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function calcularMira({ target, arena, reactionNoise = 10 }) {
  const leadX = target.vx * 6;
  const leadY = target.vy * 6;
  const offsetX = Math.sin(target.x / 32) * reactionNoise;
  const offsetY = Math.cos(target.y / 28) * reactionNoise;

  return {
    x: clamp(Math.round(target.x + leadX + offsetX), 0, arena.width),
    y: clamp(Math.round(target.y + leadY + offsetY), 0, arena.height),
  };
}

export function avaliarDisparo(target, aim, radius) {
  const distance = Math.hypot(target.x - aim.x, target.y - aim.y);
  return { hit: distance <= radius, distance: Math.round(distance) };
}

export function decidirAcao(gameState) {
  const aim = calcularMira(gameState);
  const result = avaliarDisparo(gameState.target, aim, gameState.target.radius);
  return {
    aim,
    fire: true,
    hit: result.hit,
    distance: result.distance,
    explanation: result.hit ? 'alvo dentro do raio de acerto' : 'mira fora do raio de acerto',
  };
}
