import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace Académie E.S.I.C.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
