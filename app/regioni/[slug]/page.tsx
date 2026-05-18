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

interface Regione {
  nome: string;
  slug: string;
  aggiornato: string;
  impianti_count: number;
  prezzi: Record<string, PrezzoCarb>;
}

interface Indice {
  province: { slug: string; nome: string; sigla: string; regione: string }[];
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

function fmt(val: number | null) {
  if (!val) return "—";
  return `€ ${val.toFixed(3)}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const regioni = loadJSON<Record<string, Regione>>("regioni.json");
  const r = regioni?.[slug];
  if (!r) return {};
  const benzina = r.prezzi?.benzina?.self_media;
  return {
    title: `Prezzi Carburanti ${r.nome}`,
    description: `Prezzi benzina e gasolio in ${r.nome} aggiornati oggi. ${benzina ? `Benzina self media: €${benzina.toFixed(3)}.` : ""} Dati MIMIT ufficiali.`,
    alternates: { canonical: `/regioni/${slug}` },
  };
}

export async function generateStaticParams() {
  const indice = loadJSON<Indice>("indice.json");
  const regioni = loadJSON<Record<string, Regione>>("regioni.json");
  if (!regioni) return [];
  return Object.keys(regioni).map((slug) => ({ slug }));
}

export default async function RegionePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const regioni = loadJSON<Record<string, Regione>>("regioni.json");
  const r = regioni?.[slug];
  if (!r) notFound();

  const indice = loadJSON<Indice>("indice.json");
  const provinceRegione = indice?.province.filter(p => {
    const rNome = r.nome.toLowerCase();
    return p.regione.toLowerCase() === rNome;
  }) ?? [];

  const dataFmt = new Date(r.aggiornato).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const carburanti = ["benzina", "gasolio", "gpl", "metano"];

  return (
    <div>
      <div className="mb-2 text-sm text-gray-400">
        <Link href="/" className="hover:underline">Home</Link> › <Link href="/regioni" className="hover:underline">Regioni</Link> › {r.nome}
      </div>

      <h1 className="text-3xl font-bold mb-1">Prezzi Carburanti {r.nome}</h1>
      <p className="text-gray-500 mb-8">
        Aggiornati al <strong>{dataFmt}</strong> · {r.impianti_count} impianti rilevati
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {carburanti.map((carb) => {
          const p = r.prezzi?.[carb];
          if (!p) return null;
          return (
            <div key={carb} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">{p.label}</div>
              {p.self_media && (
                <div className="mb-1">
                  <div className="text-xs text-gray-400">Self · media</div>
                  <div className="text-2xl font-bold text-green-700">{fmt(p.self_media)}</div>
                </div>
              )}
              {p.self_min && (
                <div className="mb-1">
                  <div className="text-xs text-gray-400">Self · minimo</div>
                  <div className="text-lg font-semibold text-green-600">{fmt(p.self_min)}</div>
                </div>
              )}
              {p.servito_media && (
                <div className="text-sm text-gray-500">Servito: {fmt(p.servito_media)}</div>
              )}
            </div>
          );
        })}
      </div>

      {provinceRegione.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Province di {r.nome}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {provinceRegione.map((p) => (
              <Link key={p.slug} href={`/province/${p.slug}`}
                className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between hover:border-green-400 transition-colors">
                <span className="font-medium">{p.nome}</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{p.sigla}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 prose prose-sm max-w-none text-gray-600">
        <h2>Prezzi Benzina e Gasolio in {r.nome}</h2>
        <p>
          I prezzi dei carburanti in <strong>{r.nome}</strong> vengono aggiornati ogni giorno sulla base delle comunicazioni
          degli esercenti al Ministero delle Imprese e del Made in Italy (MIMIT). I valori mostrati rappresentano la media
          degli impianti attivi nella regione rilevati nelle ultime 24 ore.
        </p>
        <p>
          Per trovare il distributore più economico vicino a te, consulta la pagina della tua provincia tra quelle elencate sopra.
        </p>
      </section>
    </div>
  );
}
