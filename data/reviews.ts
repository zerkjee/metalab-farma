import { Review, RatingSummary, PurchaseNotif } from '@/types/review';

export const reviews: Review[] = [
  // Ademoril (id: 1)
  {
    id: 1, productId: 1, productName: 'Ademoril', productImage: '/products/ademoril.png',
    productColor: '#31629c', customerName: 'Mariana Costa', customerCity: 'São Paulo',
    customerState: 'SP', customerInitials: 'MC', avatarColor: '#7c3aed',
    rating: 5, title: 'Produto excelente, embalagem impecável',
    comment: 'Recebi o produto lacrado, dentro do prazo e muito bem embalado. Estou usando como complemento alimentar há 3 semanas e estou satisfeita. A qualidade da embalagem já passa confiança. Recomendo a todos que buscam um suplemento de procedência garantida.',
    date: '2025-04-28', verified: true, helpfulCount: 34, totalVotes: 38, featured: true,
  },
  {
    id: 2, productId: 1, productName: 'Ademoril', productImage: '/products/ademoril.png',
    productColor: '#31629c', customerName: 'Carlos Mendes', customerCity: 'Belo Horizonte',
    customerState: 'MG', customerInitials: 'CM', avatarColor: '#059669',
    rating: 5, title: 'Chegou super rápido e lacrado',
    comment: 'Comprei e chegou em 2 dias. Produto lacrado, com procedência e nota fiscal. Estou usando diariamente como complemento da minha alimentação. Nota 10!',
    date: '2025-04-20', verified: true, helpfulCount: 21, totalVotes: 23,
  },
  {
    id: 3, productId: 1, productName: 'Ademoril', productImage: '/products/ademoril.png',
    productColor: '#31629c', customerName: 'Fernanda Lima', customerCity: 'Curitiba',
    customerState: 'PR', customerInitials: 'FL', avatarColor: '#dc2626',
    rating: 4, title: 'Bom produto, entrega rápida',
    comment: 'Produto conforme descrito, entrega dentro do prazo. Embalagem bem conservada. Só tire um ponto pois achei a embalagem um pouco menor do que imaginava, mas o produto em si é ótimo.',
    date: '2025-04-10', verified: true, helpfulCount: 12, totalVotes: 15,
  },
  {
    id: 4, productId: 1, productName: 'Ademoril', productImage: '/products/ademoril.png',
    productColor: '#31629c', customerName: 'Ricardo Souza', customerCity: 'Porto Alegre',
    customerState: 'RS', customerInitials: 'RS', avatarColor: '#d97706',
    rating: 5, title: 'Qualidade e confiança Metalab',
    comment: 'Já é a minha terceira compra na Metalab Store. Sempre entregam com qualidade e dentro do prazo. Produto sempre lacrado. Marca de confiança, continuarei comprando.',
    date: '2025-03-30', verified: true, helpfulCount: 18, totalVotes: 19,
  },
  {
    id: 5, productId: 1, productName: 'Ademoril', productImage: '/products/ademoril.png',
    productColor: '#31629c', customerName: 'Ana Paula Ferreira', customerCity: 'Fortaleza',
    customerState: 'CE', customerInitials: 'AP', avatarColor: '#0284c7',
    rating: 5, title: 'Produto com ótima procedência',
    comment: 'Ótima experiência de compra. O site é fácil de usar, o atendimento foi excelente e o produto chegou bem embalado com lacre intacto. Vale cada centavo.',
    date: '2025-03-15', verified: true, helpfulCount: 9, totalVotes: 10, featured: true,
  },

  // Água Inglesa (id: 4)
  {
    id: 6, productId: 4, productName: 'Água Inglesa', productImage: '/products/agua_inglesa.png',
    productColor: '#861878', customerName: 'Beatriz Santos', customerCity: 'Salvador',
    customerState: 'BA', customerInitials: 'BS', avatarColor: '#7c3aed',
    rating: 5, title: 'Produto clássico, qualidade confirmada',
    comment: 'Produto da Metalab com aquela qualidade que já conhecemos. Embalagem premium, produto lacrado. Uso como complemento alimentar. Muito satisfeita com a compra!',
    date: '2025-04-25', verified: true, helpfulCount: 27, totalVotes: 29, featured: true,
  },
  {
    id: 7, productId: 4, productName: 'Água Inglesa', productImage: '/products/agua_inglesa.png',
    productColor: '#861878', customerName: 'João Victor Alves', customerCity: 'Manaus',
    customerState: 'AM', customerInitials: 'JV', avatarColor: '#059669',
    rating: 5, title: 'Entrega rápida mesmo no Amazonas',
    comment: 'Impressionado com a rapidez da entrega aqui em Manaus. Chegou em 4 dias, lacrado e na caixa original. Produto de ótima qualidade, recomendo.',
    date: '2025-04-18', verified: true, helpfulCount: 31, totalVotes: 33,
  },
  {
    id: 8, productId: 4, productName: 'Água Inglesa', productImage: '/products/agua_inglesa.png',
    productColor: '#861878', customerName: 'Patrícia Oliveira', customerCity: 'Brasília',
    customerState: 'DF', customerInitials: 'PO', avatarColor: '#dc2626',
    rating: 4, title: 'Boa experiência de compra',
    comment: 'Produto chegou dentro do prazo, bem embalado e lacrado. Site funciona bem e a compra foi segura. Estou usando diariamente como suplemento alimentar.',
    date: '2025-04-05', verified: true, helpfulCount: 8, totalVotes: 11,
  },

  // Apetimax (id: 7)
  {
    id: 9, productId: 7, productName: 'Apetimax', productImage: '/products/apetimax.png',
    productColor: '#c6e0eb', customerName: 'Thiago Rodrigues', customerCity: 'Recife',
    customerState: 'PE', customerInitials: 'TR', avatarColor: '#7c3aed',
    rating: 5, title: 'Produto com qualidade percebida muito alta',
    comment: 'Logo na embalagem já dá pra notar a qualidade do produto. Lacrado, com procedência e nota fiscal. Estou usando como complemento alimentar há um mês. Muito satisfeito!',
    date: '2025-04-22', verified: true, helpfulCount: 22, totalVotes: 24, featured: true,
  },
  {
    id: 10, productId: 7, productName: 'Apetimax', productImage: '/products/apetimax.png',
    productColor: '#c6e0eb', customerName: 'Luciana Martins', customerCity: 'Goiânia',
    customerState: 'GO', customerInitials: 'LM', avatarColor: '#d97706',
    rating: 5, title: 'Excelente custo-benefício',
    comment: 'Comparei vários produtos e a Metalab tem o melhor custo-benefício. Produto de qualidade, embalagem impecável, entrega rápida. Já recomendei para vários amigos.',
    date: '2025-04-12', verified: true, helpfulCount: 16, totalVotes: 18,
  },
  {
    id: 11, productId: 7, productName: 'Apetimax', productImage: '/products/apetimax.png',
    productColor: '#c6e0eb', customerName: 'Diego Cardoso', customerCity: 'Natal',
    customerState: 'RN', customerInitials: 'DC', avatarColor: '#0284c7',
    rating: 5, title: 'Segunda compra, sempre satisfeito',
    comment: 'Essa é minha segunda compra do Apetimax. A consistência da qualidade é o que me faz voltar. Produto sempre lacrado, embalagem conservada. Nota 10.',
    date: '2025-03-28', verified: true, helpfulCount: 14, totalVotes: 15,
  },
  {
    id: 12, productId: 7, productName: 'Apetimax', productImage: '/products/apetimax.png',
    productColor: '#c6e0eb', customerName: 'Camila Nunes', customerCity: 'Maceió',
    customerState: 'AL', customerInitials: 'CN', avatarColor: '#dc2626',
    rating: 4, title: 'Produto bom, entrega ok',
    comment: 'Produto conforme descrito. Embalagem em bom estado, lacrado. Entrega demorou um pouco mais que o esperado, mas chegou bem. O produto em si é ótimo.',
    date: '2025-03-18', verified: false, helpfulCount: 7, totalVotes: 10,
  },

  // Articulice (id: 10)
  {
    id: 13, productId: 10, productName: 'Articulice', productImage: '/products/articulice.png',
    productColor: '#6b21a8', customerName: 'Roberto Lima', customerCity: 'Florianópolis',
    customerState: 'SC', customerInitials: 'RL', avatarColor: '#7c3aed',
    rating: 5, title: 'Produto de excelente procedência',
    comment: 'Comprei o Articulice depois de muita pesquisa. A Metalab tem certificações e procedência garantida. Produto chegou lacrado, dentro do prazo. Muito satisfeito com a qualidade.',
    date: '2025-04-29', verified: true, helpfulCount: 41, totalVotes: 44, featured: true,
  },
  {
    id: 14, productId: 10, productName: 'Articulice', productImage: '/products/articulice.png',
    productColor: '#6b21a8', customerName: 'Adriana Correia', customerCity: 'Campo Grande',
    customerState: 'MS', customerInitials: 'AC', avatarColor: '#059669',
    rating: 5, title: 'Embalagem premium, produto confiável',
    comment: 'A embalagem já transmite profissionalismo. Produto lacrado, com todas as informações do rótulo. Uso como suplemento alimentar há 6 semanas. Muito feliz com a compra.',
    date: '2025-04-17', verified: true, helpfulCount: 25, totalVotes: 27,
  },
  {
    id: 15, productId: 10, productName: 'Articulice', productImage: '/products/articulice.png',
    productColor: '#6b21a8', customerName: 'Marcos Pereira', customerCity: 'Cuiabá',
    customerState: 'MT', customerInitials: 'MP', avatarColor: '#d97706',
    rating: 5, title: 'Recomendo fortemente',
    comment: 'Terceira compra na Metalab. Sempre entregam com excelência. Produto de qualidade superior, procedência garantida. A Metalab se preocupa com o cliente.',
    date: '2025-04-08', verified: true, helpfulCount: 19, totalVotes: 20,
  },
  {
    id: 16, productId: 10, productName: 'Articulice', productImage: '/products/articulice.png',
    productColor: '#6b21a8', customerName: 'Sandra Figueiredo', customerCity: 'Belém',
    customerState: 'PA', customerInitials: 'SF', avatarColor: '#dc2626',
    rating: 4, title: 'Muito bom, só demora um pouco mais para chegar',
    comment: 'O produto é excelente, embalagem impecável e lacrado. Por estar no Pará, a entrega demorou uns dias a mais, mas valeu a pena esperar. Produto de muita qualidade.',
    date: '2025-03-25', verified: true, helpfulCount: 11, totalVotes: 14,
  },

  // Kit 2 Ademoril (id: 2)
  {
    id: 17, productId: 2, productName: 'Kit 2 Ademoril', productImage: '/products/ademoril-kit-2.png',
    productColor: '#31629c', customerName: 'Vanessa Prado', customerCity: 'São Paulo',
    customerState: 'SP', customerInitials: 'VP', avatarColor: '#7c3aed',
    rating: 5, title: 'Vale muito mais comprar o kit',
    comment: 'Comprei o kit 2 e valeu muito a pena. Custo-benefício muito superior ao produto avulso. Chegou tudo lacrado, na caixa, bem protegido. Já estou pensando em comprar o kit 3 na próxima vez.',
    date: '2025-04-26', verified: true, helpfulCount: 29, totalVotes: 31, featured: true,
  },
  {
    id: 18, productId: 2, productName: 'Kit 2 Ademoril', productImage: '/products/ademoril-kit-2.png',
    productColor: '#31629c', customerName: 'Henrique Moura', customerCity: 'Rio de Janeiro',
    customerState: 'RJ', customerInitials: 'HM', avatarColor: '#059669',
    rating: 5, title: 'Economia no kit, qualidade garantida',
    comment: 'Kit chegou muito bem embalado, os dois produtos lacrados. Economia real comparado a comprar separado. Metalab sempre entrega com excelência.',
    date: '2025-04-14', verified: true, helpfulCount: 17, totalVotes: 18,
  },

  // Kit 2 Água Inglesa (id: 5)
  {
    id: 19, productId: 5, productName: 'Kit 2 Água Inglesa', productImage: '/products/agua_inglesa-kit-2.png',
    productColor: '#861878', customerName: 'Juliana Borges', customerCity: 'Porto Alegre',
    customerState: 'RS', customerInitials: 'JB', avatarColor: '#7c3aed',
    rating: 5, title: 'Melhor compra do mês',
    comment: 'O kit 2 da Água Inglesa é perfeito para quem usa continuamente. Chegou no prazo, lacrado, com nota fiscal. Preço justo e qualidade impecável. Recomendo!',
    date: '2025-04-23', verified: true, helpfulCount: 23, totalVotes: 25, featured: true,
  },
  {
    id: 20, productId: 5, productName: 'Kit 2 Água Inglesa', productImage: '/products/agua_inglesa-kit-2.png',
    productColor: '#861878', customerName: 'Felipe Castro', customerCity: 'Vitória',
    customerState: 'ES', customerInitials: 'FC', avatarColor: '#d97706',
    rating: 5, title: 'Produto autêntico, confiança total',
    comment: 'Já estava com receio de comprar online, mas a Metalab Store me surpreendeu. Produto totalmente lacrado, com rastreamento de entrega. Muito satisfeito!',
    date: '2025-04-09', verified: true, helpfulCount: 13, totalVotes: 15,
  },

  // Kit 3 Apetimax (id: 9)
  {
    id: 21, productId: 9, productName: 'Kit 3 Apetimax', productImage: '/products/apetimax-kit-3.png',
    productColor: '#c6e0eb', customerName: 'Larissa Teixeira', customerCity: 'Belo Horizonte',
    customerState: 'MG', customerInitials: 'LT', avatarColor: '#dc2626',
    rating: 5, title: 'Kit 3 é a melhor opção custo-benefício',
    comment: 'Calculei e o kit 3 sai muito mais em conta. Todos os produtos chegaram lacrados, bem embalados, dentro do prazo. Esse é o melhor custo-benefício da loja. Já indiquei para família e amigos.',
    date: '2025-05-01', verified: true, helpfulCount: 38, totalVotes: 40, featured: true,
  },
  {
    id: 22, productId: 9, productName: 'Kit 3 Apetimax', productImage: '/products/apetimax-kit-3.png',
    productColor: '#c6e0eb', customerName: 'Gustavo Almeida', customerCity: 'Salvador',
    customerState: 'BA', customerInitials: 'GA', avatarColor: '#059669',
    rating: 4, title: 'Ótimo produto, embalagem perfeita',
    comment: 'Kit 3 chegou tudo certinho, cada unidade separadamente lacrada e bem protegida. Qualidade superior. Só removi um ponto porque a embalagem externa ficou um pouco amassada no transporte.',
    date: '2025-04-19', verified: true, helpfulCount: 15, totalVotes: 18,
  },
];

export const ratingSummaries: RatingSummary[] = [
  { productId: 1, averageRating: 4.8, totalReviews: 124, distribution: { 5: 96, 4: 18, 3: 6, 2: 2, 1: 2 } },
  { productId: 2, averageRating: 4.9, totalReviews: 87, distribution: { 5: 79, 4: 6, 3: 1, 2: 1, 1: 0 } },
  { productId: 3, averageRating: 4.8, totalReviews: 63, distribution: { 5: 55, 4: 6, 3: 1, 2: 1, 1: 0 } },
  { productId: 4, averageRating: 4.7, totalReviews: 98, distribution: { 5: 72, 4: 18, 3: 5, 2: 2, 1: 1 } },
  { productId: 5, averageRating: 4.8, totalReviews: 71, distribution: { 5: 58, 4: 10, 3: 2, 2: 1, 1: 0 } },
  { productId: 6, averageRating: 4.7, totalReviews: 52, distribution: { 5: 40, 4: 9, 3: 2, 2: 1, 1: 0 } },
  { productId: 7, averageRating: 4.9, totalReviews: 156, distribution: { 5: 140, 4: 12, 3: 3, 2: 1, 1: 0 } },
  { productId: 8, averageRating: 4.8, totalReviews: 89, distribution: { 5: 75, 4: 11, 3: 2, 2: 1, 1: 0 } },
  { productId: 9, averageRating: 4.9, totalReviews: 112, distribution: { 5: 101, 4: 9, 3: 1, 2: 1, 1: 0 } },
  { productId: 10, averageRating: 4.9, totalReviews: 203, distribution: { 5: 187, 4: 13, 3: 2, 2: 1, 1: 0 } },
];

export const purchaseNotifications: PurchaseNotif[] = [
  { productId: 1, productName: 'Ademoril', productImage: '/products/ademoril.png', productColor: '#31629c', customerCity: 'Belo Horizonte', customerState: 'MG', timeAgo: 'agora mesmo' },
  { productId: 7, productName: 'Apetimax', productImage: '/products/apetimax.png', productColor: '#c6e0eb', customerCity: 'São Paulo', customerState: 'SP', timeAgo: 'há 2 minutos' },
  { productId: 10, productName: 'Articulice', productImage: '/products/articulice.png', productColor: '#6b21a8', customerCity: 'Porto Alegre', customerState: 'RS', timeAgo: 'há 3 minutos' },
  { productId: 4, productName: 'Água Inglesa', productImage: '/products/agua_inglesa.png', productColor: '#861878', customerCity: 'Recife', customerState: 'PE', timeAgo: 'há 5 minutos' },
  { productId: 9, productName: 'Kit 3 Apetimax', productImage: '/products/apetimax-kit-3.png', productColor: '#c6e0eb', customerCity: 'Curitiba', customerState: 'PR', timeAgo: 'há 7 minutos' },
  { productId: 2, productName: 'Kit 2 Ademoril', productImage: '/products/ademoril-kit-2.png', productColor: '#31629c', customerCity: 'Fortaleza', customerState: 'CE', timeAgo: 'há 9 minutos' },
  { productId: 5, productName: 'Kit 2 Água Inglesa', productImage: '/products/agua_inglesa-kit-2.png', productColor: '#861878', customerCity: 'Salvador', customerState: 'BA', timeAgo: 'há 11 minutos' },
  { productId: 10, productName: 'Articulice', productImage: '/products/articulice.png', productColor: '#6b21a8', customerCity: 'Campinas', customerState: 'SP', timeAgo: 'há 14 minutos' },
];

export function getReviewsByProduct(productId: string): Review[] {
  const numericId = parseInt(productId.replace('local-', '')) || parseInt(productId);
  return reviews.filter((r) => r.productId === numericId);
}

export function getSummaryByProduct(productId: string): RatingSummary | null {
  const numericId = parseInt(productId.replace('local-', '')) || parseInt(productId);
  return ratingSummaries.find((s) => s.productId === numericId) ?? null;
}

export function getFeaturedReviews(): Review[] {
  return reviews.filter((r) => r.featured);
}

export function getRecentReviews(count = 8): Review[] {
  return [...reviews].sort((a, b) => b.date.localeCompare(a.date)).slice(0, count);
}

export function getMostHelpfulReviews(count = 6): Review[] {
  return [...reviews].sort((a, b) => b.helpfulCount - a.helpfulCount).slice(0, count);
}
