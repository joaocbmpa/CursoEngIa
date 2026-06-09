import { render, screen } from '@testing-library/react';
import App from './App';

test('renders academic storefront navigation', async () => {
  render(<App />);
  expect((await screen.findAllByText(/Loja Acadêmica IA/i))[0]).toBeInTheDocument();
  expect(screen.getByText(/Recomendador IA/i)).toBeInTheDocument();
});
