// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

window.scrollTo = jest.fn();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock('@tensorflow/tfjs', () => ({
  ready: jest.fn(() => Promise.resolve()),
  tensor2d: jest.fn(() => ({ shape: [1, 1], dispose: jest.fn() })),
  sequential: jest.fn(() => ({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn(() => Promise.resolve({ history: { loss: [0.01], accuracy: [0.95] } })),
    predict: jest.fn(() => ({ data: jest.fn(() => Promise.resolve([0.9])), dispose: jest.fn() })),
    dispose: jest.fn(),
  })),
  layers: { dense: jest.fn((config) => config) },
  train: { adam: jest.fn((learningRate) => ({ learningRate })) },
}), { virtual: true });
