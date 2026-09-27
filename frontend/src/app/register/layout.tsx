import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez votre compte Académie E.S.I.C.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
