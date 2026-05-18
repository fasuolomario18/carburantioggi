import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PrezzoCarb {
  label: string;
  self_media: number | null;
  servito_media: number | null;
  self_min: number | null;
}

interface Provincia {
  sigla: string;
  nome: string;
  regione: string;
  slug: string;
  aggiornato: string;
  impianti_count: number;
  prezzi: Record<string, PrezzoCarb>;
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

function regioneSlug(regione: string) {
  return regione.toLowerCase()
    .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u").replace(/['/]/g, "-")
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

const ICONE: Record<string, string> = {
  benzina: "⛽",
  gasolio: "🛢️",
  gpl: "💨",
  metano: "🔵",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const province = loadJSON<Record<string, Provincia>>("province.json");
  const p = province?.[slug];
  if (!p) return {};
  const benzina = p.prezzi?.benzina?.self_media;
  const gasolio = p.prezzi?.gasolio?.self_media;
  return {
    title: `Prezzi Benzina ${p.nome} (${p.sigla}) Oggi`,
    description: `Prezzi benzina e gasolio a ${p.nome} aggiornati oggi. ${benzina ? `Benzina self: €${benzina.toFixed(3)}` : ""}${gasolio ? ` · Gasolio self: €${gasolio.toFixed(3)}` : ""}. Fonte MIMIT.`,
    alternates: { canonical: `/province/${slug}` },
  };
}

export async function generateStaticParams() {
  const province = loadJSON<Record<string, Provincia>>("province.json");
  if (!province) return [];
  return Object.keys(province).map((slug) => ({ slug }));
}

export default async function ProvinciaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const province = loadJSON<Record<string, Provincia>>("province.json");
  const p = province?.[slug];
  if (!p) notFound();

  const dataFmt = new Date(p.aggiornato).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const carburanti = ["benzina", "gasolio", "gpl", "metano"];
  const regSlug = regioneSlug(p.regione);

  // Province della stessa regione (per navigazione laterale)
  const altreProvince = Object.values(province ?? {})
    .filter(pr => pr.regione === p.regione && pr.slug !== p.slug)
    .slice(0, 6);

  const benzSelf = p.prezzi?.benzina?.self_media;
  const gasSelf = p.prezzi?.gasolio?.self_media;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `Prezzi Carburanti ${p.nome} (${p.sigla}) — Aggiornati Oggi`,
    "description": `Prezzi benzina e gasolio a ${p.nome}, ${p.regione}. ${benzSelf ? `Benzina self: €${benzSelf.toFixed(3)}/L.` : ""} ${gasSelf ? `Gasolio self: €${gasSelf.toFixed(3)}/L.` : ""} Dati MIMIT ufficiali.`,
    "url": `https://www.prezzioggi.com/province/${p.slug}`,
    "creator": { "@type": "Organization", "name": "MIMIT — Ministero delle Imprese", "url": "https://www.mimit.gov.it" },
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "dateModified": p.aggiornato,
    "spatialCoverage": { "@type": "Place", "name": `${p.nome}, ${p.regione}, Italia` },
  };

  return (
    <div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* BREADCRUMB */}
      <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>›</span>
        <Link href="/province" className="hover:text-green-700">Province</Link>
        <span>›</span>
        <Link href={`/regioni/${regSlug}`} className="hover:text-green-700">{p.regione}</Link>
        <span>›</span>
        <span className="text-gray-600 font-medium">{p.nome}</span>
      </nav>

      {/* TITOLO */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Prezzi Benzina {p.nome} ({p.sigla}) Oggi
        </h1>
        <p className="text-sm text-gray-500">
          Monitorati ogni giorno · Aggiornati al <strong className="text-gray-700">{dataFmt}</strong> · {p.impianti_count} impianti rilevati
        </p>
      </div>

      {/* CARDS PREZZI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {carburanti.map((carb) => {
          const pr = p.prezzi?.[carb];
          if (!pr) return null;
          const risparmio = pr.self_media && pr.self_min ? (pr.self_media - pr.self_min) : null;
          return (
            <div key={carb} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{pr.label}</span>
                <span className="text-lg">{ICONE[carb]}</span>
              </div>

              {/* Media self */}
              {pr.self_media && (
                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-0.5">Media self</div>
                  <div className="text-3xl font-bold" style={{ color: "#16a34a" }}>
                    {pr.self_media.toFixed(3)}
                    <span className="text-sm font-normal text-gray-400 ml-1">€/l</span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                {/* Minimo trovato */}
                {pr.self_min && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Minimo trovato</span>
                    <span className="font-semibold text-green-600">{pr.self_min.toFixed(3)} €</span>
                  </div>
                )}
                {/* Servito */}
                {pr.servito_media && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Servito</span>
                    <span className="font-medium text-gray-700">{pr.servito_media.toFixed(3)} €</span>
                  </div>
                )}
                {/* Potenziale risparmio */}
                {risparmio && risparmio > 0.005 && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                    <span className="text-gray-500">Risparmio possibile</span>
                    <span className="font-semibold text-amber-600">-{risparmio.toFixed(3)} €</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* INFO AGGIORNAMENTO */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-8 bg-white rounded-xl border border-gray-100 px-4 py-3">
        <span>ℹ️</span>
        <span>
          Dati comunicati dagli esercenti al{" "}
          <a href="https://carburanti.mise.gov.it" target="_blank" rel="noopener noreferrer" className="text-green-700 underline">MIMIT</a>
          {" "}· Aggiornamento automatico ogni giorno alle 6:00 · {p.impianti_count} impianti nella zona
        </span>
      </div>

      {/* PROVINCE VICINE */}
      {altreProvince.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold text-gray-800 mb-3">Altre province in {p.regione}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {altreProvince.map((pr) => {
              const benz = pr.prezzi?.benzina?.self_media;
              return (
                <Link key={pr.slug} href={`/province/${pr.slug}`}
                  className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between hover:border-green-400 hover:shadow-sm transition-all group">
                  <div>
                    <div className="font-medium text-sm text-gray-800 group-hover:text-green-700">{pr.nome}</div>
                    <div className="text-xs text-gray-400">{pr.sigla}</div>
                  </div>
                  {benz && (
                    <span className="text-sm font-bold" style={{ color: "#16a34a" }}>{benz.toFixed(3)}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* SEO TEXT */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 prose prose-sm max-w-none text-gray-600">
        <h2 className="text-gray-800">Prezzi Carburanti a {p.nome} Oggi</h2>
        <p>
          I prezzi della benzina e del gasolio a <strong>{p.nome}</strong> ({p.sigla}) vengono aggiornati ogni giorno
          sulla base delle comunicazioni degli esercenti al Ministero delle Imprese e del Made in Italy (MIMIT),
          come previsto dalla Legge Sviluppo n. 99/2009. I dati mostrati sono ufficiali e gratuiti.
        </p>
        <p>
          I valori rappresentano la <strong>media degli impianti attivi</strong> rilevati nel raggio di 15 km dal
          capoluogo di {p.nome}, aggiornata ogni mattina alle 6:00. Il <strong>prezzo minimo</strong> indica il
          distributore più conveniente rilevato nell&apos;area.
        </p>
        <p>
          Per confrontare con le province vicine consulta la sezione{" "}
          <Link href={`/regioni/${regSlug}`} className="text-green-700">{p.regione}</Link>, oppure
          torna all&apos;<Link href="/province" className="text-green-700">elenco completo delle province italiane</Link>.
        </p>
      </section>

    </div>
  );
}
