import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CarburantiOggi.it — Prezzi Benzina e Gasolio in Italia",
    template: "%s | CarburantiOggi.it",
  },
  description: "Trova i prezzi di benzina, gasolio, GPL e metano aggiornati ogni giorno in tutte le province e regioni italiane. Dati ufficiali MIMIT.",
  keywords: ["prezzi benzina", "prezzi gasolio", "carburanti italia", "prezzi carburanti oggi"],
  openGraph: {
    siteName: "CarburantiOggi.it",
    locale: "it_IT",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={inter.className}>
      <body className="bg-gray-50 text-gray-900 min-h-full flex flex-col">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">⛽</span>
              <span className="font-bold text-lg text-green-700">CarburantiOggi.it</span>
            </Link>
            <nav className="flex gap-4 text-sm text-gray-600">
              <Link href="/regioni" className="hover:text-green-700">Regioni</Link>
              <Link href="/province" className="hover:text-green-700">Province</Link>
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
          {children}
        </main>

        <footer className="border-t border-gray-200 mt-16 py-8 text-center text-sm text-gray-500">
          <p>Dati ufficiali forniti dal <a href="https://carburanti.mise.gov.it" className="underline" target="_blank" rel="noopener noreferrer">Ministero delle Imprese e del Made in Italy (MIMIT)</a>.</p>
          <p className="mt-1">Aggiornati quotidianamente. Gestito da <strong>PlasmaCompany</strong> — <a href="mailto:info@plasmacompany.net" className="underline">info@plasmacompany.net</a></p>
          <div className="mt-3 flex justify-center gap-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/cookie" className="hover:underline">Cookie Policy</Link>
            <Link href="/contatti" className="hover:underline">Contatti</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
