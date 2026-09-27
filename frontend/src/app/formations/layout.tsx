import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Formations",
  description: "Catalogue des formations de l'Académie E.S.I.C. : Institut Biblique Théologique, École du Ministère et du Leadership, discipulat.",
  alternates: { canonical: '/formations' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
