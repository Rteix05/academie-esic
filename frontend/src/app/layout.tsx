import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from '@/components/ConditionalNavbar';
import ConditionalFooter from '@/components/ConditionalFooter';
import { ThemeProvider } from '@/components/ThemeProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
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
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://academie-esic.fr',
    siteName: 'Académie E.S.I.C.',
    title: 'Académie E.S.I.C. — Formations & Masterclass',
    description: 'Équipement · Spiritualité · Identité · Croissance. Formations et masterclass pour approfondir votre foi.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Académie E.S.I.C.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Académie E.S.I.C. — Formations & Masterclass',
    description: 'Équipement · Spiritualité · Identité · Croissance.',
    images: ['/og-image.png'],
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
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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
