import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Événements",
  description: "Agenda des événements de l'Académie E.S.I.C. : conférences, séminaires et rencontres, avec inscription en ligne.",
  alternates: { canonical: '/evenements' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
