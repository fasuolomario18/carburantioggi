import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import type { Metadata } from "next";
import ProvinceChart from "../components/ProvinceChart";

export const metadata: Metadata = {
  title: "Prezzi Carburanti per Provincia",
  description: "Confronta i prezzi benzina, gasolio, GPL e metano in tutte le province italiane. Aggiornati ogni giorno.",
  alternates: { canonical: "/province" },
};

interface ProvinceSummary {
  nome: string;
  slug: string;
  sigla: string;
  regione: string;
  aggiornato: string;
  prezzi: Record<string, { label: string; self_media: number | null }>;
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export default function ProvincePage() {
  const province = loadJSON<Record<string, ProvinceSummary>>("province.json");
  const lista = province ? Object.values(province).sort((a, b) => a.nome.localeCompare(b.nome)) : [];

  const perRegione: Record<string, ProvinceSummary[]> = {};
  for (const p of lista) {
    if (!perRegione[p.regione]) perRegione[p.regione] = [];
    perRegione[p.regione].push(p);
  }

  const conBenzina = lista
    .filter((p) => p.prezzi?.benzina?.self_media != null)
    .map((p) => ({
      nome: p.nome,
      sigla: p.sigla,
      regione: p.regione,
      benzina: p.prezzi.benzina.self_media as number,
    }));
  const sortedBenzina = [...conBenzina].sort((a, b) => b.benzina - a.benzina);
  const top10 = sortedBenzina.slice(0, 10);
  const bottom10 = [...sortedBenzina].reverse().slice(0, 10).reverse();
  const mediaNazionale = conBenzina.length > 0
    ? conBenzina.reduce((s, p) => s + p.benzina, 0) / conBenzina.length
    : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Prezzi Carburanti per Provincia</h1>
      <p className="text-gray-500 mb-6">Tutte le province italiane con prezzi medi aggiornati quotidianamente.</p>

      {conBenzina.length > 0 && (
        <ProvinceChart top10={top10} bottom10={bottom10} mediaNazionale={mediaNazionale} />
      )}

      {Object.entries(perRegione).sort(([a], [b]) => a.localeCompare(b)).map(([regione, prov]) => (
        <section key={regione} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">{regione}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {prov.map((p) => {
              const benzina = p.prezzi?.benzina?.self_media;
              return (
                <Link key={p.slug} href={`/province/${p.slug}`}
                  className="bg-white rounded-lg border border-gray-200 p-3 hover:border-green-400 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{p.nome}</span>
                    <span className="text-xs text-gray-400">{p.sigla}</span>
                  </div>
                  {benzina && (
                    <div className="text-green-700 font-bold text-sm">€ {benzina.toFixed(3)}</div>
                  )}
                  {!benzina && <div className="text-gray-300 text-xs">—</div>}
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      {!lista.length && (
        <div className="text-center py-16 text-gray-400">
          I dati verranno caricati dal primo aggiornamento automatico.
        </div>
      )}
    </div>
  );
}
