export async function ready() { return true; }
export function tensor2d(values) { return { values, shape: [values.length, values[0]?.length || 0], dispose() {} }; }
function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
export function sequential() {
  return {
    add() {}, compile() {}, dispose() {},
    async fit() { return { history: { loss: [0.08], accuracy: [0.95], acc: [0.95] } }; },
    predict(input) { const row = input.values[0] || []; const score = sigmoid(row.reduce((s,v,i)=>s+(Number(v)||0)*(i%2?0.18:0.22), -1)); return { async data(){ return [score]; }, dispose(){} }; }
  };
}
export const layers = { dense: (config) => config };
export const train = { adam: (learningRate) => ({ learningRate }) };
