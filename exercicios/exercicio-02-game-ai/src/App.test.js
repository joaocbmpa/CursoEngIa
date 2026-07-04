import { render, screen } from '@testing-library/react';
import GameAI from './pages/GameAI';

test('renderiza controles do Game AI', () => {
  render(<GameAI />);
  expect(screen.getByText(/Web Machine Learning/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /iniciar/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /pausar/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /resetar/i })).toBeInTheDocument();
});
