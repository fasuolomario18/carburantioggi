import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import type { Metadata } from "next";

interface ComuneIndex {
  slug: string;
  nome: string;
  provincia: string;
  regione: string;
  residenziale_media: number;
  affitto_media: number;
  n_zone: number;
}

interface CaseIndex {
  aggiornato: string;
  comuni: ComuneIndex[];
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export const metadata: Metadata = {
  title: "Prezzi Case e Affitti per Comune — Dati OMI Italia",
  description: "Prezzi di vendita e affitto immobili per tutti i comuni italiani. Dati ufficiali OMI — Agenzia delle Entrate. Aggiornati ogni semestre.",
};

const REGIONI_ORDINE = [
  "Valle d'Aosta", "Piemonte", "Liguria", "Lombardia", "Trentino-Alto Adige",
  "Friuli-Venezia Giulia", "Veneto", "Emilia-Romagna", "Toscana", "Marche",
  "Umbria", "Lazio", "Abruzzo", "Molise", "Campania", "Puglia",
  "Basilicata", "Calabria", "Sicilia", "Sardegna",
];

export default function CasePage() {
  const data = loadJSON<CaseIndex>("case/index.json");
  const comuni = data?.comuni ?? [];

  const aggiornato = data?.aggiornato ?? "—";

  // Raggruppa per regione
  const perRegione = comuni.reduce<Record<string, ComuneIndex[]>>((acc, c) => {
    if (!acc[c.regione]) acc[c.regione] = [];
    acc[c.regione].push(c);
    return acc;
  }, {});

  // Ordina per prezzo decrescente dentro ogni regione
  for (const reg in perRegione) {
    perRegione[reg].sort((a, b) => b.residenziale_media - a.residenziale_media);
  }

  const regioniPresenti = REGIONI_ORDINE.filter(r => perRegione[r]);

  return (
    <div>

      {/* BREADCRUMB */}
      <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>›</span>
        <span className="text-gray-600 font-medium">Prezzi Case</span>
      </nav>

      {/* TITOLO */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Prezzi Case e Affitti per Comune</h1>
        <p className="text-sm text-gray-500">
          Semestre <strong className="text-gray-700">{aggiornato}</strong> · Dati ufficiali{" "}
          <a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/fabbricatiterreni/omi" target="_blank" rel="noopener noreferrer" className="text-green-700 underline">OMI — Agenzia Entrate</a>
          {" "}· {comuni.length} comuni disponibili
        </p>
      </div>

      {/* INFO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="text-2xl mb-2">🏠</div>
          <div className="font-semibold text-gray-800 text-sm mb-1">Prezzi al m²</div>
          <div className="text-xs text-gray-500">Valori di compravendita per metro quadro, distinti per zona e tipo immobile</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="text-2xl mb-2">🔑</div>
          <div className="font-semibold text-gray-800 text-sm mb-1">Affitti mensili</div>
          <div className="text-xs text-gray-500">Canone mensile per metro quadro nelle diverse zone del comune</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="text-2xl mb-2">📊</div>
          <div className="font-semibold text-gray-800 text-sm mb-1">Zone OMI</div>
          <div className="text-xs text-gray-500">Dati suddivisi per microzone territoriali (centro, semicentro, periferia...)</div>
        </div>
      </div>

      {/* LISTA COMUNI PER REGIONE */}
      {regioniPresenti.map((regione) => (
        <section key={regione} className="mb-8">
          <h2 className="font-semibold text-gray-800 mb-3">{regione}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {perRegione[regione].map((c) => (
              <Link key={c.slug} href={`/case/${c.slug}`}
                className="bg-white rounded-xl border border-gray-200 px-4 py-4 hover:border-green-400 hover:shadow-sm transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">{c.nome}</div>
                    <div className="text-xs text-gray-400">{c.provincia} · {c.n_zone} zone OMI</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: "#16a34a" }}>€{c.residenziale_media.toLocaleString("it-IT")}/m²</div>
                    <div className="text-xs text-gray-400">affitto: €{c.affitto_media}/m²/mese</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* SEO TEXT */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 prose prose-sm max-w-none text-gray-600 mt-4">
        <h2 className="text-gray-800">Come leggere i prezzi OMI</h2>
        <p>
          I dati mostrati provengono dall&apos;<strong>Osservatorio del Mercato Immobiliare (OMI)</strong> dell&apos;Agenzia delle Entrate,
          che pubblica semestralmente le quotazioni immobiliari per ogni zona di ogni comune italiano.
          I prezzi sono espressi in <strong>€/m²</strong> e rappresentano l&apos;intervallo di valori normali
          di compravendita per immobili in stato conservativo normale.
        </p>
        <p>
          Per ogni comune sono disponibili i dati divisi per <strong>zona OMI</strong> (centro storico, semicentro, periferia, suburbano)
          e per tipo di immobile (residenziale, uffici, negozi, capannoni, ville).
          Gli affitti sono espressi in <strong>€/m²/mese</strong>.
        </p>
      </section>

    </div>
  );
}
