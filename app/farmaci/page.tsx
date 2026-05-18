import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import type { Metadata } from "next";

interface PrincipioAttivo {
  slug: string;
  nome: string;
  atc: string;
  categoria_atc: string;
  n_farmaci: number;
  prezzo_min: number | null;
  ha_rimborsato: boolean;
}

interface FarmaciIndex {
  aggiornato: string;
  principi_attivi: PrincipioAttivo[];
}

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export const metadata: Metadata = {
  title: "Prezzi Farmaci in Italia — Equivalenti e Branded",
  description: "Confronta i prezzi dei farmaci italiani per principio attivo. Dati ufficiali AIFA aggiornati. Trova il farmaco equivalente più conveniente.",
  alternates: { canonical: "/farmaci" },
};

const CATEGORIE_ICONE: Record<string, string> = {
  "Apparato gastrointestinale e metabolismo": "🫁",
  "Sangue e organi emopoietici": "🩸",
  "Sistema cardiovascolare": "❤️",
  "Dermatologici": "🧴",
  "Sistema genito-urinario e ormoni sessuali": "💊",
  "Preparati ormonali sistemici": "⚗️",
  "Antimicrobici per uso sistemico": "🦠",
  "Farmaci antineoplastici e immunomodulatori": "🔬",
  "Sistema muscolo-scheletrico": "🦴",
  "Sistema nervoso": "🧠",
  "Farmaci antiparassitari": "💉",
  "Sistema respiratorio": "🫀",
  "Organi di senso": "👁️",
  "Vari": "💊",
};

export default function FarmaciPage() {
  const data = loadJSON<FarmaciIndex>("farmaci/index.json");
  const principi = data?.principi_attivi ?? [];

  const dataFmt = data?.aggiornato
    ? new Date(data.aggiornato).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  // Raggruppa per categoria ATC
  const perCategoria = principi.reduce<Record<string, PrincipioAttivo[]>>((acc, p) => {
    const cat = p.categoria_atc || "Vari";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div>

      {/* BREADCRUMB */}
      <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>›</span>
        <span className="text-gray-600 font-medium">Farmaci</span>
      </nav>

      {/* TITOLO */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Prezzi Farmaci in Italia</h1>
        <p className="text-sm text-gray-500">
          Confronta farmaci branded e generici per principio attivo · Aggiornato al <strong className="text-gray-700">{dataFmt}</strong> · Fonte AIFA
        </p>
      </div>

      {/* INFO RIMBORSO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="text-2xl mb-2">🟢</div>
          <div className="font-semibold text-green-800 text-sm mb-1">Fascia A — Rimborsato SSN</div>
          <div className="text-xs text-green-700">Il farmaco è gratuito con ricetta medica per i titolari di esenzione, a ticket ridotto per gli altri</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="text-2xl mb-2">🟡</div>
          <div className="font-semibold text-amber-800 text-sm mb-1">Fascia C — A carico del paziente</div>
          <div className="text-xs text-amber-700">Il farmaco si acquista in farmacia pagando il prezzo pieno. Spesso il generico costa il 40-60% in meno</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="text-2xl mb-2">💡</div>
          <div className="font-semibold text-blue-800 text-sm mb-1">Chiedi il generico</div>
          <div className="text-xs text-blue-700">Stessa qualità, stesso principio attivo, prezzo fino al 60% inferiore. Il farmacista è obbligato a proporlo</div>
        </div>
      </div>

      {/* LISTA PRINCIPI ATTIVI */}
      {Object.entries(perCategoria).map(([categoria, items]) => (
        <section key={categoria} className="mb-8">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span>{CATEGORIE_ICONE[categoria] || "💊"}</span>
            {categoria}
            <span className="text-xs font-normal text-gray-400">({items.length})</span>
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {items.map((p, i) => (
              <Link key={p.slug} href={`/farmaci/${p.slug}`}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors group"
                style={{ borderBottom: i < items.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.ha_rimborsato ? "#16a34a" : "#f59e0b" }} />
                  <div>
                    <div className="font-medium text-sm text-gray-800 group-hover:text-green-700 transition-colors">{p.nome}</div>
                    <div className="text-xs text-gray-400">{p.atc} · {p.n_farmaci} farmaci disponibili</div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  {p.prezzo_min ? (
                    <div className="text-sm font-bold" style={{ color: "#16a34a" }}>da €{p.prezzo_min.toFixed(2)}</div>
                  ) : (
                    <div className="text-xs text-gray-300">—</div>
                  )}
                  {p.ha_rimborsato && (
                    <div className="text-xs text-green-600">SSN</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* SEO TEXT */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 prose prose-sm max-w-none text-gray-600 mt-4">
        <h2 className="text-gray-800">Come trovare il farmaco più conveniente</h2>
        <p>
          In Italia esistono migliaia di farmaci a base dello stesso <strong>principio attivo</strong>. Il farmaco di marca e
          il generico (equivalente) hanno la stessa efficacia terapeutica, ma prezzi molto diversi. La legge italiana
          obbliga il farmacista a informarti dell&apos;esistenza di equivalenti più economici.
        </p>
        <p>
          I dati mostrati provengono dall&apos;<strong>AIFA</strong> (Agenzia Italiana del Farmaco) e vengono aggiornati
          periodicamente. I prezzi sono indicativi: il prezzo finale può variare tra farmacie per i farmaci in fascia C.
        </p>
      </section>

    </div>
  );
}
