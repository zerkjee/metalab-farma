import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Avaliações dos Clientes | Metalab Store',
  description: 'Veja o que nossos clientes dizem sobre os suplementos Metalab. Avaliações verificadas de compradores reais.',
  openGraph: {
    title: 'Avaliações dos Clientes | Metalab Store',
    description: 'Transparência total — avaliações verificadas de compradores reais da Metalab Store.',
  },
};

export default function AvaliacoesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
