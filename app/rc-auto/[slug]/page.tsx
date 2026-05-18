import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProvinciaDetail {
  slug: string;
  nome: string;
  sigla: string;
  regione: string;
  premio: number;
  var_annua: number;
  vs_media_nazionale: number;
  media_nazionale: number;
  anno: number;
  fonte: string;
  fonte_url: string;
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export async function generateStaticParams() {
  const index = loadJSON<{ province: { slug: string }[] }>("rcauto/index.json");
  return (index?.province ?? []).map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = loadJSON<ProvinciaDetail>(`rcauto/${slug}.json`);
  if (!d) return {};
  return {
    title: `RC Auto ${d.nome} — Premio Medio €${d.premio}/anno`,
    description: `Premio medio RC Auto a ${d.nome} (${d.sigla}): €${d.premio}/anno. ${d.vs_media_nazionale > 0 ? `+${d.vs_media_nazionale}%` : `${d.vs_media_nazionale}%`} rispetto alla media nazionale di €${d.media_nazionale}. Dati IVASS ${d.anno}.`,
    alternates: { canonical: `/rc-auto/${slug}` },
  };
}

export default async function RcAutoProvinciaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = loadJSON<ProvinciaDetail>(`rcauto/${slug}.json`);
  if (!d) notFound();

  const diff = d.premio - d.media_nazionale;
  const risparmioSe = diff > 0 ? `€${diff} in più` : `€${Math.abs(diff)} in meno`;
  const confronto = d.vs_media_nazionale > 0
    ? `A ${d.nome} si paga il ${d.vs_media_nazionale}% in più rispetto alla media nazionale (€${d.media_nazionale}/anno). In valore assoluto significa ${risparmioSe} all'anno rispetto a chi assicura la propria auto nella media delle province italiane.`
    : `A ${d.nome} si paga il ${Math.abs(d.vs_media_nazionale)}% in meno rispetto alla media nazionale (€${d.media_nazionale}/anno). In valore assoluto significa ${risparmioSe} all'anno — una delle province più convenienti d'Italia per l'RC Auto.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `RC Auto ${d.nome} — Premio Medio ${d.anno}`,
    "description": `Premio medio RC Auto nella provincia di ${d.nome}: €${d.premio}/anno. Fonte IVASS.`,
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "creator": { "@type": "Organization", "name": "IVASS", "url": "https://www.ivass.it" },
    "temporalCoverage": String(d.anno),
    "spatialCoverage": `Provincia di ${d.nome}, Italia`,
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>›</span>
        <Link href="/rc-auto" className="hover:text-green-700">RC Auto</Link>
        <span>›</span>
        <span className="text-gray-600 font-medium">{d.nome}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">RC Auto — {d.nome} ({d.sigla})</h1>
        <p className="text-sm text-gray-500">
          Regione {d.regione} · Dati <strong className="text-gray-700">{d.anno}</strong> · Fonte{" "}
          <a href={d.fonte_url} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">IVASS</a>
        </p>
      </div>

      {/* CARD PRINCIPALE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Premio Medio</div>
          <div className="text-4xl font-bold" style={{ color: "#16a34a" }}>€{d.premio}</div>
          <div className="text-xs text-gray-400 mt-1">all&apos;anno</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">vs Media Italia</div>
          <div className={`text-4xl font-bold ${d.vs_media_nazionale > 0 ? "text-red-500" : "text-green-600"}`}>
            {d.vs_media_nazionale > 0 ? "+" : ""}{d.vs_media_nazionale}%
          </div>
          <div className="text-xs text-gray-400 mt-1">rispetto a €{d.media_nazionale}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Variazione Annua</div>
          <div className={`text-4xl font-bold ${d.var_annua > 0 ? "text-red-500" : "text-green-600"}`}>
            {d.var_annua > 0 ? "+" : ""}{d.var_annua}%
          </div>
          <div className="text-xs text-gray-400 mt-1">rispetto al {d.anno - 1}</div>
        </div>
      </div>

      {/* ANALISI TESTUALE UNICA */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8 prose prose-sm max-w-none text-gray-600">
        <h2 className="text-gray-800">RC Auto a {d.nome}: analisi del premio medio</h2>
        <p>{confronto}</p>
        <p>
          La variazione annua del {d.var_annua > 0 ? "+" : ""}{d.var_annua}% rispetto al {d.anno - 1}{" "}
          {d.var_annua < 0
            ? `indica una riduzione del premio medio nella provincia di ${d.nome}. Il calo rientra nel trend nazionale di discesa dei premi RC Auto degli ultimi anni, guidato dal miglioramento delle statistiche sinistri e dalla maggiore concorrenza tra le compagnie.`
            : `riflette un lieve aumento del premio medio in questa provincia.`
          }
        </p>
        <p>
          Il premio medio IVASS è calcolato su tutti i veicoli assicurati nella provincia, indipendentemente
          dalla classe bonus-malus, età del conducente o tipo di veicolo. Il prezzo effettivo del singolo
          automobilista può variare sensibilmente da questa media.
        </p>
      </section>

      {/* FATTORI CHE INFLUENZANO IL PREMIO */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-4">
          <h2 className="text-white font-bold text-lg">Cosa influenza il tuo premio RC Auto</h2>
        </div>
        <div className="px-6 py-5 grid md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">🏆</span>
            <div><strong className="text-gray-800 block mb-0.5">Classe Bonus-Malus</strong>La classe 1 (massima) può ridurre il premio del 50-60% rispetto alla classe 14. Ogni anno senza sinistri migliora la classe.</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">📍</span>
            <div><strong className="text-gray-800 block mb-0.5">Provincia di residenza</strong>La provincia pesa molto: a {d.nome} la media è €{d.premio}/anno, ma spostarsi in una provincia del Nord può ridurre il premio anche del 30-40%.</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">🔄</span>
            <div><strong className="text-gray-800 block mb-0.5">Confronta le offerte</strong>Usa il{" "}
              <a href="https://www.ivass.it/consumatori/ania-ivass/prezzi-rc-auto/" target="_blank" rel="noopener noreferrer" className="text-green-700 underline">comparatore IVASS</a>{" "}
              gratuito per trovare la tariffa più bassa disponibile per il tuo profilo.</div>
          </div>
        </div>
      </section>

      <div className="flex items-start gap-3 text-xs text-gray-400 bg-white rounded-xl border border-gray-100 px-4 py-3">
        <span className="text-base mt-0.5">ℹ️</span>
        <span>{d.fonte} · Il dato rappresenta la media statistica provinciale e non costituisce un preventivo assicurativo.</span>
      </div>
    </div>
  );
}
