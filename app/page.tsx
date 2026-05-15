import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";

interface PrezzoCarb {
  label: string;
  self_media: number | null;
  servito_media: number | null;
}

interface Nazionale {
  aggiornato: string;
  prezzi: Record<string, PrezzoCarb>;
}

interface Indice {
  aggiornato: string;
  regioni: { slug: string; nome: string }[];
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

export default function Home() {
  const nazionale = loadJSON<Nazionale>("nazionale.json");
  const indice = loadJSON<Indice>("indice.json");

  const oggi = nazionale?.aggiornato ?? new Date().toISOString().split("T")[0];
  const dataFmt = new Date(oggi).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

  const carburanti = ["benzina", "gasolio", "gpl", "metano"];
  const topRegioni = indice?.regioni.slice(0, 10) ?? [];

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Prezzi Carburanti in Italia</h1>
        <p className="text-gray-500">Aggiornati al <strong>{dataFmt}</strong> — Fonte ufficiale MIMIT</p>
      </div>

      {nazionale ? (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Media Nazionale Oggi</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {carburanti.map((carb) => {
              const p = nazionale.prezzi[carb];
              if (!p) return null;
              return (
                <div key={carb} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                  <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">{p.label}</div>
                  <div className="text-2xl font-bold text-green-700">{fmt(p.self_media)}</div>
                  <div className="text-xs text-gray-400 mt-1">self · media nazionale</div>
                  {p.servito_media && (
                    <div className="text-sm text-gray-500 mt-1">Servito: {fmt(p.servito_media)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-12 text-center text-yellow-800">
          I dati verranno caricati dal primo aggiornamento automatico domani alle 6:00.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Prezzi per Regione</h2>
            <Link href="/regioni" className="text-sm text-green-700 hover:underline">Vedi tutte →</Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {topRegioni.map((r) => (
              <Link key={r.slug} href={`/regioni/${r.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <span className="font-medium">{r.nome}</span>
                <span className="text-sm text-green-700">→</span>
              </Link>
            ))}
            {!topRegioni.length && (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">Dati in arrivo dal primo aggiornamento...</div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Province</h2>
            <Link href="/province" className="text-sm text-green-700 hover:underline">Vedi tutte →</Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {(indice?.province.slice(0, 10) ?? []).map((p) => (
              <Link key={p.slug} href={`/province/${p.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <span className="font-medium">{p.nome}</span>
                <span className="text-xs text-gray-400">{p.sigla}</span>
              </Link>
            ))}
            {!(indice?.province.length) && (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">Dati in arrivo...</div>
            )}
          </div>
        </section>
      </div>

      <section className="mt-12 bg-green-50 rounded-xl p-6 border border-green-100">
        <h2 className="text-lg font-semibold mb-2 text-green-800">Come funziona CarburantiOggi.it</h2>
        <p className="text-sm text-green-700">
          Ogni giorno alle 6:00 raccogliamo i prezzi carburanti comunicati dagli esercenti al Ministero delle Imprese e del Made in Italy (MIMIT),
          come previsto dalla Legge n. 99/2009. I prezzi mostrati sono medie calcolate sugli impianti attivi in ogni provincia e regione.
        </p>
      </section>
    </div>
  );
}
