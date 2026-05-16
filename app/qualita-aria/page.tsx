import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import type { Metadata } from "next";

interface CittaIndex {
  slug: string;
  nome: string;
  sigla: string;
  regione: string;
  aqi: number;
  aqi_categoria: string;
  aqi_colore: string;
  aqi_idx: number;
}

interface AriaIndex {
  aggiornato: string;
  n_citta: number;
  citta: CittaIndex[];
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export const metadata: Metadata = {
  title: "Qualità dell'Aria in Italia — Indice AQI per Città",
  description: "Qualità dell'aria aggiornata oggi per tutti i capoluoghi italiani. Indice AQI europeo, PM2.5, PM10, NO2, Ozono. Dati Copernicus CAMS in tempo reale.",
};

const AQI_BADGE: Record<string, string> = {
  "Buono": "bg-green-100 text-green-700",
  "Discreto": "bg-yellow-100 text-yellow-700",
  "Moderato": "bg-orange-100 text-orange-700",
  "Scarso": "bg-red-100 text-red-700",
  "Molto Scarso": "bg-purple-100 text-purple-700",
  "Pericoloso": "bg-red-200 text-red-900",
};

const AQI_BAR: Record<string, string> = {
  "Buono": "bg-green-500",
  "Discreto": "bg-yellow-400",
  "Moderato": "bg-orange-500",
  "Scarso": "bg-red-500",
  "Molto Scarso": "bg-purple-600",
  "Pericoloso": "bg-red-900",
};

export default function QualitaAriaPage() {
  const data = loadJSON<AriaIndex>("aria/index.json");
  if (!data) return <div className="text-gray-400 text-center py-20">Dati non disponibili</div>;

  const dataFmt = new Date(data.aggiornato).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  // Statistiche rapide
  const buone = data.citta.filter(c => c.aqi_idx === 0).length;
  const discreto = data.citta.filter(c => c.aqi_idx === 1).length;
  const moderate = data.citta.filter(c => c.aqi_idx >= 2).length;
  const peggiori = [...data.citta].sort((a, b) => b.aqi - a.aqi).slice(0, 5);
  const migliori = [...data.citta].sort((a, b) => a.aqi - b.aqi).slice(0, 5);

  // Raggruppa per regione
  const perRegione: Record<string, CittaIndex[]> = {};
  for (const c of [...data.citta].sort((a, b) => a.nome.localeCompare(b.nome))) {
    if (!perRegione[c.regione]) perRegione[c.regione] = [];
    perRegione[c.regione].push(c);
  }
  const regioniOrdinate = Object.keys(perRegione).sort();

  return (
    <div>

      {/* BREADCRUMB */}
      <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>›</span>
        <span className="text-gray-600 font-medium">Qualità dell&apos;Aria</span>
      </nav>

      {/* TITOLO */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Qualità dell&apos;Aria in Italia Oggi
        </h1>
        <p className="text-sm text-gray-500">
          Indice AQI europeo per {data.n_citta} capoluoghi · Aggiornato il{" "}
          <strong className="text-gray-700">{dataFmt}</strong> · Fonte Copernicus CAMS
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm text-center">
          <div className="text-3xl font-bold text-green-600">{buone}</div>
          <div className="text-xs text-gray-400 mt-1">Buona</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm text-center">
          <div className="text-3xl font-bold text-yellow-500">{discreto}</div>
          <div className="text-xs text-gray-400 mt-1">Discreta</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm text-center">
          <div className="text-3xl font-bold text-orange-500">{moderate}</div>
          <div className="text-xs text-gray-400 mt-1">Moderata o peggio</div>
        </div>
      </div>

      {/* TOP / BOTTOM */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Aria più pulita oggi</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {migliori.map((c, i) => (
              <Link key={c.slug} href={`/qualita-aria/${c.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                style={{ borderBottom: i < migliori.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 w-6">{i + 1}</span>
                  <div>
                    <div className="font-medium text-sm text-gray-800 group-hover:text-green-700">{c.nome}</div>
                    <div className="text-xs text-gray-400">{c.sigla} · {c.regione}</div>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${AQI_BADGE[c.aqi_categoria] ?? "bg-gray-100 text-gray-500"}`}>
                  {c.aqi} — {c.aqi_categoria}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Aria peggiore oggi</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {peggiori.map((c, i) => (
              <Link key={c.slug} href={`/qualita-aria/${c.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                style={{ borderBottom: i < peggiori.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 w-6">{i + 1}</span>
                  <div>
                    <div className="font-medium text-sm text-gray-800 group-hover:text-green-700">{c.nome}</div>
                    <div className="text-xs text-gray-400">{c.sigla} · {c.regione}</div>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${AQI_BADGE[c.aqi_categoria] ?? "bg-gray-100 text-gray-500"}`}>
                  {c.aqi} — {c.aqi_categoria}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* LEGENDA AQI */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-8">
        <h2 className="font-semibold text-gray-800 mb-3 text-sm">Indice Europeo di Qualità dell&apos;Aria (EAQI)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { cat: "Buono", range: "0–20", desc: "Qualità ottimale, nessun rischio" },
            { cat: "Discreto", range: "20–40", desc: "Qualità accettabile per la maggioranza" },
            { cat: "Moderato", range: "40–60", desc: "Persone sensibili possono avvertire effetti" },
            { cat: "Scarso", range: "60–80", desc: "Effetti sulla salute possibili per tutti" },
            { cat: "Molto Scarso", range: "80–100", desc: "Limitare le attività all&apos;aperto" },
            { cat: "Pericoloso", range: ">100", desc: "Emergenza sanitaria" },
          ].map(({ cat, range, desc }) => (
            <div key={cat} className="flex items-start gap-2">
              <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${AQI_BAR[cat]}`} />
              <div>
                <div className="text-xs font-semibold text-gray-700">{cat} <span className="text-gray-400 font-normal">({range})</span></div>
                <div className="text-xs text-gray-400">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TUTTE LE CITTÀ PER REGIONE */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Qualità dell&apos;Aria per Regione</h2>
        <div className="space-y-6">
          {regioniOrdinate.map((regione) => (
            <div key={regione}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">{regione}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {perRegione[regione].map((c) => (
                  <Link key={c.slug} href={`/qualita-aria/${c.slug}`}
                    className="bg-white rounded-xl border border-gray-200 px-3 py-2.5 flex items-center justify-between hover:border-green-400 hover:shadow-sm transition-all group">
                    <div>
                      <div className="font-medium text-sm text-gray-800 group-hover:text-green-700">{c.nome}</div>
                      <div className="text-xs text-gray-400">{c.sigla}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-700">{c.aqi}</div>
                      <div className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${AQI_BADGE[c.aqi_categoria] ?? "bg-gray-100 text-gray-500"}`}>
                        {c.aqi_categoria}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INFO */}
      <div className="flex items-start gap-3 text-xs text-gray-400 bg-white rounded-xl border border-gray-100 px-4 py-3">
        <span className="text-base mt-0.5">ℹ️</span>
        <span>
          Dati di qualità dell&apos;aria forniti da{" "}
          <a href="https://atmosphere.copernicus.eu" target="_blank" rel="noopener noreferrer" className="text-green-700 underline">
            Copernicus Atmosphere Monitoring Service (CAMS)
          </a>{" "}
          tramite Open-Meteo. L&apos;Indice Europeo di Qualità dell&apos;Aria (EAQI) è calcolato
          su PM2.5, PM10, NO₂, O₃ seguendo la metodologia dell&apos;Agenzia Europea dell&apos;Ambiente (EEA).
          Aggiornamento automatico ogni ora.
        </span>
      </div>

    </div>
  );
}
