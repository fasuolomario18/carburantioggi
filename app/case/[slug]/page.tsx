import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface ZonaOMI {
  nome: string;
  res_min: number;
  res_max: number;
  loc_min: number;
  loc_max: number;
}

interface ComuneDetail {
  slug: string;
  nome: string;
  provincia: string;
  regione: string;
  aggiornato: string;
  zone: ZonaOMI[];
  residenziale_media: number;
  residenziale_min: number;
  residenziale_max: number;
  affitto_media: number;
  n_zone: number;
  fonte: string;
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = loadJSON<ComuneDetail>(`case/${slug}.json`);
  if (!c) return {};
  return {
    title: `Prezzi Case e Affitti ${c.nome} — Dati OMI ${c.aggiornato}`,
    description: `Prezzi immobili a ${c.nome} (${c.provincia}): da €${c.residenziale_min.toLocaleString("it-IT")}/m² a €${c.residenziale_max.toLocaleString("it-IT")}/m². Affitti da €${c.affitto_media}/m²/mese. Dati OMI ufficiali.`,
  };
}

export async function generateStaticParams() {
  const data = loadJSON<{ comuni: { slug: string }[] }>("case/index.json");
  if (!data) return [];
  return data.comuni.map(c => ({ slug: c.slug }));
}

export default async function ComuneCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = loadJSON<ComuneDetail>(`case/${slug}.json`);
  if (!c) notFound();

  // Stima mutuo per appartamento medio (80m²)
  const prezzoAppt80 = c.residenziale_media * 80;
  const mutuoMensile = Math.round((prezzoAppt80 * 0.8) * (0.035 / 12) / (1 - Math.pow(1 + 0.035 / 12, -300)));

  return (
    <div>

      {/* BREADCRUMB */}
      <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>›</span>
        <Link href="/case" className="hover:text-green-700">Prezzi Case</Link>
        <span>›</span>
        <span className="text-gray-600 font-medium">{c.nome}</span>
      </nav>

      {/* TITOLO */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Prezzi Case a {c.nome}
        </h1>
        <p className="text-sm text-gray-500">
          {c.provincia} · {c.regione} · Semestre{" "}
          <strong className="text-gray-700">{c.aggiornato}</strong>
          {" "}· {c.n_zone} zone OMI · Fonte {c.fonte}
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="text-xs text-gray-400 mb-1">Prezzo medio</div>
          <div className="text-3xl font-bold" style={{ color: "#16a34a" }}>
            {c.residenziale_media.toLocaleString("it-IT")}
            <span className="text-sm font-normal text-gray-400 ml-1">€/m²</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">residenziale</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="text-xs text-gray-400 mb-1">Prezzo minimo</div>
          <div className="text-3xl font-bold text-gray-700">
            {c.residenziale_min.toLocaleString("it-IT")}
            <span className="text-sm font-normal text-gray-400 ml-1">€/m²</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">zona più economica</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="text-xs text-gray-400 mb-1">Prezzo massimo</div>
          <div className="text-3xl font-bold text-gray-700">
            {c.residenziale_max.toLocaleString("it-IT")}
            <span className="text-sm font-normal text-gray-400 ml-1">€/m²</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">zona pregiata</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="text-xs text-gray-400 mb-1">Affitto medio</div>
          <div className="text-3xl font-bold" style={{ color: "#16a34a" }}>
            {c.affitto_media}
            <span className="text-sm font-normal text-gray-400 ml-1">€/m²/mese</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">canone mensile</div>
        </div>
      </div>

      {/* STIMA PRATICA */}
      <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-8 flex flex-wrap items-center gap-4">
        <span className="text-2xl">🏠</span>
        <div className="flex-1">
          <div className="font-semibold text-green-800 text-sm">Appartamento 80m² a prezzo medio a {c.nome}</div>
          <div className="text-xs text-green-700 mt-0.5">
            Costo: <strong>€{(c.residenziale_media * 80).toLocaleString("it-IT")}</strong>
            {" "}· Affitto stimato: <strong>€{(c.affitto_media * 80).toLocaleString("it-IT")}/mese</strong>
            {" "}· Mutuo 25 anni (80% finanz.): <strong>~€{mutuoMensile.toLocaleString("it-IT")}/mese</strong>
          </div>
        </div>
      </div>

      {/* TABELLA ZONE */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-800 mb-3">Prezzi per zona — {c.nome}</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-12 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Zona</div>
            <div className="col-span-2 text-center">Min €/m²</div>
            <div className="col-span-2 text-center">Max €/m²</div>
            <div className="col-span-2 text-center">Affitto min</div>
            <div className="col-span-2 text-center">Affitto max</div>
          </div>
          {c.zone.map((zona, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-0 px-4 py-3.5 hover:bg-gray-50 transition-colors"
              style={{ borderBottom: i < c.zone.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <div className="col-span-2 md:col-span-4 font-medium text-sm text-gray-800">{zona.nome}</div>
              <div className="col-span-1 md:col-span-2 text-sm text-center font-semibold" style={{ color: "#16a34a" }}>
                {zona.res_min.toLocaleString("it-IT")}
              </div>
              <div className="col-span-1 md:col-span-2 text-sm text-center font-semibold text-gray-700">
                {zona.res_max.toLocaleString("it-IT")}
              </div>
              <div className="col-span-1 md:col-span-2 text-xs text-center text-gray-500">
                €{zona.loc_min}/mese
              </div>
              <div className="col-span-1 md:col-span-2 text-xs text-center text-gray-500">
                €{zona.loc_max}/mese
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">* Affitti espressi in €/m²/mese. Prezzo mensile totale = valore × superficie appartamento.</p>
      </section>

      {/* INFO */}
      <div className="flex items-start gap-3 text-xs text-gray-400 mb-8 bg-white rounded-xl border border-gray-100 px-4 py-3">
        <span className="text-base mt-0.5">ℹ️</span>
        <span>
          Dati OMI — Agenzia delle Entrate, {c.aggiornato}.
          I prezzi rappresentano intervalli di valori normali per immobili in stato conservativo normale.
          Possono variare in base alle condizioni effettive dell&apos;immobile, al piano, all&apos;esposizione e al mercato corrente.
          Consulta sempre un agente immobiliare abilitato per valutazioni specifiche.
        </span>
      </div>

      {/* LINK ZONA */}
      <div className="flex gap-3 flex-wrap mb-8">
        <Link href="/case" className="text-sm text-green-700 hover:underline">← Tutti i comuni</Link>
      </div>

      {/* SEO TEXT */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 prose prose-sm max-w-none text-gray-600">
        <h2 className="text-gray-800">Mercato immobiliare a {c.nome} — Analisi {c.aggiornato}</h2>
        <p>
          I prezzi delle case a <strong>{c.nome}</strong> ({c.provincia}) variano da
          <strong> €{c.residenziale_min.toLocaleString("it-IT")}/m²</strong> nelle zone periferiche a
          <strong> €{c.residenziale_max.toLocaleString("it-IT")}/m²</strong> nelle zone più pregiate,
          con una media di <strong>€{c.residenziale_media.toLocaleString("it-IT")}/m²</strong>.
        </p>
        <p>
          Per quanto riguarda il <strong>mercato degli affitti</strong>, il canone mensile medio si aggira
          intorno a <strong>€{c.affitto_media}/m²/mese</strong>: per un appartamento di 80m² si traduce
          in circa €{(c.affitto_media * 80).toLocaleString("it-IT")}/mese.
        </p>
        <p>
          I dati provengono dall&apos;Osservatorio del Mercato Immobiliare (OMI) dell&apos;Agenzia delle Entrate
          e sono aggiornati al {c.aggiornato}.
          Consulta l&apos;<Link href="/case" className="text-green-700">elenco completo dei comuni</Link> per confrontare i prezzi con altre città.
        </p>
      </section>

    </div>
  );
}
