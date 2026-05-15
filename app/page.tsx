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

interface Provincia {
  slug: string;
  nome: string;
  sigla: string;
  regione: string;
  prezzi: Record<string, { self_media: number | null }>;
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

// Icone carburante
const ICONE: Record<string, string> = {
  benzina: "⛽",
  gasolio: "🛢️",
  gpl: "💨",
  metano: "🔵",
};

// Province più cercate (ordine fisso, alto traffico SEO)
const TOP_PROVINCE = ["roma", "milano", "napoli", "torino", "firenze", "bologna", "palermo", "genova", "venezia", "bari"];

export default function Home() {
  const nazionale = loadJSON<Nazionale>("nazionale.json");
  const indice = loadJSON<Indice>("indice.json");
  const province = loadJSON<Record<string, Provincia>>("province.json");

  const oggi = nazionale?.aggiornato ?? new Date().toISOString().split("T")[0];
  const dataFmt = new Date(oggi).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

  const carburanti = ["benzina", "gasolio", "gpl", "metano"];

  const topProvince = TOP_PROVINCE
    .map(slug => province?.[slug])
    .filter(Boolean) as Provincia[];

  const regioni = indice?.regioni.sort((a, b) => a.nome.localeCompare(b.nome)) ?? [];

  return (
    <div>

      {/* HERO */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Prezzi Carburanti in Italia</h1>
        <p className="text-gray-500 text-sm">
          Monitorati ogni giorno · Aggiornati al <strong className="text-gray-700">{dataFmt}</strong> · Fonte ufficiale{" "}
          <a href="https://carburanti.mise.gov.it" target="_blank" rel="noopener noreferrer" className="text-green-700 underline">MIMIT</a>
        </p>
      </div>

      {/* CARDS MEDIE NAZIONALI */}
      {nazionale ? (
        <section className="mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {carburanti.map((carb) => {
              const p = nazionale.prezzi[carb];
              if (!p) return null;
              return (
                <div key={carb} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{p.label}</span>
                    <span className="text-lg">{ICONE[carb]}</span>
                  </div>
                  <div className="text-3xl font-bold" style={{ color: "#16a34a" }}>
                    {p.self_media ? p.self_media.toFixed(3) : "—"}
                    <span className="text-base font-normal text-gray-400 ml-1">€/l</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">self · media nazionale</div>
                  {p.servito_media && (
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                      Servito: <span className="font-medium">{p.servito_media.toFixed(3)} €/l</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10 text-center text-amber-800 text-sm">
          ⏳ I dati verranno caricati domani alle 6:00 dal primo aggiornamento automatico.
        </div>
      )}

      {/* PROVINCE PIÙ CERCATE + REGIONI */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">

        {/* Province più cercate */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Province più cercate</h2>
            <Link href="/province" className="text-xs text-green-700 font-medium hover:underline">Vedi tutte →</Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {topProvince.length > 0 ? topProvince.map((prov, i) => {
              const benzina = prov.prezzi?.benzina?.self_media;
              return (
                <Link key={prov.slug} href={`/province/${prov.slug}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                  style={{ borderBottom: i < topProvince.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400 w-7">{prov.sigla}</span>
                    <span className="font-medium text-gray-800 group-hover:text-green-700 transition-colors">{prov.nome}</span>
                  </div>
                  {benzina ? (
                    <span className="text-sm font-bold" style={{ color: "#16a34a" }}>{benzina.toFixed(3)} €/l</span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </Link>
              );
            }) : (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">Dati in arrivo...</div>
            )}
          </div>
        </section>

        {/* Regioni */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Prezzi per Regione</h2>
            <Link href="/regioni" className="text-xs text-green-700 font-medium hover:underline">Vedi tutte →</Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {regioni.slice(0, 10).map((r, i) => (
              <Link key={r.slug} href={`/regioni/${r.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                style={{ borderBottom: i < 9 ? "1px solid #f3f4f6" : "none" }}>
                <span className="font-medium text-gray-800 group-hover:text-green-700 transition-colors">{r.nome}</span>
                <span className="text-green-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            ))}
            {!regioni.length && (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">Dati in arrivo...</div>
            )}
          </div>
        </section>
      </div>

      {/* TRASPARENZA DATI */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-2xl mt-0.5">ℹ️</div>
          <div>
            <h2 className="font-semibold text-gray-800 mb-1">Trasparenza Dati</h2>
            <p className="text-sm text-gray-600">
              I prezzi vengono aggiornati <strong>quotidianamente</strong> con i dati comunicati dai gestori degli impianti al
              Ministero delle Imprese e del Made in Italy (MIMIT), come previsto dalla Legge n. 99/2009.
              CarburantiOggi.it elabora le medie per provincia e regione sugli impianti attivi nelle ultime 24 ore.{" "}
              <a href="https://carburanti.mise.gov.it" target="_blank" rel="noopener noreferrer"
                className="text-green-700 underline hover:no-underline">
                Fonte ufficiale: MIMIT →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* CONSIGLIO DEL GIORNO */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-4">
          <div className="text-xs text-green-200 uppercase tracking-widest font-semibold mb-1">Consiglio del giorno</div>
          <h2 className="text-white font-bold text-lg">Come risparmiare sul carburante</h2>
        </div>
        <div className="px-6 py-5 grid md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">⏰</span>
            <div><strong className="text-gray-800 block mb-0.5">Orario giusto</strong>Fai il pieno la mattina presto o la sera: le temperature basse aumentano leggermente la densità del carburante.</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">🛣️</span>
            <div><strong className="text-gray-800 block mb-0.5">Evita l&apos;autostrada</strong>I distributori autostradali costano mediamente 20-30 centesimi in più al litro rispetto alla rete ordinaria.</div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">💳</span>
            <div><strong className="text-gray-800 block mb-0.5">Self service</strong>Il self service costa sempre meno del servito. La differenza media in Italia è di circa 15-20 centesimi al litro.</div>
          </div>
        </div>
      </section>

    </div>
  );
}
