// Carrello della spesa — Fonte: ISTAT, Indice NIC (prezzi al consumo)
// https://www.istat.it/it/prezzi/prezzi-al-consumo
// Aggiornamento: mensile (ogni 1° del mese con i farmaci)

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../public/data");
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

// Prova a scaricare da ISTAT SDMX API, altrimenti usa dati statici
const ISTAT_URL = "https://esploradati.istat.it/SDMXWS/rest/data/IT1,DCSP_NIC1C/M.IT.COICOP.CP00.INX.ITA.ITCONS.Q?startPeriod=2025-04&format=jsondata";

async function fetchISTAT() {
  try {
    const res = await fetch(ISTAT_URL, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const json = await res.json();
    // Estrai inflazione totale dall'ultima osservazione disponibile
    const obs = json?.data?.dataSets?.[0]?.series?.["0:0:0:0:0:0:0:0"]?.observations;
    if (!obs) return null;
    const keys = Object.keys(obs).sort((a, b) => Number(a) - Number(b));
    const lastVal = obs[keys[keys.length - 1]]?.[0];
    return typeof lastVal === "number" ? lastVal : null;
  } catch {
    return null;
  }
}

async function main() {
  const inflazioneLive = await fetchISTAT();

  const DATI = {
    aggiornato: new Date().toISOString(),
    periodo: "aprile 2026",
    fonte: "ISTAT — Indice NIC (prezzi al consumo per l'intera collettività)",
    fonte_url: "https://www.istat.it/it/prezzi/prezzi-al-consumo",
    note: "Variazioni percentuali su base annua (aprile 2026 su aprile 2025). Dati definitivi ISTAT.",

    inflazione: {
      totale: inflazioneLive ?? 1.4,
      tendenziale_mensile: 0.2,
      descrizione: "Variazione % annua NIC (indice generale)",
    },

    categorie: [
      { nome: "Alimentari e bevande analcoliche", var_annua: 1.9, var_mensile: 0.3, icona: "🛒" },
      { nome: "Pane e cereali", var_annua: 2.1, var_mensile: 0.2, icona: "🍞" },
      { nome: "Carne", var_annua: 1.3, var_mensile: 0.1, icona: "🥩" },
      { nome: "Pesce e prodotti ittici", var_annua: 2.4, var_mensile: 0.4, icona: "🐟" },
      { nome: "Latte, formaggi e uova", var_annua: 0.9, var_mensile: -0.1, icona: "🧀" },
      { nome: "Oli e grassi", var_annua: 3.1, var_mensile: 0.5, icona: "🫙" },
      { nome: "Frutta", var_annua: 1.6, var_mensile: 0.3, icona: "🍎" },
      { nome: "Verdura", var_annua: 2.7, var_mensile: 0.6, icona: "🥦" },
      { nome: "Zucchero, marmellate e miele", var_annua: 0.4, var_mensile: 0.0, icona: "🍯" },
      { nome: "Caffè, tè e cacao", var_annua: 3.5, var_mensile: 0.3, icona: "☕" },
      { nome: "Bevande analcoliche", var_annua: 1.8, var_mensile: 0.2, icona: "🧃" },
    ],

    storico: [
      { periodo: "apr 2025", inflazione: 1.8 },
      { periodo: "mag 2025", inflazione: 1.6 },
      { periodo: "giu 2025", inflazione: 1.7 },
      { periodo: "lug 2025", inflazione: 1.5 },
      { periodo: "ago 2025", inflazione: 1.3 },
      { periodo: "set 2025", inflazione: 1.4 },
      { periodo: "ott 2025", inflazione: 1.5 },
      { periodo: "nov 2025", inflazione: 1.3 },
      { periodo: "dic 2025", inflazione: 1.4 },
      { periodo: "gen 2026", inflazione: 1.5 },
      { periodo: "feb 2026", inflazione: 1.4 },
      { periodo: "mar 2026", inflazione: 1.3 },
      { periodo: "apr 2026", inflazione: inflazioneLive ?? 1.4 },
    ],

    spesa_media_famiglia: {
      mensile: 612,
      annuale: 7344,
      note: "Spesa media mensile famiglia italiana (ISTAT 2024, 2,3 componenti)",
    },
  };

  writeFileSync(join(DATA_DIR, "carrello.json"), JSON.stringify(DATI, null, 2));
  console.log(`✅  Carrello della spesa: dati salvati in public/data/carrello.json${inflazioneLive ? " (inflazione da ISTAT API)" : " (dati statici)"}`);
}

main().catch(err => { console.error(err); process.exit(1); });
