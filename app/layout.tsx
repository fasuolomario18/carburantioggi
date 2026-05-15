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
  openGraph: { siteName: "CarburantiOggi.it", locale: "it_IT", type: "website" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={inter.className}>
      <body className="bg-gray-50 text-gray-900 min-h-full flex flex-col">

        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-0">
            {/* Top row */}
            <div className="flex items-center justify-between h-14 gap-4">
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <span className="text-2xl">⛽</span>
                <span className="font-bold text-lg" style={{ color: "#16a34a" }}>CarburantiOggi.it</span>
              </Link>

              {/* Search bar */}
              <form action="/province" method="get" className="hidden md:flex flex-1 max-w-sm">
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                  <input
                    type="text"
                    name="q"
                    placeholder="Cerca comune o provincia..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </form>

              {/* Nav */}
              <nav className="flex items-center gap-1 text-sm font-medium text-gray-600">
                <Link href="/regioni" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 hover:text-green-700 transition-colors">Regioni</Link>
                <Link href="/province" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 hover:text-green-700 transition-colors">Province</Link>
                <Link href="/contatti" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 hover:text-green-700 transition-colors">Prezzi</Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
          {children}
        </main>

        <footer className="border-t border-gray-200 mt-16 py-10 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-gray-500">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">⛽</span>
                  <span className="font-bold text-gray-700">CarburantiOggi.it</span>
                </div>
                <p>Dati ufficiali{" "}
                  <a href="https://carburanti.mise.gov.it" className="underline hover:text-green-700" target="_blank" rel="noopener noreferrer">MIMIT</a>
                  {" "}· Aggiornati ogni giorno alle 6:00
                </p>
                <p className="mt-1">Gestito da <strong>PlasmaCompany</strong> · <a href="mailto:info@plasmacompany.net" className="underline hover:text-green-700">info@plasmacompany.net</a></p>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <Link href="/privacy" className="hover:text-green-700 hover:underline">Privacy Policy</Link>
                <Link href="/cookie" className="hover:text-green-700 hover:underline">Cookie Policy</Link>
                <Link href="/contatti" className="hover:text-green-700 hover:underline">Contatti</Link>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-400 text-center">
              I prezzi mostrati sono medie calcolate su dati MIMIT. Verifica sempre il prezzo esposto al distributore.
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
