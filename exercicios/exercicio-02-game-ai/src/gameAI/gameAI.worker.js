import { GAME_AI_EVENTS } from './events';
import { decidirAcao } from './gameAIEngine';

self.onmessage = (event) => {
  if (event.data?.type !== GAME_AI_EVENTS.OBSERVE) return;
  const decision = decidirAcao(event.data.payload);
  self.postMessage({ type: GAME_AI_EVENTS.DECISION, payload: decision });
};
