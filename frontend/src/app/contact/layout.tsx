import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur nos formations ou masterclass ? Contactez l'Académie E.S.I.C.",
  alternates: { canonical: '/contact' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
