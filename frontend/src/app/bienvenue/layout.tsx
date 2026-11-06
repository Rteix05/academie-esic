import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bienvenue',
  description: 'Trouvez les formations qui vous correspondent.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
