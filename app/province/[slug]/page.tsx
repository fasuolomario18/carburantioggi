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

function fmt(val: number | null) {
  if (!val) return "—";
  return `€ ${val.toFixed(3)}`;
}

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
  const regioneSlug = p.regione.toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u').replace(/['/]/g, '-')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  return (
    <div>
      <div className="mb-2 text-sm text-gray-400">
        <Link href="/" className="hover:underline">Home</Link> ›{" "}
        <Link href="/province" className="hover:underline">Province</Link> ›{" "}
        <Link href={`/regioni/${regioneSlug}`} className="hover:underline">{p.regione}</Link> › {p.nome}
      </div>

      <h1 className="text-3xl font-bold mb-1">
        Prezzi Benzina {p.nome} ({p.sigla}) Oggi
      </h1>
      <p className="text-gray-500 mb-8">
        Aggiornati al <strong>{dataFmt}</strong> · {p.impianti_count} impianti rilevati nel raggio di 15 km
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {carburanti.map((carb) => {
          const pr = p.prezzi?.[carb];
          if (!pr) return null;
          return (
            <div key={carb} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">{pr.label}</div>
              {pr.self_media && (
                <div className="mb-1">
                  <div className="text-xs text-gray-400">Self · media</div>
                  <div className="text-2xl font-bold text-green-700">{fmt(pr.self_media)}</div>
                </div>
              )}
              {pr.self_min && pr.self_min < (pr.self_media ?? 999) && (
                <div className="mb-1">
                  <div className="text-xs text-gray-400">Self · minimo trovato</div>
                  <div className="text-lg font-semibold text-green-600">{fmt(pr.self_min)}</div>
                </div>
              )}
              {pr.servito_media && (
                <div className="text-sm text-gray-500 mt-1">Servito: {fmt(pr.servito_media)}</div>
              )}
            </div>
          );
        })}
      </div>

      <section className="prose prose-sm max-w-none text-gray-600">
        <h2>Prezzi Carburanti a {p.nome} Oggi</h2>
        <p>
          I prezzi della benzina e del gasolio a <strong>{p.nome}</strong> ({p.sigla}) vengono aggiornati ogni giorno
          sulla base delle comunicazioni degli esercenti al Ministero delle Imprese e del Made in Italy (MIMIT),
          come previsto dalla Legge Sviluppo n. 99/2009.
        </p>
        <p>
          I prezzi mostrati rappresentano la <strong>media degli impianti attivi</strong> nella provincia di {p.nome},
          calcolata sulle comunicazioni delle ultime 24 ore. Il prezzo &quot;minimo trovato&quot; indica il distributore
          più economico rilevato nell&apos;area.
        </p>
        <p>
          Per confrontare i prezzi nelle province vicine, consulta la sezione <Link href={`/regioni/${regioneSlug}`}>{p.regione}</Link> o
          torna all&apos;<Link href="/province">elenco completo delle province</Link>.
        </p>
      </section>
    </div>
  );
}
