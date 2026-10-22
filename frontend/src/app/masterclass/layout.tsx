import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Masterclass",
  description: "Masterclass premium en vidéo et PDF : des enseignements approfondis par nos intervenants, accessibles depuis votre espace personnel dès l'achat.",
  alternates: { canonical: '/masterclass' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
