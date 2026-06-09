import { render, screen } from '@testing-library/react';

jest.mock('./services/recomendadorIAService', () => ({
  usuarioTesteRecomendacao: {
    id: 'user-teste-sem-compras',
    nome: 'Visitante acadêmico',
    idade: 13,
    purchases: [],
    compras: [],
  },
  gerarRankingRecomendacoes: jest.fn(() => Promise.resolve({
    ranking: [
      {
        id: 'tabuleiro-escolar-ia',
        nome: 'Tabuleiro Escolar IA',
        descricao: 'Produto fictício recomendado pela IA.',
        categoria: 'tabuleiro',
        cor: 'azul',
        preco: 129.9,
        score: 0.91,
      },
    ],
  })),
  criarContexto: jest.fn(() => ({
    minAge: 9,
    maxAge: 41,
    minPrice: 29.9,
    maxPrice: 249.9,
    categorias: ['tabuleiro'],
    cores: ['azul'],
  })),
}));

import App from './App';

test('renders IA Chess Store academic navigation', async () => {
  render(<App />);
  expect((await screen.findAllByText(/IA Chess Store/i))[0]).toBeInTheDocument();
  expect(screen.getAllByText(/Recomendador IA/i)[0]).toBeInTheDocument();
  expect(screen.getAllByText(/Sobre o Exercício/i)[0]).toBeInTheDocument();
});
