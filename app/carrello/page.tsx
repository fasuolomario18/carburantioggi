import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import Link from "next/link";
import CarrelloChart from "../components/CarrelloChart";

interface Categoria { nome: string; var_annua: number; var_mensile: number; icona: string; }
interface CarrelloData {
  aggiornato: string;
  periodo: string;
  fonte: string;
  fonte_url: string;
  note: string;
  inflazione: { totale: number; tendenziale_mensile: number; descrizione: string; };
  categorie: Categoria[];
  storico: { periodo: string; inflazione: number; }[];
  spesa_media_famiglia: { mensile: number; annuale: number; note: string; };
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export const metadata: Metadata = {
  title: "Carrello della Spesa — Prezzi e Inflazione Alimentare in Italia",
  description: "Inflazione alimentare aggiornata in Italia. Variazioni prezzi pane, carne, frutta, verdura, latte. Dati ISTAT NIC aggiornati ogni mese.",
  alternates: { canonical: "/carrello" },
};

export default function CarrelloPage() {
  const data = loadJSON<CarrelloData>("carrello.json");
  if (!data) return <div className="text-gray-400 text-center py-20">Dati non disponibili</div>;

  const dataFmt = new Date(data.aggiornato).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const catOrdinate = [...data.categorie].sort((a, b) => b.var_annua - a.var_annua);
  const piuCare = catOrdinate.slice(0, 3);
  const piuStabili = [...data.categorie].sort((a, b) => Math.abs(a.var_annua) - Math.abs(b.var_annua)).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Inflazione Carrello della Spesa in Italia",
    "description": "Indice NIC ISTAT sui prezzi al consumo per famiglie italiane. Variazioni mensili e annue per categoria alimentare.",
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "creator": { "@type": "Organization", "name": "ISTAT", "url": "https://www.istat.it" },
    "temporalCoverage": data.periodo,
    "spatialCoverage": "Italia",
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>›</span>
        <span className="text-gray-600 font-medium">Carrello della Spesa</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Carrello della Spesa</h1>
        <p className="text-sm text-gray-500">
          Indice NIC · <strong className="text-gray-700">{data.periodo}</strong> · Aggiornato il <strong className="text-gray-700">{dataFmt}</strong> · Fonte{" "}
          <a href={data.fonte_url} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">ISTAT</a>
        </p>
      </div>

      {/* CARDS PRINCIPALI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Inflazione Totale</div>
          <div className={`text-4xl font-bold ${data.inflazione.totale > 2 ? "text-red-600" : "text-orange-500"}`}>
            +{data.inflazione.totale.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400 mt-1">variazione annua NIC</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Spesa Media Mensile</div>
          <div className="text-4xl font-bold" style={{ color: "#16a34a" }}>
            €{data.spesa_media_famiglia.mensile}
          </div>
          <div className="text-xs text-gray-400 mt-1">famiglia italiana (ISTAT 2024)</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Caro-Spesa Annuo</div>
          <div className="text-4xl font-bold text-orange-500">
            +€{Math.round(data.spesa_media_famiglia.annuale * data.inflazione.totale / 100)}
          </div>
          <div className="text-xs text-gray-400 mt-1">extra a famiglia per l&apos;inflazione</div>
        </div>
      </div>

      {/* GRAFICI */}
      <CarrelloChart
        categorie={data.categorie}
        storico={data.storico}
        inflazioneMedia={data.inflazione.totale}
      />

      {/* CATEGORIE — più care e più stabili */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Aumenti più forti</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {piuCare.map((c, i) => (
              <div key={c.nome} className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: i < piuCare.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{c.icona}</span>
                  <span className="font-medium text-sm text-gray-800">{c.nome}</span>
                </div>
                <span className="text-sm font-bold text-red-600">+{c.var_annua.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Più stabili</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {piuStabili.map((c, i) => (
              <div key={c.nome} className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: i < piuStabili.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{c.icona}</span>
                  <span className="font-medium text-sm text-gray-800">{c.nome}</span>
                </div>
                <span className="text-sm font-bold text-green-600">+{c.var_annua.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* TUTTE LE CATEGORIE */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Tutte le categorie — {data.periodo}</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-4 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">Categoria</div>
            <div className="text-center">Var. annua</div>
            <div className="text-right">Var. mensile</div>
          </div>
          {data.categorie.map((c, i) => (
            <div key={c.nome} className="grid grid-cols-4 px-4 py-3 text-sm items-center"
              style={{ borderBottom: i < data.categorie.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <div className="col-span-2 flex items-center gap-2">
                <span>{c.icona}</span>
                <span className="font-medium text-gray-700">{c.nome}</span>
              </div>
              <div className={`text-center font-semibold ${c.var_annua > 2.5 ? "text-red-600" : c.var_annua > 1.5 ? "text-orange-500" : "text-yellow-600"}`}>
                {c.var_annua > 0 ? "+" : ""}{c.var_annua.toFixed(1)}%
              </div>
              <div className={`text-right text-xs font-medium ${c.var_mensile > 0 ? "text-red-500" : c.var_mensile < 0 ? "text-green-600" : "text-gray-400"}`}>
                {c.var_mensile > 0 ? "+" : ""}{c.var_mensile.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STORICO */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Andamento inflazione — ultimi 13 mesi</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div>Periodo</div>
            <div className="text-right">Inflazione NIC</div>
          </div>
          {[...data.storico].reverse().map((item, i) => (
            <div key={item.periodo} className="grid grid-cols-2 px-4 py-3 text-sm"
              style={{ borderBottom: i < data.storico.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <div className="font-medium text-gray-700">{item.periodo}</div>
              <div className={`text-right font-semibold ${item.inflazione > 2 ? "text-red-600" : "text-orange-500"}`}>
                +{item.inflazione.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEO TEXT */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 prose prose-sm max-w-none text-gray-600 mb-6">
        <h2 className="text-gray-800">Inflazione Alimentare in Italia — {data.periodo}</h2>
        <p>
          L&apos;indice NIC (<em>Indice dei prezzi al consumo per l&apos;intera collettività</em>) misura le variazioni nel tempo
          dei prezzi di un paniere di beni e servizi acquistati dalle famiglie italiane. Viene pubblicato mensilmente
          dall&apos;<strong>ISTAT</strong> ed è il principale indicatore di inflazione usato in Italia.
        </p>
        <p>
          Ad {data.periodo}, l&apos;inflazione complessiva è al +{data.inflazione.totale.toFixed(1)}% su base annua.
          La componente alimentare (+{data.categorie.find(c => c.nome.includes("Alimentari"))?.var_annua.toFixed(1)}%) risulta{" "}
          {(data.categorie.find(c => c.nome.includes("Alimentari"))?.var_annua ?? 0) > data.inflazione.totale ? "superiore" : "in linea con"} la media generale.
          Le categorie con i rincari più marcati sono{" "}
          {piuCare.slice(0, 2).map(c => c.nome.toLowerCase()).join(" e ")}.
        </p>
        <p>
          Per una famiglia italiana media che spende €{data.spesa_media_famiglia.mensile}/mese in beni e servizi,
          l&apos;inflazione di questo mese equivale a circa{" "}
          €{Math.round(data.spesa_media_famiglia.mensile * data.inflazione.totale / 100)} in più al mese rispetto a un anno fa.
        </p>
      </section>

      <div className="flex items-start gap-3 text-xs text-gray-400 bg-white rounded-xl border border-gray-100 px-4 py-3">
        <span className="text-base mt-0.5">ℹ️</span>
        <span>{data.note}</span>
      </div>
    </div>
  );
}
