import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Mon espace",
  description: "Votre espace personnel.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
