import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import Link from "next/link";

interface StoricoPeriodo {
  periodo: string;
  kwh?: number;
  smc?: number;
}

interface BolletteData {
  aggiornato: string;
  trimestre: string;
  luce: {
    prezzo_kwh: number;
    var_trim_pct: number;
    var_anno_pct: number;
    quota_energia_anno: number;
    quota_fissa_anno: number;
    oneri_sistema_anno: number;
    imposte_anno: number;
    totale_anno_stimato: number;
    storico: StoricoPeriodo[];
  };
  gas: {
    prezzo_smc: number;
    var_trim_pct: number;
    var_anno_pct: number;
    quota_fissa_anno: number;
    quota_energia_anno: number;
    totale_anno_stimato: number;
    storico: StoricoPeriodo[];
  };
  note: string;
  fonte: string;
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

function fmtVar(v: number) {
  if (v > 0) return `+${v.toFixed(1)}%`;
  if (v < 0) return `${v.toFixed(1)}%`;
  return "0%";
}

export const metadata: Metadata = {
  title: "Prezzi Bollette Luce e Gas in Italia Oggi",
  description: "Prezzi luce e gas aggiornati per il trimestre corrente. Dati ARERA ufficiali. Stima bolletta annua, storico prezzi, consigli per risparmiare.",
  alternates: { canonical: "/bollette" },
};

export default function BollettePage() {
  const data = loadJSON<BolletteData>("bollette.json");

  if (!data) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center text-amber-800">
        ⏳ Dati in arrivo al prossimo aggiornamento.
      </div>
    );
  }

  const dataFmt = new Date(data.aggiornato).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div>

      {/* BREADCRUMB */}
      <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>›</span>
        <span className="text-gray-600 font-medium">Bollette Luce e Gas</span>
      </nav>

      {/* TITOLO */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Prezzi Bollette Luce e Gas</h1>
        <p className="text-sm text-gray-500">
          Trimestre <strong className="text-gray-700">{data.trimestre}</strong> · Aggiornato al <strong className="text-gray-700">{dataFmt}</strong> · Fonte <a href={data.fonte} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">ARERA</a>
        </p>
      </div>

      {/* CARDS PRINCIPALI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        {/* LUCE */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Energia Elettrica</div>
              <div className="text-4xl font-bold" style={{ color: "#16a34a" }}>
                {data.luce.prezzo_kwh.toFixed(3)}
                <span className="text-base font-normal text-gray-400 ml-1">€/kWh</span>
              </div>
            </div>
            <span className="text-4xl">⚡</span>
          </div>

          <div className="flex gap-3 mb-5">
            <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${data.luce.var_trim_pct <= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
              {data.luce.var_trim_pct <= 0 ? "↓" : "↑"} {fmtVar(data.luce.var_trim_pct)} trimestre
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${data.luce.var_anno_pct <= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
              {data.luce.var_anno_pct <= 0 ? "↓" : "↑"} {fmtVar(data.luce.var_anno_pct)} anno
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Stima bolletta annua (2.700 kWh)</div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Quota energia</span>
              <span className="font-medium text-gray-700">€{data.luce.quota_energia_anno.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Quota fissa rete</span>
              <span className="font-medium text-gray-700">€{data.luce.quota_fissa_anno.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Oneri di sistema</span>
              <span className="font-medium text-gray-700">€{data.luce.oneri_sistema_anno.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Imposte</span>
              <span className="font-medium text-gray-700">€{data.luce.imposte_anno.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-700">Totale stimato</span>
              <span className="font-bold" style={{ color: "#16a34a" }}>€{data.luce.totale_anno_stimato.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* GAS */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Gas Naturale</div>
              <div className="text-4xl font-bold" style={{ color: "#16a34a" }}>
                {data.gas.prezzo_smc.toFixed(3)}
                <span className="text-base font-normal text-gray-400 ml-1">€/Smc</span>
              </div>
            </div>
            <span className="text-4xl">🔥</span>
          </div>

          <div className="flex gap-3 mb-5">
            <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${data.gas.var_trim_pct <= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
              {data.gas.var_trim_pct <= 0 ? "↓" : "↑"} {fmtVar(data.gas.var_trim_pct)} trimestre
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${data.gas.var_anno_pct <= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
              {data.gas.var_anno_pct <= 0 ? "↓" : "↑"} {fmtVar(data.gas.var_anno_pct)} anno
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Stima bolletta annua (1.400 Smc)</div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Quota energia</span>
              <span className="font-medium text-gray-700">€{data.gas.quota_energia_anno.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Quota fissa distribuzione</span>
              <span className="font-medium text-gray-700">€{data.gas.quota_fissa_anno.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-700">Totale stimato</span>
              <span className="font-bold" style={{ color: "#16a34a" }}>€{data.gas.totale_anno_stimato.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* STORICO PREZZI */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Storico prezzi luce e gas</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-3 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div>Trimestre</div>
            <div className="text-center">⚡ Luce (€/kWh)</div>
            <div className="text-right">🔥 Gas (€/Smc)</div>
          </div>
          {[...data.luce.storico].reverse().map((item, i) => {
            const gasItem = data.gas.storico.find(g => g.periodo === item.periodo);
            return (
              <div key={item.periodo} className="grid grid-cols-3 px-4 py-3 text-sm"
                style={{ borderBottom: i < data.luce.storico.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div className="font-medium text-gray-700">{item.periodo}</div>
                <div className="text-center font-semibold" style={{ color: "#16a34a" }}>
                  {item.kwh?.toFixed(3) ?? "—"}
                </div>
                <div className="text-right font-semibold" style={{ color: "#16a34a" }}>
                  {gasItem?.smc?.toFixed(3) ?? "—"}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* NOTE */}
      <div className="flex items-start gap-3 text-xs text-gray-400 mb-8 bg-white rounded-xl border border-gray-100 px-4 py-3">
        <span className="text-base mt-0.5">ℹ️</span>
        <span>{data.note}</span>
      </div>

      {/* CONSIGLI RISPARMIO */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white mb-8">
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-4">
          <h2 className="text-white font-bold text-lg">Come risparmiare sulla bolletta</h2>
        </div>
        <div className="px-6 py-5 grid md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">🕐</span>
            <div><strong className="text-gray-800 block mb-0.5">Fasce orarie</strong>Usa lavatrice e lavastoviglie nelle ore F2/F3 (sera e notte) per risparmiare fino al 30% sulla quota energia.</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">🔄</span>
            <div><strong className="text-gray-800 block mb-0.5">Mercato libero</strong>Confronta le offerte del mercato libero su{" "}
              <a href="https://www.ilportaleofferte.it" target="_blank" rel="noopener noreferrer" className="text-green-700 underline">portaleofferte.it</a>{" "}
              (ARERA) per trovare tariffe più basse.</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">🌡️</span>
            <div><strong className="text-gray-800 block mb-0.5">Termostato</strong>Abbassare il termostato di 1°C riduce il consumo di gas del 5-7%. 19°C di giorno e 17°C di notte sono sufficienti.</div>
          </div>
        </div>
      </section>

      {/* SEO TEXT */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 prose prose-sm max-w-none text-gray-600">
        <h2 className="text-gray-800">Prezzi Luce e Gas in Italia — {data.trimestre}</h2>
        <p>
          I prezzi dell&apos;energia elettrica e del gas naturale in Italia sono regolati trimestralmente dall&apos;
          <strong>ARERA</strong> (Autorità di Regolazione per Energia Reti e Ambiente). I valori mostrati
          si riferiscono al mercato di tutela (ex maggior tutela), che rappresenta il prezzo di riferimento
          per i clienti che non hanno scelto un fornitore nel mercato libero.
        </p>
        <p>
          La bolletta tipo mostrata è calcolata per un&apos;utenza domestica media: consumo elettrico di
          2.700 kWh/anno con potenza di 3 kW, e consumo gas di 1.400 Smc/anno per riscaldamento autonomo.
          I valori reali dipendono dai consumi effettivi e dal contratto stipulato.
        </p>
      </section>

    </div>
  );
}
