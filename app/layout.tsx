import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PrezziOggi.com — Prezzi Carburanti, Case, Farmaci e Bollette in Italia",
    template: "%s | PrezziOggi.com",
  },
  description: "Prezzi aggiornati ogni giorno: benzina, gasolio, prezzi case per comune, bollette luce e gas, farmaci equivalenti. Dati ufficiali MIMIT, ARERA, OMI, AIFA.",
  keywords: ["prezzi oggi", "prezzi benzina", "prezzi case", "bollette luce gas", "farmaci prezzi", "carburanti italia"],
  openGraph: { siteName: "PrezziOggi.com", locale: "it_IT", type: "website" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={inter.className}>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8370784299779281"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-full flex flex-col">

        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-0">
            {/* Top row */}
            <div className="flex items-center justify-between h-14 gap-4">
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <span className="text-2xl">📊</span>
                <span className="font-bold text-lg" style={{ color: "#16a34a" }}>PrezziOggi.com</span>
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
                <Link href="/carburanti" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 hover:text-green-700 transition-colors">⛽ Carburanti</Link>
                <Link href="/case" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 hover:text-green-700 transition-colors">🏠 Case</Link>
                <Link href="/bollette" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 hover:text-green-700 transition-colors">⚡ Bollette</Link>
                <Link href="/farmaci" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 hover:text-green-700 transition-colors hidden lg:block">💊 Farmaci</Link>
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
                  <span className="text-xl">📊</span>
                  <span className="font-bold text-gray-700">PrezziOggi.com</span>
                </div>
                <p>Dati ufficiali MIMIT · ARERA · OMI · AIFA · Aggiornati ogni giorno</p>
                <p className="mt-1">Gestito da <strong>PlasmaCompany</strong> · <a href="mailto:info@plasmacompany.net" className="underline hover:text-green-700">info@plasmacompany.net</a></p>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <Link href="/privacy" className="hover:text-green-700 hover:underline">Privacy Policy</Link>
                <Link href="/cookie" className="hover:text-green-700 hover:underline">Cookie Policy</Link>
                <Link href="/contatti" className="hover:text-green-700 hover:underline">Contatti</Link>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-400 text-center">
              I prezzi mostrati sono medie calcolate su dati ufficiali (MIMIT, ARERA, OMI, AIFA). Verificare sempre i prezzi aggiornati presso i distributori e le farmacie.
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
