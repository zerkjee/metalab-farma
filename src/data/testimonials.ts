export interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  rating: number
  product: string
  avatar: string
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Ana Carvalho",
    role: "Nutricionista",
    content: "Indico a METALAB aos meus pacientes com confiança. A qualidade dos insumos é incomparável e os laudos de cada lote estão sempre disponíveis. Transparência que poucas marcas têm.",
    rating: 5,
    product: "Magnésio Quelato",
    avatar: "AC",
  },
  {
    id: "2",
    name: "Rafael Mendonça",
    role: "Personal Trainer",
    content: "Uso e recomendo os suplementos METALAB há mais de 2 anos. A diferença na qualidade é perceptível, especialmente no Ômega 3, sem gosto residual e com pureza comprovada.",
    rating: 5,
    product: "Ômega 3 1000mg",
    avatar: "RM",
  },
  {
    id: "3",
    name: "Dra. Juliana Ferreira",
    role: "Médica Funcional",
    content: "O rigor científico da METALAB é o que me faz recomendar. Cada produto tem dosagem baseada em evidências e matéria-prima certificada. São poucos que fazem isso no Brasil.",
    rating: 5,
    product: "Vitamina D3 + K2",
    avatar: "JF",
  },
  {
    id: "4",
    name: "Marcos Oliveira",
    role: "Cliente",
    content: "Comprei a Ashwagandha KS-66 e os resultados vieram de forma gradual, exatamente como os estudos mostram. Entrega rápida, embalagem impecável. Virei cliente fiel.",
    rating: 5,
    product: "Ashwagandha KS-66",
    avatar: "MO",
  },
  {
    id: "5",
    name: "Camila Santos",
    role: "Professora de Yoga",
    content: "A Vitamina C da METALAB é a única que uso. Sinto a diferença na imunidade e na pele. Amo que eles colocam os laudos disponíveis no site — isso é respeito ao consumidor.",
    rating: 5,
    product: "Vitamina C 1000mg",
    avatar: "CS",
  },
  {
    id: "6",
    name: "Pedro Vasconcelos",
    role: "Engenheiro",
    content: "Fiquei impressionado com a qualidade do atendimento e com a rapidez na entrega. Recebi meu pedido em 2 dias. Produtos com embalagem premium e informações claras.",
    rating: 4,
    product: "Complexo B",
    avatar: "PV",
  },
]
