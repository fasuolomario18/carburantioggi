import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import Link from "next/link";

interface Durata { anni: number; tasso: number; rata_100k: number; }
interface MutuiData {
  aggiornato: string;
  periodo: string;
  fonte: string;
  fonte_url: string;
  note: string;
  fisso: { label: string; descrizione: string; durate: Durata[]; };
  variabile: { label: string; descrizione: string; euribor_3m: number; spread_medio: number; tasso_attuale: number; durate: Durata[]; };
  storico: { periodo: string; fisso_20y: number; variabile: number; }[];
  consigli: { titolo: string; testo: string; }[];
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export const metadata: Metadata = {
  title: "Tassi Mutui Casa in Italia Oggi — Fisso e Variabile",
  description: "Tassi mutuo aggiornati: fisso e variabile per durate 10-30 anni. Dati Banca d'Italia. Calcola la rata mensile e confronta fisso vs variabile.",
  alternates: { canonical: "/mutui" },
};

export default function MutuiPage() {
  const data = loadJSON<MutuiData>("mutui.json");
  if (!data) return <div className="text-gray-400 text-center py-20">Dati non disponibili</div>;

  const dataFmt = new Date(data.aggiornato).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Tassi Mutui Casa in Italia",
    "description": "Tassi medi sui mutui residenziali fissi e variabili in Italia. Fonte: Banca d'Italia.",
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "creator": { "@type": "Organization", "name": "Banca d'Italia", "url": "https://www.bancaditalia.it" },
    "temporalCoverage": data.periodo,
    "spatialCoverage": "Italia",
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>›</span>
        <span className="text-gray-600 font-medium">Tassi Mutui</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Tassi Mutui Casa in Italia</h1>
        <p className="text-sm text-gray-500">
          Aggiornato al <strong className="text-gray-700">{dataFmt}</strong> · {data.periodo} · Fonte{" "}
          <a href={data.fonte_url} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">Banca d&apos;Italia</a>
        </p>
      </div>

      {/* CARDS FISSO / VARIABILE */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Tasso Fisso (20 anni)</div>
              <div className="text-4xl font-bold" style={{ color: "#16a34a" }}>
                {data.fisso.durate.find(d => d.anni === 20)?.tasso.toFixed(2)}
                <span className="text-base font-normal text-gray-400 ml-1">%</span>
              </div>
            </div>
            <span className="text-4xl">🏠</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">{data.fisso.descrizione}</p>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rata mensile per €100.000</div>
            {data.fisso.durate.map(d => (
              <div key={d.anni} className="flex justify-between text-xs">
                <span className="text-gray-500">{d.anni} anni — {d.tasso.toFixed(2)}%</span>
                <span className="font-medium text-gray-700">€{d.rata_100k}/mese</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Tasso Variabile (Euribor 3M)</div>
              <div className="text-4xl font-bold" style={{ color: "#16a34a" }}>
                {data.variabile.tasso_attuale.toFixed(2)}
                <span className="text-base font-normal text-gray-400 ml-1">%</span>
              </div>
            </div>
            <span className="text-4xl">📊</span>
          </div>
          <p className="text-xs text-gray-500 mb-2">{data.variabile.descrizione}</p>
          <div className="flex gap-2 mb-4">
            <div className="bg-blue-50 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-gray-400">Euribor 3M: </span>
              <span className="font-bold text-blue-700">{data.variabile.euribor_3m.toFixed(2)}%</span>
            </div>
            <div className="bg-gray-100 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-gray-400">Spread medio: </span>
              <span className="font-bold text-gray-700">+{data.variabile.spread_medio.toFixed(2)}%</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rata mensile per €100.000</div>
            {data.variabile.durate.map(d => (
              <div key={d.anni} className="flex justify-between text-xs">
                <span className="text-gray-500">{d.anni} anni — {d.tasso.toFixed(2)}%</span>
                <span className="font-medium text-gray-700">€{d.rata_100k}/mese</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STORICO */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Storico tassi (ultimi 2 anni)</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-3 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div>Periodo</div>
            <div className="text-center">🏠 Fisso 20y</div>
            <div className="text-right">📊 Variabile</div>
          </div>
          {[...data.storico].reverse().map((item, i) => (
            <div key={item.periodo} className="grid grid-cols-3 px-4 py-3 text-sm"
              style={{ borderBottom: i < data.storico.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <div className="font-medium text-gray-700">{item.periodo}</div>
              <div className="text-center font-semibold" style={{ color: "#16a34a" }}>{item.fisso_20y.toFixed(2)}%</div>
              <div className="text-right font-semibold text-blue-600">{item.variabile.toFixed(2)}%</div>
            </div>
          ))}
        </div>
      </section>

      {/* CONSIGLI */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white mb-8">
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-4">
          <h2 className="text-white font-bold text-lg">Consigli per il mutuo</h2>
        </div>
        <div className="px-6 py-5 grid md:grid-cols-3 gap-4 text-sm text-gray-600">
          {data.consigli.map((c, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl shrink-0">{["💡", "🏦", "🔍"][i]}</span>
              <div><strong className="text-gray-800 block mb-0.5">{c.titolo}</strong>{c.testo}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SEO TEXT */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 prose prose-sm max-w-none text-gray-600 mb-6">
        <h2 className="text-gray-800">Tassi Mutui in Italia — {data.periodo}</h2>
        <p>
          I tassi sui mutui residenziali in Italia sono rilevati mensilmente dalla <strong>Banca d&apos;Italia</strong> nell&apos;ambito
          delle statistiche sui tassi d&apos;interesse bancari (serie TDB10107). I valori mostrati si riferiscono ai tassi medi
          applicati dalle banche italiane sui nuovi mutui per l&apos;acquisto di immobili residenziali.
        </p>
        <p>
          La differenza tra fisso e variabile al {data.periodo}: il fisso a 20 anni è al{" "}
          {data.fisso.durate.find(d => d.anni === 20)?.tasso.toFixed(2)}%, il variabile (Euribor 3M + spread) è al{" "}
          {data.variabile.tasso_attuale.toFixed(2)}%. Con l&apos;Euribor in calo dai massimi del 2023-2024,
          il variabile risulta attualmente {data.variabile.tasso_attuale < (data.fisso.durate.find(d => d.anni === 20)?.tasso ?? 0) ? "più conveniente" : "leggermente più alto"} del fisso.
        </p>
      </section>

      <div className="flex items-start gap-3 text-xs text-gray-400 bg-white rounded-xl border border-gray-100 px-4 py-3">
        <span className="text-base mt-0.5">ℹ️</span>
        <span>{data.note}</span>
      </div>
    </div>
  );
}
