import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Pollutant {
  valore: number;
  unita: string;
  categoria: string;
}

interface CittaAria {
  slug: string;
  nome: string;
  sigla: string;
  regione: string;
  aggiornato: string;
  aqi: number;
  aqi_categoria: string;
  aqi_colore: string;
  aqi_idx: number;
  pollutanti: {
    pm25?: Pollutant | null;
    pm10?: Pollutant | null;
    no2?: Pollutant | null;
    o3?: Pollutant | null;
    co?: Pollutant | null;
  };
}

interface IndexEntry {
  slug: string;
  nome: string;
  sigla: string;
  regione: string;
  aqi: number;
  aqi_categoria: string;
}

interface AriaIndex {
  citta: IndexEntry[];
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

const AQI_BADGE: Record<string, string> = {
  "Buono": "bg-green-100 text-green-700",
  "Discreto": "bg-yellow-100 text-yellow-700",
  "Moderato": "bg-orange-100 text-orange-700",
  "Scarso": "bg-red-100 text-red-700",
  "Molto Scarso": "bg-purple-100 text-purple-700",
  "Pericoloso": "bg-red-200 text-red-900",
};

const AQI_BG: Record<string, string> = {
  "Buono": "bg-green-50 border-green-200",
  "Discreto": "bg-yellow-50 border-yellow-200",
  "Moderato": "bg-orange-50 border-orange-200",
  "Scarso": "bg-red-50 border-red-200",
  "Molto Scarso": "bg-purple-50 border-purple-200",
  "Pericoloso": "bg-red-100 border-red-300",
};

const AQI_TEXT: Record<string, string> = {
  "Buono": "text-green-700",
  "Discreto": "text-yellow-600",
  "Moderato": "text-orange-600",
  "Scarso": "text-red-600",
  "Molto Scarso": "text-purple-700",
  "Pericoloso": "text-red-900",
};

const CONSIGLI: Record<string, string> = {
  "Buono": "La qualità dell'aria è ottimale. Puoi svolgere attività all'aperto senza restrizioni.",
  "Discreto": "La qualità dell'aria è accettabile. Le persone molto sensibili possono avvertire leggeri effetti.",
  "Moderato": "Le persone sensibili (bambini, anziani, malati di cuore/polmoni) dovrebbero limitare le attività prolungate all'aperto.",
  "Scarso": "Tutti possono avvertire effetti sulla salute. Limitare le attività all'aperto, specialmente quelle intense.",
  "Molto Scarso": "Gravi effetti sulla salute per tutti. Evitare le attività all'aperto e tenere le finestre chiuse.",
  "Pericoloso": "Emergenza sanitaria. Restare al chiuso, evitare qualsiasi attività all'aperto.",
};

const POLLUTANT_LABELS: Record<string, string> = {
  pm25: "PM2.5",
  pm10: "PM10",
  no2: "NO₂",
  o3: "O₃",
  co: "CO",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = loadJSON<CittaAria>(`aria/${slug}.json`);
  if (!c) return {};
  return {
    title: `Qualità dell'Aria ${c.nome} (${c.sigla}) — AQI ${c.aqi} Oggi`,
    description: `Qualità dell'aria a ${c.nome} oggi: indice AQI ${c.aqi} (${c.aqi_categoria}). PM2.5: ${c.pollutanti.pm25?.valore ?? "—"} µg/m³, PM10: ${c.pollutanti.pm10?.valore ?? "—"} µg/m³, NO₂: ${c.pollutanti.no2?.valore ?? "—"} µg/m³. Dati CAMS Copernicus.`,
    alternates: { canonical: `/qualita-aria/${slug}` },
  };
}

export async function generateStaticParams() {
  const data = loadJSON<AriaIndex>("aria/index.json");
  if (!data) return [];
  return data.citta.map(c => ({ slug: c.slug }));
}

export default async function QualitaAriaSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = loadJSON<CittaAria>(`aria/${slug}.json`);
  if (!c) notFound();

  const dataFmt = new Date(c.aggiornato).toLocaleString("it-IT", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  // Altre città della stessa regione
  const indice = loadJSON<AriaIndex>("aria/index.json");
  const altreCitta = (indice?.citta ?? [])
    .filter(x => x.regione === c.regione && x.slug !== c.slug)
    .slice(0, 6);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `Qualità dell'Aria ${c.nome} (${c.sigla}) — Indice AQI`,
    "description": `Indice europeo di qualità dell'aria per ${c.nome}, ${c.regione}. AQI: ${c.aqi} (${c.aqi_categoria}). Inquinanti: PM2.5, PM10, NO2, Ozono. Dati Copernicus CAMS.`,
    "url": `https://www.prezzioggi.com/qualita-aria/${c.slug}`,
    "creator": {
      "@type": "Organization",
      "name": "Copernicus Atmosphere Monitoring Service (CAMS)",
      "url": "https://atmosphere.copernicus.eu",
    },
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "dateModified": c.aggiornato,
    "spatialCoverage": { "@type": "Place", "name": `${c.nome}, ${c.regione}, Italia` },
    "variableMeasured": "Indice Europeo Qualità dell'Aria (EAQI)",
  };

  return (
    <div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* BREADCRUMB */}
      <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>›</span>
        <Link href="/qualita-aria" className="hover:text-green-700">Qualità dell&apos;Aria</Link>
        <span>›</span>
        <span className="text-gray-600 font-medium">{c.nome}</span>
      </nav>

      {/* TITOLO */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Qualità dell&apos;Aria a {c.nome} ({c.sigla}) Oggi
        </h1>
        <p className="text-sm text-gray-500">
          {c.regione} · Aggiornato il <strong className="text-gray-700">{dataFmt}</strong> · Fonte Copernicus CAMS
        </p>
      </div>

      {/* AQI PRINCIPALE */}
      <div className={`rounded-2xl border p-6 mb-8 ${AQI_BG[c.aqi_categoria] ?? "bg-gray-50 border-gray-200"}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Indice Europeo di Qualità dell&apos;Aria (EAQI)</div>
            <div className="flex items-baseline gap-3">
              <span className={`text-6xl font-black ${AQI_TEXT[c.aqi_categoria] ?? "text-gray-700"}`}>{c.aqi}</span>
              <span className={`text-xl font-bold ${AQI_TEXT[c.aqi_categoria] ?? "text-gray-700"}`}>{c.aqi_categoria}</span>
            </div>
          </div>
          <div className="text-sm text-gray-600 max-w-sm">
            {CONSIGLI[c.aqi_categoria]}
          </div>
        </div>
      </div>

      {/* POLLUTANTI */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-800 mb-3">Inquinanti rilevati</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["pm25", "pm10", "no2", "o3"] as const).map((key) => {
            const p = c.pollutanti[key];
            if (!p) return null;
            return (
              <div key={key} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    {POLLUTANT_LABELS[key]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${AQI_BADGE[p.categoria] ?? "bg-gray-100 text-gray-500"}`}>
                    {p.categoria}
                  </span>
                </div>
                <div className={`text-3xl font-bold ${AQI_TEXT[p.categoria] ?? "text-gray-700"}`}>
                  {p.valore}
                  <span className="text-sm font-normal text-gray-400 ml-1">{p.unita}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* INFO AGGIORNAMENTO */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-8 bg-white rounded-xl border border-gray-100 px-4 py-3">
        <span>ℹ️</span>
        <span>
          Dati{" "}
          <a href="https://atmosphere.copernicus.eu" target="_blank" rel="noopener noreferrer" className="text-green-700 underline">
            Copernicus CAMS
          </a>
          {" "}(EU Atmosphere Monitoring Service) · Aggiornamento orario · Metodologia{" "}
          <a href="https://www.eea.europa.eu/themes/air" target="_blank" rel="noopener noreferrer" className="text-green-700 underline">EEA</a>
        </span>
      </div>

      {/* ALTRE CITTÀ STESSA REGIONE */}
      {altreCitta.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold text-gray-800 mb-3">Altre città in {c.regione}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {altreCitta.map((altra) => (
              <Link key={altra.slug} href={`/qualita-aria/${altra.slug}`}
                className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between hover:border-green-400 hover:shadow-sm transition-all group">
                <div>
                  <div className="font-medium text-sm text-gray-800 group-hover:text-green-700">{altra.nome}</div>
                  <div className="text-xs text-gray-400">{altra.sigla}</div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${AQI_BADGE[altra.aqi_categoria] ?? "bg-gray-100 text-gray-500"}`}>
                  {altra.aqi} — {altra.aqi_categoria}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SEO TEXT */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 prose prose-sm max-w-none text-gray-600">
        <h2 className="text-gray-800">Qualità dell&apos;Aria a {c.nome} — Analisi Oggi</h2>
        <p>
          L&apos;indice europeo di qualità dell&apos;aria (EAQI) a <strong>{c.nome}</strong> ({c.sigla}),{" "}
          {c.regione}, è attualmente di <strong>{c.aqi}</strong>, corrispondente alla categoria{" "}
          <strong>{c.aqi_categoria}</strong>.{" "}
          {c.pollutanti.pm25 && (
            <>Il particolato fine PM2.5 è pari a <strong>{c.pollutanti.pm25.valore} µg/m³</strong> ({c.pollutanti.pm25.categoria}). </>
          )}
          {c.pollutanti.pm10 && (
            <>Il PM10 è pari a <strong>{c.pollutanti.pm10.valore} µg/m³</strong> ({c.pollutanti.pm10.categoria}). </>
          )}
        </p>
        <p>
          {c.pollutanti.no2 && (
            <>Il biossido di azoto (NO₂) rilevato è <strong>{c.pollutanti.no2.valore} µg/m³</strong>{" "}
            ({c.pollutanti.no2.categoria}), tipicamente associato al traffico veicolare. </>
          )}
          {c.pollutanti.o3 && (
            <>L&apos;ozono (O₃) è a <strong>{c.pollutanti.o3.valore} µg/m³</strong> ({c.pollutanti.o3.categoria}).</>
          )}
        </p>
        <p>
          I dati sono forniti dal Copernicus Atmosphere Monitoring Service (CAMS) dell&apos;Unione Europea
          e aggiornati ogni ora. Per consultare la qualità dell&apos;aria nelle altre città italiane,
          consulta l&apos;<Link href="/qualita-aria" className="text-green-700">indice completo per tutti i capoluoghi</Link>.
        </p>
      </section>

    </div>
  );
}
