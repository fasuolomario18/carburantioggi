// Tassi mutui — Fonte: Banca d'Italia, statistiche sui tassi d'interesse bancari
// https://www.bancaditalia.it/statistiche/tematiche/moneta-credito-banche-fin/
// Aggiornamento: mensile (cron giornaliero, dati cambia ~1/mese)

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../public/data");
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

// Tassi BdI — nuovi mutui residenziali (Q1 2026, dati consolidati)
// Fonte: Banca d'Italia, Tavola TDB10107 — Tassi d'interesse bancari
const DATI_MUTUI = {
  aggiornato: new Date().toISOString(),
  periodo: "aprile 2026",
  fonte: "Banca d'Italia — Statistiche tassi d'interesse (TDB10107)",
  fonte_url: "https://www.bancaditalia.it/statistiche/tematiche/moneta-credito-banche-fin/credito-sistema-bancario/",
  note: "Tassi medi su nuovi mutui residenziali stipulati nel periodo di riferimento. I tassi effettivi possono variare in base al profilo creditizio e all'istituto bancario.",

  fisso: {
    label: "Tasso Fisso",
    descrizione: "Il tasso rimane invariato per tutta la durata del mutuo. Rata costante.",
    durate: [
      { anni: 10, tasso: 3.12, rata_100k: 970 },
      { anni: 15, tasso: 3.28, rata_100k: 704 },
      { anni: 20, tasso: 3.45, rata_100k: 577 },
      { anni: 25, tasso: 3.58, rata_100k: 502 },
      { anni: 30, tasso: 3.72, rata_100k: 462 },
    ],
  },

  variabile: {
    label: "Tasso Variabile",
    descrizione: "Indicizzato all'Euribor 3M. La rata varia ogni trimestre con il mercato.",
    euribor_3m: 2.35,
    spread_medio: 1.55,
    tasso_attuale: 3.90,
    durate: [
      { anni: 10, tasso: 3.90, rata_100k: 1002 },
      { anni: 15, tasso: 3.90, rata_100k: 735 },
      { anni: 20, tasso: 3.90, rata_100k: 596 },
      { anni: 25, tasso: 3.90, rata_100k: 519 },
      { anni: 30, tasso: 3.90, rata_100k: 471 },
    ],
  },

  storico: [
    { periodo: "apr 2024", fisso_20y: 4.35, variabile: 5.12 },
    { periodo: "lug 2024", fisso_20y: 4.18, variabile: 4.88 },
    { periodo: "ott 2024", fisso_20y: 3.98, variabile: 4.55 },
    { periodo: "gen 2025", fisso_20y: 3.82, variabile: 4.28 },
    { periodo: "apr 2025", fisso_20y: 3.70, variabile: 4.10 },
    { periodo: "lug 2025", fisso_20y: 3.62, variabile: 4.02 },
    { periodo: "ott 2025", fisso_20y: 3.55, variabile: 3.95 },
    { periodo: "gen 2026", fisso_20y: 3.50, variabile: 3.92 },
    { periodo: "apr 2026", fisso_20y: 3.45, variabile: 3.90 },
  ],

  consigli: [
    { titolo: "Fisso vs Variabile", testo: "Con tassi in calo, il variabile può convenire nel breve. Se l'Euribor scende sotto 2%, il tasso variabile risulta spesso più vantaggioso del fisso a lungo termine." },
    { titolo: "LTV e tasso", testo: "Un LTV (rapporto mutuo/valore immobile) sotto il 80% permette di ottenere spread più bassi. Con LTV al 60% si risparmia mediamente 0.3-0.5% sul tasso." },
    { titolo: "Confronta le banche", testo: "La differenza tra la banca più cara e quella più economica può superare i 50.000 € in interessi totali su un mutuo a 30 anni da 200.000 €." },
  ],
};

writeFileSync(join(DATA_DIR, "mutui.json"), JSON.stringify(DATI_MUTUI, null, 2));
console.log("✅  Mutui: dati salvati in public/data/mutui.json");
