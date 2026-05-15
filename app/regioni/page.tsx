import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prezzi Carburanti per Regione",
  description: "Confronta i prezzi di benzina e gasolio in tutte le regioni italiane. Dati aggiornati ogni giorno.",
};

interface RegioneSummary {
  nome: string;
  slug: string;
  aggiornato: string;
  prezzi: Record<string, { label: string; self_media: number | null }>;
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export default function RegioniPage() {
  const regioni = loadJSON<Record<string, RegioneSummary>>("regioni.json");
  const lista = regioni ? Object.values(regioni).sort((a, b) => a.nome.localeCompare(b.nome)) : [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Prezzi Carburanti per Regione</h1>
      <p className="text-gray-500 mb-8">Medie aggiornate quotidianamente su tutti gli impianti attivi.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {lista.map((r) => (
          <Link key={r.slug} href={`/regioni/${r.slug}`}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-400 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">{r.nome}</h2>
              <span className="text-xs text-gray-400">{r.aggiornato}</span>
            </div>
            <div className="flex gap-4">
              {["benzina", "gasolio"].map((c) => {
                const p = r.prezzi?.[c];
                if (!p?.self_media) return null;
                return (
                  <div key={c}>
                    <span className="text-xs text-gray-500 block">{p.label} self</span>
                    <span className="font-bold text-green-700">€ {p.self_media.toFixed(3)}</span>
                  </div>
                );
              })}
            </div>
          </Link>
        ))}
        {!lista.length && (
          <div className="col-span-2 text-center py-16 text-gray-400">
            I dati verranno caricati dal primo aggiornamento automatico.
          </div>
        )}
      </div>
    </div>
  );
}
