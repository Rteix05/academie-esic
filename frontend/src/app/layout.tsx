import type { Metadata } from "next";
import { DM_Sans, Poppins } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from '@/components/ConditionalNavbar';
import ConditionalFooter from '@/components/ConditionalFooter';
import { ThemeProvider } from '@/components/ThemeProvider';

// Titres, navigation, boutons : géométrique et arrondie
const poppins = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Texte courant : même famille visuelle, plus lisible en paragraphe
const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Académie E.S.I.C. — Formations & Masterclass",
    template: "%s — Académie E.S.I.C.",
  },
  description:
    "Équipement · Spiritualité · Identité · Croissance. Formations professionnelles et masterclass pour fortifier votre marche et approfondir votre connaissance.",
  metadataBase: new URL("https://academie-esic.fr"),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://academie-esic.fr',
    siteName: 'Académie E.S.I.C.',
    title: 'Académie E.S.I.C. — Formations & Masterclass',
    description: 'Équipement · Spiritualité · Identité · Croissance. Formations et masterclass pour approfondir votre foi.',
    // Image de partage : générée par app/opengraph-image.tsx
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Académie E.S.I.C. — Formations & Masterclass',
    description: 'Équipement · Spiritualité · Identité · Croissance.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${poppins.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          {/* Lien d'évitement — RGAA critère 12.7 */}
          <a href="#contenu-principal" className="skip-link">
            Aller au contenu principal
          </a>

          <ConditionalNavbar />

          <main
            id="contenu-principal"
            tabIndex={-1}
            className="flex-1 outline-none"
          >
            {children}
          </main>

          <ConditionalFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
