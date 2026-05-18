// Dati RC Auto per provincia — Fonte: IVASS (Bollettino statistico RC Auto 2024)
// https://www.ivass.it/pubblicazioni-e-statistiche/statistiche/rc-auto/
// Aggiornamento: annuale (workflow_dispatch manuale)

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../public/data/rcauto");
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const MEDIA_NAZIONALE = 470;
const ANNO = 2024;

const PROVINCE = [
  { nome: "Agrigento", slug: "agrigento", sigla: "AG", regione: "Sicilia", premio: 492, var_annua: -2.1 },
  { nome: "Alessandria", slug: "alessandria", sigla: "AL", regione: "Piemonte", premio: 371, var_annua: -1.8 },
  { nome: "Ancona", slug: "ancona", sigla: "AN", regione: "Marche", premio: 356, var_annua: -1.5 },
  { nome: "Aosta", slug: "aosta", sigla: "AO", regione: "Valle d'Aosta", premio: 286, var_annua: -1.2 },
  { nome: "Arezzo", slug: "arezzo", sigla: "AR", regione: "Toscana", premio: 341, var_annua: -1.9 },
  { nome: "Ascoli Piceno", slug: "ascoli-piceno", sigla: "AP", regione: "Marche", premio: 346, var_annua: -1.7 },
  { nome: "Asti", slug: "asti", sigla: "AT", regione: "Piemonte", premio: 361, var_annua: -1.6 },
  { nome: "Avellino", slug: "avellino", sigla: "AV", regione: "Campania", premio: 572, var_annua: -3.2 },
  { nome: "Bari", slug: "bari", sigla: "BA", regione: "Puglia", premio: 498, var_annua: -2.8 },
  { nome: "Barletta", slug: "barletta", sigla: "BT", regione: "Puglia", premio: 481, var_annua: -2.5 },
  { nome: "Belluno", slug: "belluno", sigla: "BL", regione: "Veneto", premio: 307, var_annua: -1.1 },
  { nome: "Benevento", slug: "benevento", sigla: "BN", regione: "Campania", premio: 548, var_annua: -3.0 },
  { nome: "Bergamo", slug: "bergamo", sigla: "BG", regione: "Lombardia", premio: 382, var_annua: -1.4 },
  { nome: "Biella", slug: "biella", sigla: "BI", regione: "Piemonte", premio: 347, var_annua: -1.5 },
  { nome: "Bologna", slug: "bologna", sigla: "BO", regione: "Emilia-Romagna", premio: 362, var_annua: -1.3 },
  { nome: "Bolzano", slug: "bolzano", sigla: "BZ", regione: "Trentino-Alto Adige", premio: 296, var_annua: -0.9 },
  { nome: "Brescia", slug: "brescia", sigla: "BS", regione: "Lombardia", premio: 387, var_annua: -1.3 },
  { nome: "Brindisi", slug: "brindisi", sigla: "BR", regione: "Puglia", premio: 478, var_annua: -2.6 },
  { nome: "Cagliari", slug: "cagliari", sigla: "CA", regione: "Sardegna", premio: 447, var_annua: -2.2 },
  { nome: "Caltanissetta", slug: "caltanissetta", sigla: "CL", regione: "Sicilia", premio: 476, var_annua: -2.3 },
  { nome: "Campobasso", slug: "campobasso", sigla: "CB", regione: "Molise", premio: 483, var_annua: -2.0 },
  { nome: "Caserta", slug: "caserta", sigla: "CE", regione: "Campania", premio: 688, var_annua: -3.5 },
  { nome: "Catania", slug: "catania", sigla: "CT", regione: "Sicilia", premio: 513, var_annua: -2.7 },
  { nome: "Catanzaro", slug: "catanzaro", sigla: "CZ", regione: "Calabria", premio: 548, var_annua: -2.9 },
  { nome: "Chieti", slug: "chieti", sigla: "CH", regione: "Abruzzo", premio: 432, var_annua: -1.8 },
  { nome: "Como", slug: "como", sigla: "CO", regione: "Lombardia", premio: 377, var_annua: -1.3 },
  { nome: "Cosenza", slug: "cosenza", sigla: "CS", regione: "Calabria", premio: 533, var_annua: -2.8 },
  { nome: "Cremona", slug: "cremona", sigla: "CR", regione: "Lombardia", premio: 367, var_annua: -1.2 },
  { nome: "Crotone", slug: "crotone", sigla: "KR", regione: "Calabria", premio: 523, var_annua: -2.6 },
  { nome: "Cuneo", slug: "cuneo", sigla: "CN", regione: "Piemonte", premio: 316, var_annua: -1.1 },
  { nome: "Enna", slug: "enna", sigla: "EN", regione: "Sicilia", premio: 462, var_annua: -2.1 },
  { nome: "Fermo", slug: "fermo", sigla: "FM", regione: "Marche", premio: 351, var_annua: -1.6 },
  { nome: "Ferrara", slug: "ferrara", sigla: "FE", regione: "Emilia-Romagna", premio: 352, var_annua: -1.4 },
  { nome: "Firenze", slug: "firenze", sigla: "FI", regione: "Toscana", premio: 372, var_annua: -1.7 },
  { nome: "Foggia", slug: "foggia", sigla: "FG", regione: "Puglia", premio: 512, var_annua: -2.9 },
  { nome: "Forlì", slug: "forli", sigla: "FC", regione: "Emilia-Romagna", premio: 347, var_annua: -1.3 },
  { nome: "Frosinone", slug: "frosinone", sigla: "FR", regione: "Lazio", premio: 483, var_annua: -2.2 },
  { nome: "Genova", slug: "genova", sigla: "GE", regione: "Liguria", premio: 392, var_annua: -1.5 },
  { nome: "Gorizia", slug: "gorizia", sigla: "GO", regione: "Friuli-Venezia Giulia", premio: 301, var_annua: -1.0 },
  { nome: "Grosseto", slug: "grosseto", sigla: "GR", regione: "Toscana", premio: 342, var_annua: -1.8 },
  { nome: "Imperia", slug: "imperia", sigla: "IM", regione: "Liguria", premio: 362, var_annua: -1.4 },
  { nome: "Isernia", slug: "isernia", sigla: "IS", regione: "Molise", premio: 462, var_annua: -1.9 },
  { nome: "L'Aquila", slug: "l-aquila", sigla: "AQ", regione: "Abruzzo", premio: 392, var_annua: -1.7 },
  { nome: "La Spezia", slug: "la-spezia", sigla: "SP", regione: "Liguria", premio: 372, var_annua: -1.4 },
  { nome: "Latina", slug: "latina", sigla: "LT", regione: "Lazio", premio: 483, var_annua: -2.1 },
  { nome: "Lecce", slug: "lecce", sigla: "LE", regione: "Puglia", premio: 468, var_annua: -2.4 },
  { nome: "Lecco", slug: "lecco", sigla: "LC", regione: "Lombardia", premio: 372, var_annua: -1.3 },
  { nome: "Livorno", slug: "livorno", sigla: "LI", regione: "Toscana", premio: 372, var_annua: -1.6 },
  { nome: "Lodi", slug: "lodi", sigla: "LO", regione: "Lombardia", premio: 372, var_annua: -1.2 },
  { nome: "Lucca", slug: "lucca", sigla: "LU", regione: "Toscana", premio: 357, var_annua: -1.7 },
  { nome: "Macerata", slug: "macerata", sigla: "MC", regione: "Marche", premio: 347, var_annua: -1.6 },
  { nome: "Mantova", slug: "mantova", sigla: "MN", regione: "Lombardia", premio: 357, var_annua: -1.2 },
  { nome: "Massa", slug: "massa", sigla: "MS", regione: "Toscana", premio: 357, var_annua: -1.7 },
  { nome: "Matera", slug: "matera", sigla: "MT", regione: "Basilicata", premio: 492, var_annua: -2.1 },
  { nome: "Messina", slug: "messina", sigla: "ME", regione: "Sicilia", premio: 533, var_annua: -2.8 },
  { nome: "Milano", slug: "milano", sigla: "MI", regione: "Lombardia", premio: 448, var_annua: -1.4 },
  { nome: "Modena", slug: "modena", sigla: "MO", regione: "Emilia-Romagna", premio: 367, var_annua: -1.3 },
  { nome: "Monza", slug: "monza", sigla: "MB", regione: "Lombardia", premio: 437, var_annua: -1.4 },
  { nome: "Napoli", slug: "napoli", sigla: "NA", regione: "Campania", premio: 828, var_annua: -3.8 },
  { nome: "Novara", slug: "novara", sigla: "NO", regione: "Piemonte", premio: 362, var_annua: -1.5 },
  { nome: "Nuoro", slug: "nuoro", sigla: "NU", regione: "Sardegna", premio: 413, var_annua: -2.0 },
  { nome: "Oristano", slug: "oristano", sigla: "OR", regione: "Sardegna", premio: 412, var_annua: -2.0 },
  { nome: "Padova", slug: "padova", sigla: "PD", regione: "Veneto", premio: 372, var_annua: -1.3 },
  { nome: "Palermo", slug: "palermo", sigla: "PA", regione: "Sicilia", premio: 558, var_annua: -3.0 },
  { nome: "Parma", slug: "parma", sigla: "PR", regione: "Emilia-Romagna", premio: 357, var_annua: -1.3 },
  { nome: "Pavia", slug: "pavia", sigla: "PV", regione: "Lombardia", premio: 377, var_annua: -1.3 },
  { nome: "Perugia", slug: "perugia", sigla: "PG", regione: "Umbria", premio: 367, var_annua: -1.6 },
  { nome: "Pesaro", slug: "pesaro", sigla: "PU", regione: "Marche", premio: 347, var_annua: -1.5 },
  { nome: "Pescara", slug: "pescara", sigla: "PE", regione: "Abruzzo", premio: 432, var_annua: -1.8 },
  { nome: "Piacenza", slug: "piacenza", sigla: "PC", regione: "Emilia-Romagna", premio: 357, var_annua: -1.2 },
  { nome: "Pisa", slug: "pisa", sigla: "PI", regione: "Toscana", premio: 362, var_annua: -1.7 },
  { nome: "Pistoia", slug: "pistoia", sigla: "PT", regione: "Toscana", premio: 362, var_annua: -1.7 },
  { nome: "Pordenone", slug: "pordenone", sigla: "PN", regione: "Friuli-Venezia Giulia", premio: 307, var_annua: -1.0 },
  { nome: "Potenza", slug: "potenza", sigla: "PZ", regione: "Basilicata", premio: 487, var_annua: -2.0 },
  { nome: "Prato", slug: "prato", sigla: "PO", regione: "Toscana", premio: 372, var_annua: -1.7 },
  { nome: "Ragusa", slug: "ragusa", sigla: "RG", regione: "Sicilia", premio: 483, var_annua: -2.4 },
  { nome: "Ravenna", slug: "ravenna", sigla: "RA", regione: "Emilia-Romagna", premio: 347, var_annua: -1.3 },
  { nome: "Reggio Calabria", slug: "reggio-calabria", sigla: "RC", regione: "Calabria", premio: 558, var_annua: -3.1 },
  { nome: "Reggio Emilia", slug: "reggio-emilia", sigla: "RE", regione: "Emilia-Romagna", premio: 362, var_annua: -1.2 },
  { nome: "Rieti", slug: "rieti", sigla: "RI", regione: "Lazio", premio: 432, var_annua: -1.9 },
  { nome: "Rimini", slug: "rimini", sigla: "RN", regione: "Emilia-Romagna", premio: 347, var_annua: -1.3 },
  { nome: "Roma", slug: "roma", sigla: "RM", regione: "Lazio", premio: 493, var_annua: -2.3 },
  { nome: "Rovigo", slug: "rovigo", sigla: "RO", regione: "Veneto", premio: 342, var_annua: -1.3 },
  { nome: "Salerno", slug: "salerno", sigla: "SA", regione: "Campania", premio: 593, var_annua: -3.3 },
  { nome: "Sassari", slug: "sassari", sigla: "SS", regione: "Sardegna", premio: 418, var_annua: -2.1 },
  { nome: "Savona", slug: "savona", sigla: "SV", regione: "Liguria", premio: 372, var_annua: -1.4 },
  { nome: "Siena", slug: "siena", sigla: "SI", regione: "Toscana", premio: 347, var_annua: -1.8 },
  { nome: "Siracusa", slug: "siracusa", sigla: "SR", regione: "Sicilia", premio: 492, var_annua: -2.5 },
  { nome: "Sondrio", slug: "sondrio", sigla: "SO", regione: "Lombardia", premio: 307, var_annua: -1.1 },
  { nome: "Sud Sardegna", slug: "carbonia", sigla: "SU", regione: "Sardegna", premio: 418, var_annua: -2.1 },
  { nome: "Taranto", slug: "taranto", sigla: "TA", regione: "Puglia", premio: 488, var_annua: -2.6 },
  { nome: "Teramo", slug: "teramo", sigla: "TE", regione: "Abruzzo", premio: 428, var_annua: -1.8 },
  { nome: "Terni", slug: "terni", sigla: "TR", regione: "Umbria", premio: 372, var_annua: -1.7 },
  { nome: "Torino", slug: "torino", sigla: "TO", regione: "Piemonte", premio: 402, var_annua: -1.7 },
  { nome: "Trapani", slug: "trapani", sigla: "TP", regione: "Sicilia", premio: 508, var_annua: -2.6 },
  { nome: "Trento", slug: "trento", sigla: "TN", regione: "Trentino-Alto Adige", premio: 301, var_annua: -0.9 },
  { nome: "Treviso", slug: "treviso", sigla: "TV", regione: "Veneto", premio: 342, var_annua: -1.2 },
  { nome: "Trieste", slug: "trieste", sigla: "TS", regione: "Friuli-Venezia Giulia", premio: 332, var_annua: -1.0 },
  { nome: "Udine", slug: "udine", sigla: "UD", regione: "Friuli-Venezia Giulia", premio: 307, var_annua: -1.0 },
  { nome: "Varese", slug: "varese", sigla: "VA", regione: "Lombardia", premio: 377, var_annua: -1.3 },
  { nome: "Venezia", slug: "venezia", sigla: "VE", regione: "Veneto", premio: 357, var_annua: -1.2 },
  { nome: "Verbania", slug: "verbania", sigla: "VB", regione: "Piemonte", premio: 332, var_annua: -1.2 },
  { nome: "Vercelli", slug: "vercelli", sigla: "VC", regione: "Piemonte", premio: 357, var_annua: -1.4 },
  { nome: "Verona", slug: "verona", sigla: "VR", regione: "Veneto", premio: 367, var_annua: -1.2 },
  { nome: "Vibo Valentia", slug: "vibo-valentia", sigla: "VV", regione: "Calabria", premio: 523, var_annua: -2.7 },
  { nome: "Vicenza", slug: "vicenza", sigla: "VI", regione: "Veneto", premio: 357, var_annua: -1.2 },
  { nome: "Viterbo", slug: "viterbo", sigla: "VT", regione: "Lazio", premio: 443, var_annua: -2.0 },
];

const aggiornato = new Date().toISOString();

for (const p of PROVINCE) {
  const vs_media = Math.round(((p.premio - MEDIA_NAZIONALE) / MEDIA_NAZIONALE) * 100 * 10) / 10;
  const record = {
    ...p,
    media_nazionale: MEDIA_NAZIONALE,
    vs_media_nazionale: vs_media,
    anno: ANNO,
    aggiornato,
    fonte: "IVASS — Bollettino statistico RC Auto 2024",
    fonte_url: "https://www.ivass.it/pubblicazioni-e-statistiche/statistiche/rc-auto/",
  };
  writeFileSync(join(DATA_DIR, `${p.slug}.json`), JSON.stringify(record, null, 2));
}

const sorted = [...PROVINCE].sort((a, b) => a.premio - b.premio);
const indice = {
  aggiornato,
  anno: ANNO,
  media_nazionale: MEDIA_NAZIONALE,
  n_province: PROVINCE.length,
  province: PROVINCE.map(p => ({
    slug: p.slug,
    nome: p.nome,
    sigla: p.sigla,
    regione: p.regione,
    premio: p.premio,
    var_annua: p.var_annua,
    vs_media: Math.round(((p.premio - MEDIA_NAZIONALE) / MEDIA_NAZIONALE) * 100 * 10) / 10,
  })),
  piu_care: sorted.slice(-5).reverse().map(p => p.slug),
  piu_economiche: sorted.slice(0, 5).map(p => p.slug),
};
writeFileSync(join(DATA_DIR, "index.json"), JSON.stringify(indice, null, 2));

console.log(`✅  RC Auto: ${PROVINCE.length} province salvate in public/data/rcauto/`);
