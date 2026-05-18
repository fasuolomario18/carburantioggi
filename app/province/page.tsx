import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import type { Metadata } from "next";

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Prezzi Carburanti per Provincia</h1>
      <p className="text-gray-500 mb-8">Tutte le province italiane con prezzi medi aggiornati quotidianamente.</p>

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
