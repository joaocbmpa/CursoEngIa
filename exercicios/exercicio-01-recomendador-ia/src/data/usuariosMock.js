const usuariosBase = [
  {
    id: 'user-ana-escolar',
    nome: 'Ana Escolar',
    idade: 9,
    purchases: ['tabuleiro-escolar-ia', 'kit-pecas-classicas', 'tabuleiro-magnetico-portatil'],
  },
  {
    id: 'user-bruno-iniciante',
    nome: 'Bruno Iniciante',
    idade: 12,
    purchases: ['ebook-estrategia-iniciantes', 'kit-pecas-classicas', 'planner-treino-enxadrista'],
  },
  {
    id: 'user-carla-professora',
    nome: 'Carla Professora',
    idade: 34,
    purchases: ['tabuleiro-escolar-ia', 'curso-taticas-essenciais', 'relogio-digital-xadrez'],
  },
  {
    id: 'user-diego-clube',
    nome: 'Diego Clube',
    idade: 28,
    purchases: ['relogio-digital-xadrez', 'mentoria-aberturas-ia', 'curso-taticas-essenciais'],
  },
  {
    id: 'user-elisa-tatica',
    nome: 'Elisa Tática',
    idade: 15,
    purchases: ['ebook-estrategia-iniciantes', 'curso-taticas-essenciais', 'tabuleiro-magnetico-portatil'],
  },
  {
    id: 'user-felipe-familia',
    nome: 'Felipe Família',
    idade: 41,
    purchases: ['tabuleiro-escolar-ia', 'kit-pecas-classicas', 'planner-treino-enxadrista'],
  },
  {
    id: 'user-giovana-competicao',
    nome: 'Giovana Competição',
    idade: 17,
    purchases: ['relogio-digital-xadrez', 'mentoria-aberturas-ia', 'planner-treino-enxadrista'],
  },
];

export const usuariosMock = usuariosBase.map((usuario) => ({
  ...usuario,
  compras: usuario.purchases,
}));
