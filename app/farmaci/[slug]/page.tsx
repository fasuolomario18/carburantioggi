import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Farmaco {
  nome: string;
  ditta: string;
  prezzo: number | null;
  fascia: string;
  rimborso: boolean;
}

interface PrincipioAttivoDetail {
  slug: string;
  nome: string;
  atc: string;
  categoria_atc: string;
  n_farmaci: number;
  prezzo_min: number | null;
  prezzo_medio: number | null;
  ha_rimborsato: boolean;
  aggiornato: string;
  farmaci: Farmaco[];
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = loadJSON<PrincipioAttivoDetail>(`farmaci/${slug}.json`);
  if (!p) return {};
  return {
    title: `${p.nome} — Prezzi e Farmaci Equivalenti`,
    description: `Prezzi di ${p.nome} in farmacia. ${p.n_farmaci} farmaci disponibili. Da €${p.prezzo_min?.toFixed(2) ?? "—"}. ${p.ha_rimborsato ? "Rimborsato dal SSN." : "Fascia C."} Dati AIFA aggiornati.`,
  };
}

export async function generateStaticParams() {
  const data = loadJSON<{ principi_attivi: { slug: string }[] }>("farmaci/index.json");
  if (!data) return [];
  return data.principi_attivi.map(p => ({ slug: p.slug }));
}

export default async function FarmacoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = loadJSON<PrincipioAttivoDetail>(`farmaci/${slug}.json`);
  if (!p) notFound();

  const dataFmt = new Date(p.aggiornato).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const farmaciOrdinati = [...p.farmaci].sort((a, b) => (a.prezzo ?? 9999) - (b.prezzo ?? 9999));
  const risparmioMax = p.prezzo_medio && p.prezzo_min ? Math.round((p.prezzo_medio - p.prezzo_min) * 100) / 100 : null;

  return (
    <div>

      {/* BREADCRUMB */}
      <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>›</span>
        <Link href="/farmaci" className="hover:text-green-700">Farmaci</Link>
        <span>›</span>
        <span className="text-gray-600 font-medium">{p.nome}</span>
      </nav>

      {/* TITOLO */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{p.nome}</h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.ha_rimborsato ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {p.ha_rimborsato ? "Fascia A — SSN" : "Fascia C"}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Codice ATC: <span className="font-mono text-gray-700">{p.atc}</span>
          {" "}· {p.categoria_atc}
          {" "}· Aggiornato al <strong className="text-gray-700">{dataFmt}</strong>
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="text-xs text-gray-400 mb-1">Prezzo minimo</div>
          <div className="text-2xl font-bold" style={{ color: "#16a34a" }}>
            {p.prezzo_min ? `€${p.prezzo_min.toFixed(2)}` : "—"}
          </div>
          <div className="text-xs text-gray-400 mt-1">generico più economico</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="text-xs text-gray-400 mb-1">Prezzo medio</div>
          <div className="text-2xl font-bold text-gray-700">
            {p.prezzo_medio ? `€${p.prezzo_medio.toFixed(2)}` : "—"}
          </div>
          <div className="text-xs text-gray-400 mt-1">media tutti i farmaci</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="text-xs text-gray-400 mb-1">Farmaci disponibili</div>
          <div className="text-2xl font-bold text-gray-700">{p.n_farmaci}</div>
          <div className="text-xs text-gray-400 mt-1">branded + generici</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="text-xs text-gray-400 mb-1">Risparmio max</div>
          <div className="text-2xl font-bold text-amber-600">
            {risparmioMax && risparmioMax > 0 ? `-€${risparmioMax.toFixed(2)}` : "—"}
          </div>
          <div className="text-xs text-gray-400 mt-1">scegliendo il generico</div>
        </div>
      </div>

      {/* TABELLA FARMACI */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-800 mb-3">
          Farmaci a base di {p.nome} — confronto prezzi
        </h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-5">Farmaco</div>
            <div className="col-span-3">Azienda</div>
            <div className="col-span-2 text-center">Fascia</div>
            <div className="col-span-2 text-right">Prezzo</div>
          </div>
          {farmaciOrdinati.map((f, i) => (
            <div key={i}
              className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
              style={{ borderBottom: i < farmaciOrdinati.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <div className="col-span-2 md:col-span-5 font-medium text-sm text-gray-800">{f.nome}</div>
              <div className="col-span-1 md:col-span-3 text-xs text-gray-500 flex items-center">{f.ditta}</div>
              <div className="col-span-1 md:col-span-2 flex items-center md:justify-center">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.rimborso ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {f.fascia}
                </span>
              </div>
              <div className="col-span-2 md:col-span-2 flex items-center justify-end">
                {f.prezzo ? (
                  <span className="font-bold text-sm" style={{ color: "#16a34a" }}>€{f.prezzo.toFixed(2)}</span>
                ) : (
                  <span className="text-xs text-gray-300">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INFO */}
      <div className="flex items-start gap-3 text-xs text-gray-400 mb-8 bg-white rounded-xl border border-gray-100 px-4 py-3">
        <span className="text-base mt-0.5">ℹ️</span>
        <span>
          Prezzi indicativi da <a href="https://www.aifa.gov.it" target="_blank" rel="noopener noreferrer" className="text-green-700 underline">AIFA</a>.
          I farmaci in fascia A sono rimborsati dal SSN con ricetta medica (ticket variabile per regione).
          I farmaci equivalenti hanno lo stesso principio attivo e la stessa efficacia dei branded.
          Il prezzo al pubblico può variare leggermente tra farmacie per i farmaci in fascia C.
        </span>
      </div>

      {/* SEO TEXT */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 prose prose-sm max-w-none text-gray-600">
        <h2 className="text-gray-800">{p.nome}: guida ai prezzi e agli equivalenti</h2>
        <p>
          Il <strong>{p.nome}</strong> (codice ATC: {p.atc}) appartiene alla categoria <strong>{p.categoria_atc}</strong>.
          In Italia sono disponibili {p.n_farmaci} farmaci a base di questo principio attivo,
          con prezzi che variano da €{p.prezzo_min?.toFixed(2) ?? "—"} a €{farmaciOrdinati[farmaciOrdinati.length - 1]?.prezzo?.toFixed(2) ?? "—"}.
        </p>
        <p>
          {p.ha_rimborsato
            ? `Alcuni farmaci a base di ${p.nome} sono classificati in fascia A e quindi rimborsati dal Servizio Sanitario Nazionale con prescrizione medica.`
            : `I farmaci a base di ${p.nome} sono in fascia C: si acquistano in farmacia a prezzo pieno, senza rimborso SSN.`
          }
          {" "}Il farmaco generico (equivalente) è la scelta più conveniente: stessa efficacia, prezzo più basso.
        </p>
        <p>
          Torna all&apos;<Link href="/farmaci" className="text-green-700">elenco completo dei farmaci</Link> per confrontare altri principi attivi.
        </p>
      </section>

    </div>
  );
}
