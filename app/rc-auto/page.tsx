import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import Link from "next/link";
import RcAutoChart from "../components/RcAutoChart";

interface ProvinciaIndex {
  slug: string;
  nome: string;
  sigla: string;
  regione: string;
  premio: number;
  var_annua: number;
  vs_media: number;
}

interface RcAutoIndex {
  aggiornato: string;
  anno: number;
  media_nazionale: number;
  n_province: number;
  province: ProvinciaIndex[];
  piu_care: string[];
  piu_economiche: string[];
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export const metadata: Metadata = {
  title: "RC Auto per Provincia in Italia — Prezzi Medi IVASS",
  description: "Prezzi medi RC Auto per ogni provincia italiana. Dati ufficiali IVASS aggiornati. Scopri dove si paga di più e dove si risparmia sull'assicurazione auto.",
  alternates: { canonical: "/rc-auto" },
};

export default function RcAutoPage() {
  const data = loadJSON<RcAutoIndex>("rcauto/index.json");
  if (!data) return <div className="text-gray-400 text-center py-20">Dati non disponibili</div>;

  const piuCare = data.piu_care.map(slug => data.province.find(p => p.slug === slug)).filter(Boolean) as ProvinciaIndex[];
  const piuEco = data.piu_economiche.map(slug => data.province.find(p => p.slug === slug)).filter(Boolean) as ProvinciaIndex[];

  const perRegione: Record<string, ProvinciaIndex[]> = {};
  for (const p of [...data.province].sort((a, b) => a.nome.localeCompare(b.nome))) {
    if (!perRegione[p.regione]) perRegione[p.regione] = [];
    perRegione[p.regione].push(p);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Prezzi RC Auto per Provincia in Italia",
    "description": "Premio medio annuo RC Auto per provincia italiana. Fonte: IVASS.",
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "creator": { "@type": "Organization", "name": "IVASS", "url": "https://www.ivass.it" },
    "temporalCoverage": String(data.anno),
    "spatialCoverage": "Italia",
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>›</span>
        <span className="text-gray-600 font-medium">RC Auto per Provincia</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">RC Auto per Provincia</h1>
        <p className="text-sm text-gray-500">
          Premio medio annuo · Ultimo rilevamento disponibile IVASS:{" "}
          <strong className="text-gray-700">{data.anno}</strong> · {data.n_province} province · Fonte{" "}
          <a href="https://www.ivass.it/pubblicazioni-e-statistiche/statistiche/rc-auto/" target="_blank" rel="noopener noreferrer" className="text-green-700 underline">IVASS</a>
        </p>
      </div>

      {/* CARD MEDIA NAZIONALE */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Media Nazionale</div>
          <div className="text-4xl font-bold" style={{ color: "#16a34a" }}>
            €{data.media_nazionale}
            <span className="text-base font-normal text-gray-400 ml-1">/anno</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Premio medio RC Auto — dati IVASS {data.anno}</p>
        </div>
        <span className="text-5xl">🚗</span>
      </div>

      {/* GRAFICI */}
      <RcAutoChart
        piuCare={piuCare}
        piuEco={piuEco}
        mediaNazionale={data.media_nazionale}
      />

      {/* TOP / BOTTOM */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Province più care</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {piuCare.map((p, i) => (
              <Link key={p.slug} href={`/rc-auto/${p.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                style={{ borderBottom: i < piuCare.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 w-6">{i + 1}</span>
                  <div>
                    <div className="font-medium text-sm text-gray-800 group-hover:text-green-700">{p.nome}</div>
                    <div className="text-xs text-gray-400">{p.sigla} · {p.regione}</div>
                  </div>
                </div>
                <span className="text-sm font-bold text-red-600">€{p.premio}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Province più economiche</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {piuEco.map((p, i) => (
              <Link key={p.slug} href={`/rc-auto/${p.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                style={{ borderBottom: i < piuEco.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 w-6">{i + 1}</span>
                  <div>
                    <div className="font-medium text-sm text-gray-800 group-hover:text-green-700">{p.nome}</div>
                    <div className="text-xs text-gray-400">{p.sigla} · {p.regione}</div>
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color: "#16a34a" }}>€{p.premio}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* TUTTE LE PROVINCE PER REGIONE */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Tutte le Province</h2>
        <div className="space-y-6">
          {Object.keys(perRegione).sort().map((regione) => (
            <div key={regione}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">{regione}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {perRegione[regione].map((p) => (
                  <Link key={p.slug} href={`/rc-auto/${p.slug}`}
                    className="bg-white rounded-xl border border-gray-200 px-3 py-2.5 flex items-center justify-between hover:border-green-400 hover:shadow-sm transition-all group">
                    <div>
                      <div className="font-medium text-sm text-gray-800 group-hover:text-green-700">{p.nome}</div>
                      <div className="text-xs text-gray-400">{p.sigla}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: p.vs_media > 20 ? "#dc2626" : p.vs_media < -10 ? "#16a34a" : "#374151" }}>
                        €{p.premio}
                      </div>
                      <div className={`text-xs font-medium ${p.vs_media > 0 ? "text-red-500" : "text-green-600"}`}>
                        {p.vs_media > 0 ? "+" : ""}{p.vs_media}%
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-start gap-3 text-xs text-gray-400 bg-white rounded-xl border border-gray-100 px-4 py-3">
        <span className="text-base mt-0.5">ℹ️</span>
        <span>
          Dati elaborati da{" "}
          <a href="https://www.ivass.it/pubblicazioni-e-statistiche/statistiche/rc-auto/" target="_blank" rel="noopener noreferrer" className="text-green-700 underline">
            IVASS — Bollettino Statistico RC Auto {data.anno}
          </a>.
          Il premio medio è calcolato su tutti i veicoli assicurati nella provincia. Il prezzo reale dipende da età, anzianità di guida, classe bonus-malus e compagnia scelta.
        </span>
      </div>
    </div>
  );
}
