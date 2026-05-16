// Fetch dati qualità aria da Open-Meteo Air Quality API (dati CAMS/Copernicus)
// https://air-quality-api.open-meteo.com — gratuito, nessuna API key
// Genera public/data/aria/index.json + un JSON per ogni capoluogo

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../public/data/aria");

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

// EU AQI categories (0-100+ Open-Meteo scale)
function categoriaAQI(aqi) {
  if (aqi <= 20) return { categoria: "Buono", colore: "green", idx: 0 };
  if (aqi <= 40) return { categoria: "Discreto", colore: "yellow", idx: 1 };
  if (aqi <= 60) return { categoria: "Moderato", colore: "orange", idx: 2 };
  if (aqi <= 80) return { categoria: "Scarso", colore: "red", idx: 3 };
  if (aqi <= 100) return { categoria: "Molto Scarso", colore: "purple", idx: 4 };
  return { categoria: "Pericoloso", colore: "maroon", idx: 5 };
}

function classificaPM25(v) {
  if (v <= 10) return "Buono";
  if (v <= 20) return "Discreto";
  if (v <= 25) return "Moderato";
  if (v <= 50) return "Scarso";
  if (v <= 75) return "Molto Scarso";
  return "Pericoloso";
}
function classificaPM10(v) {
  if (v <= 20) return "Buono";
  if (v <= 40) return "Discreto";
  if (v <= 50) return "Moderato";
  if (v <= 100) return "Scarso";
  if (v <= 150) return "Molto Scarso";
  return "Pericoloso";
}
function classificaNO2(v) {
  if (v <= 40) return "Buono";
  if (v <= 90) return "Discreto";
  if (v <= 120) return "Moderato";
  if (v <= 230) return "Scarso";
  if (v <= 340) return "Molto Scarso";
  return "Pericoloso";
}
function classificaO3(v) {
  if (v <= 60) return "Buono";
  if (v <= 100) return "Discreto";
  if (v <= 130) return "Moderato";
  if (v <= 240) return "Scarso";
  if (v <= 380) return "Molto Scarso";
  return "Pericoloso";
}

// 110 capoluoghi di provincia italiani con coordinate
const CAPOLUOGHI = [
  { nome: "Agrigento", slug: "agrigento", sigla: "AG", regione: "Sicilia", lat: 37.3108, lon: 13.5765 },
  { nome: "Alessandria", slug: "alessandria", sigla: "AL", regione: "Piemonte", lat: 44.9124, lon: 8.6151 },
  { nome: "Ancona", slug: "ancona", sigla: "AN", regione: "Marche", lat: 43.6158, lon: 13.5189 },
  { nome: "Aosta", slug: "aosta", sigla: "AO", regione: "Valle d'Aosta", lat: 45.7349, lon: 7.3201 },
  { nome: "Arezzo", slug: "arezzo", sigla: "AR", regione: "Toscana", lat: 43.4633, lon: 11.8783 },
  { nome: "Ascoli Piceno", slug: "ascoli-piceno", sigla: "AP", regione: "Marche", lat: 42.8535, lon: 13.5749 },
  { nome: "Asti", slug: "asti", sigla: "AT", regione: "Piemonte", lat: 44.9003, lon: 8.2064 },
  { nome: "Avellino", slug: "avellino", sigla: "AV", regione: "Campania", lat: 40.9143, lon: 14.7906 },
  { nome: "Bari", slug: "bari", sigla: "BA", regione: "Puglia", lat: 41.1171, lon: 16.8719 },
  { nome: "Barletta", slug: "barletta", sigla: "BT", regione: "Puglia", lat: 41.3156, lon: 16.2839 },
  { nome: "Belluno", slug: "belluno", sigla: "BL", regione: "Veneto", lat: 46.1403, lon: 12.2167 },
  { nome: "Benevento", slug: "benevento", sigla: "BN", regione: "Campania", lat: 41.1296, lon: 14.7779 },
  { nome: "Bergamo", slug: "bergamo", sigla: "BG", regione: "Lombardia", lat: 45.6983, lon: 9.6773 },
  { nome: "Biella", slug: "biella", sigla: "BI", regione: "Piemonte", lat: 45.5639, lon: 8.0530 },
  { nome: "Bologna", slug: "bologna", sigla: "BO", regione: "Emilia-Romagna", lat: 44.4949, lon: 11.3426 },
  { nome: "Bolzano", slug: "bolzano", sigla: "BZ", regione: "Trentino-Alto Adige", lat: 46.4983, lon: 11.3548 },
  { nome: "Brescia", slug: "brescia", sigla: "BS", regione: "Lombardia", lat: 45.5416, lon: 10.2118 },
  { nome: "Brindisi", slug: "brindisi", sigla: "BR", regione: "Puglia", lat: 40.6366, lon: 17.9451 },
  { nome: "Cagliari", slug: "cagliari", sigla: "CA", regione: "Sardegna", lat: 39.2238, lon: 9.1217 },
  { nome: "Caltanissetta", slug: "caltanissetta", sigla: "CL", regione: "Sicilia", lat: 37.4903, lon: 14.0621 },
  { nome: "Campobasso", slug: "campobasso", sigla: "CB", regione: "Molise", lat: 41.5600, lon: 14.6561 },
  { nome: "Caserta", slug: "caserta", sigla: "CE", regione: "Campania", lat: 41.0742, lon: 14.3328 },
  { nome: "Catania", slug: "catania", sigla: "CT", regione: "Sicilia", lat: 37.5079, lon: 15.0830 },
  { nome: "Catanzaro", slug: "catanzaro", sigla: "CZ", regione: "Calabria", lat: 38.9098, lon: 16.5871 },
  { nome: "Chieti", slug: "chieti", sigla: "CH", regione: "Abruzzo", lat: 42.3516, lon: 14.1677 },
  { nome: "Como", slug: "como", sigla: "CO", regione: "Lombardia", lat: 45.8104, lon: 9.0852 },
  { nome: "Cosenza", slug: "cosenza", sigla: "CS", regione: "Calabria", lat: 39.3006, lon: 16.2514 },
  { nome: "Cremona", slug: "cremona", sigla: "CR", regione: "Lombardia", lat: 45.1333, lon: 10.0227 },
  { nome: "Crotone", slug: "crotone", sigla: "KR", regione: "Calabria", lat: 39.0800, lon: 17.1279 },
  { nome: "Cuneo", slug: "cuneo", sigla: "CN", regione: "Piemonte", lat: 44.3845, lon: 7.5424 },
  { nome: "Enna", slug: "enna", sigla: "EN", regione: "Sicilia", lat: 37.5639, lon: 14.2769 },
  { nome: "Fermo", slug: "fermo", sigla: "FM", regione: "Marche", lat: 43.1607, lon: 13.7186 },
  { nome: "Ferrara", slug: "ferrara", sigla: "FE", regione: "Emilia-Romagna", lat: 44.8381, lon: 11.6197 },
  { nome: "Firenze", slug: "firenze", sigla: "FI", regione: "Toscana", lat: 43.7696, lon: 11.2558 },
  { nome: "Foggia", slug: "foggia", sigla: "FG", regione: "Puglia", lat: 41.4621, lon: 15.5444 },
  { nome: "Forlì", slug: "forli", sigla: "FC", regione: "Emilia-Romagna", lat: 44.2228, lon: 12.0404 },
  { nome: "Frosinone", slug: "frosinone", sigla: "FR", regione: "Lazio", lat: 41.6386, lon: 13.3514 },
  { nome: "Genova", slug: "genova", sigla: "GE", regione: "Liguria", lat: 44.4056, lon: 8.9463 },
  { nome: "Gorizia", slug: "gorizia", sigla: "GO", regione: "Friuli-Venezia Giulia", lat: 45.9411, lon: 13.6199 },
  { nome: "Grosseto", slug: "grosseto", sigla: "GR", regione: "Toscana", lat: 42.7629, lon: 11.1128 },
  { nome: "Imperia", slug: "imperia", sigla: "IM", regione: "Liguria", lat: 43.8847, lon: 8.0213 },
  { nome: "Isernia", slug: "isernia", sigla: "IS", regione: "Molise", lat: 41.5933, lon: 14.2317 },
  { nome: "L'Aquila", slug: "l-aquila", sigla: "AQ", regione: "Abruzzo", lat: 42.3498, lon: 13.3995 },
  { nome: "La Spezia", slug: "la-spezia", sigla: "SP", regione: "Liguria", lat: 44.1024, lon: 9.8240 },
  { nome: "Latina", slug: "latina", sigla: "LT", regione: "Lazio", lat: 41.4677, lon: 12.9036 },
  { nome: "Lecce", slug: "lecce", sigla: "LE", regione: "Puglia", lat: 40.3515, lon: 18.1750 },
  { nome: "Lecco", slug: "lecco", sigla: "LC", regione: "Lombardia", lat: 45.8559, lon: 9.3966 },
  { nome: "Livorno", slug: "livorno", sigla: "LI", regione: "Toscana", lat: 43.5479, lon: 10.3106 },
  { nome: "Lodi", slug: "lodi", sigla: "LO", regione: "Lombardia", lat: 45.3145, lon: 9.5028 },
  { nome: "Lucca", slug: "lucca", sigla: "LU", regione: "Toscana", lat: 43.8430, lon: 10.5079 },
  { nome: "Macerata", slug: "macerata", sigla: "MC", regione: "Marche", lat: 43.2987, lon: 13.4530 },
  { nome: "Mantova", slug: "mantova", sigla: "MN", regione: "Lombardia", lat: 45.1564, lon: 10.7914 },
  { nome: "Massa", slug: "massa", sigla: "MS", regione: "Toscana", lat: 44.0350, lon: 10.1417 },
  { nome: "Matera", slug: "matera", sigla: "MT", regione: "Basilicata", lat: 40.6664, lon: 16.6043 },
  { nome: "Messina", slug: "messina", sigla: "ME", regione: "Sicilia", lat: 38.1938, lon: 15.5540 },
  { nome: "Milano", slug: "milano", sigla: "MI", regione: "Lombardia", lat: 45.4642, lon: 9.1900 },
  { nome: "Modena", slug: "modena", sigla: "MO", regione: "Emilia-Romagna", lat: 44.6471, lon: 10.9252 },
  { nome: "Monza", slug: "monza", sigla: "MB", regione: "Lombardia", lat: 45.5845, lon: 9.2745 },
  { nome: "Napoli", slug: "napoli", sigla: "NA", regione: "Campania", lat: 40.8358, lon: 14.2488 },
  { nome: "Novara", slug: "novara", sigla: "NO", regione: "Piemonte", lat: 45.4469, lon: 8.6219 },
  { nome: "Nuoro", slug: "nuoro", sigla: "NU", regione: "Sardegna", lat: 40.3215, lon: 9.3289 },
  { nome: "Oristano", slug: "oristano", sigla: "OR", regione: "Sardegna", lat: 39.9063, lon: 8.5922 },
  { nome: "Padova", slug: "padova", sigla: "PD", regione: "Veneto", lat: 45.4064, lon: 11.8768 },
  { nome: "Palermo", slug: "palermo", sigla: "PA", regione: "Sicilia", lat: 38.1157, lon: 13.3615 },
  { nome: "Parma", slug: "parma", sigla: "PR", regione: "Emilia-Romagna", lat: 44.8015, lon: 10.3279 },
  { nome: "Pavia", slug: "pavia", sigla: "PV", regione: "Lombardia", lat: 45.1847, lon: 9.1582 },
  { nome: "Perugia", slug: "perugia", sigla: "PG", regione: "Umbria", lat: 43.1107, lon: 12.3908 },
  { nome: "Pesaro", slug: "pesaro", sigla: "PU", regione: "Marche", lat: 43.9098, lon: 12.9133 },
  { nome: "Pescara", slug: "pescara", sigla: "PE", regione: "Abruzzo", lat: 42.4618, lon: 14.2158 },
  { nome: "Piacenza", slug: "piacenza", sigla: "PC", regione: "Emilia-Romagna", lat: 45.0526, lon: 9.6930 },
  { nome: "Pisa", slug: "pisa", sigla: "PI", regione: "Toscana", lat: 43.7228, lon: 10.4017 },
  { nome: "Pistoia", slug: "pistoia", sigla: "PT", regione: "Toscana", lat: 43.9331, lon: 10.9189 },
  { nome: "Pordenone", slug: "pordenone", sigla: "PN", regione: "Friuli-Venezia Giulia", lat: 45.9564, lon: 12.6611 },
  { nome: "Potenza", slug: "potenza", sigla: "PZ", regione: "Basilicata", lat: 40.6418, lon: 15.7987 },
  { nome: "Prato", slug: "prato", sigla: "PO", regione: "Toscana", lat: 43.8777, lon: 11.1023 },
  { nome: "Ragusa", slug: "ragusa", sigla: "RG", regione: "Sicilia", lat: 36.9249, lon: 14.7257 },
  { nome: "Ravenna", slug: "ravenna", sigla: "RA", regione: "Emilia-Romagna", lat: 44.4167, lon: 12.2000 },
  { nome: "Reggio Calabria", slug: "reggio-calabria", sigla: "RC", regione: "Calabria", lat: 38.1096, lon: 15.6472 },
  { nome: "Reggio Emilia", slug: "reggio-emilia", sigla: "RE", regione: "Emilia-Romagna", lat: 44.6983, lon: 10.6313 },
  { nome: "Rieti", slug: "rieti", sigla: "RI", regione: "Lazio", lat: 42.4017, lon: 12.8633 },
  { nome: "Rimini", slug: "rimini", sigla: "RN", regione: "Emilia-Romagna", lat: 44.0588, lon: 12.5683 },
  { nome: "Roma", slug: "roma", sigla: "RM", regione: "Lazio", lat: 41.9028, lon: 12.4964 },
  { nome: "Rovigo", slug: "rovigo", sigla: "RO", regione: "Veneto", lat: 45.0693, lon: 11.7900 },
  { nome: "Salerno", slug: "salerno", sigla: "SA", regione: "Campania", lat: 40.6824, lon: 14.7681 },
  { nome: "Sassari", slug: "sassari", sigla: "SS", regione: "Sardegna", lat: 40.7259, lon: 8.5557 },
  { nome: "Savona", slug: "savona", sigla: "SV", regione: "Liguria", lat: 44.3069, lon: 8.4813 },
  { nome: "Siena", slug: "siena", sigla: "SI", regione: "Toscana", lat: 43.3186, lon: 11.3307 },
  { nome: "Siracusa", slug: "siracusa", sigla: "SR", regione: "Sicilia", lat: 37.0755, lon: 15.2866 },
  { nome: "Sondrio", slug: "sondrio", sigla: "SO", regione: "Lombardia", lat: 46.1699, lon: 9.8716 },
  { nome: "Sud Sardegna", slug: "carbonia", sigla: "SU", regione: "Sardegna", lat: 39.1661, lon: 8.5231 },
  { nome: "Taranto", slug: "taranto", sigla: "TA", regione: "Puglia", lat: 40.4764, lon: 17.2296 },
  { nome: "Teramo", slug: "teramo", sigla: "TE", regione: "Abruzzo", lat: 42.6589, lon: 13.7040 },
  { nome: "Terni", slug: "terni", sigla: "TR", regione: "Umbria", lat: 42.5636, lon: 12.6436 },
  { nome: "Torino", slug: "torino", sigla: "TO", regione: "Piemonte", lat: 45.0703, lon: 7.6869 },
  { nome: "Trapani", slug: "trapani", sigla: "TP", regione: "Sicilia", lat: 38.0176, lon: 12.5365 },
  { nome: "Trento", slug: "trento", sigla: "TN", regione: "Trentino-Alto Adige", lat: 46.0748, lon: 11.1217 },
  { nome: "Treviso", slug: "treviso", sigla: "TV", regione: "Veneto", lat: 45.6669, lon: 12.2430 },
  { nome: "Trieste", slug: "trieste", sigla: "TS", regione: "Friuli-Venezia Giulia", lat: 45.6495, lon: 13.7768 },
  { nome: "Udine", slug: "udine", sigla: "UD", regione: "Friuli-Venezia Giulia", lat: 46.0633, lon: 13.2350 },
  { nome: "Varese", slug: "varese", sigla: "VA", regione: "Lombardia", lat: 45.8206, lon: 8.8257 },
  { nome: "Venezia", slug: "venezia", sigla: "VE", regione: "Veneto", lat: 45.4408, lon: 12.3155 },
  { nome: "Verbania", slug: "verbania", sigla: "VB", regione: "Piemonte", lat: 45.9237, lon: 8.5514 },
  { nome: "Vercelli", slug: "vercelli", sigla: "VC", regione: "Piemonte", lat: 45.3216, lon: 8.4182 },
  { nome: "Verona", slug: "verona", sigla: "VR", regione: "Veneto", lat: 45.4384, lon: 10.9916 },
  { nome: "Vibo Valentia", slug: "vibo-valentia", sigla: "VV", regione: "Calabria", lat: 38.6753, lon: 16.0995 },
  { nome: "Vicenza", slug: "vicenza", sigla: "VI", regione: "Veneto", lat: 45.5456, lon: 11.5354 },
  { nome: "Viterbo", slug: "viterbo", sigla: "VT", regione: "Lazio", lat: 42.4200, lon: 12.1044 },
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchCitta(citta) {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${citta.lat}&longitude=${citta.lon}&current=pm10,pm2_5,nitrogen_dioxide,ozone,carbon_monoxide,european_aqi&timezone=Europe/Rome`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    const cur = data?.current;
    if (!cur) return null;

    const aqiRaw = cur.european_aqi ?? 0;
    const { categoria, colore, idx } = categoriaAQI(aqiRaw);

    return {
      slug: citta.slug,
      nome: citta.nome,
      sigla: citta.sigla,
      regione: citta.regione,
      aggiornato: new Date().toISOString(),
      aqi: aqiRaw,
      aqi_categoria: categoria,
      aqi_colore: colore,
      aqi_idx: idx,
      pollutanti: {
        pm25: cur.pm2_5 != null ? { valore: Math.round(cur.pm2_5 * 10) / 10, unita: "µg/m³", categoria: classificaPM25(cur.pm2_5) } : null,
        pm10: cur.pm10 != null ? { valore: Math.round(cur.pm10 * 10) / 10, unita: "µg/m³", categoria: classificaPM10(cur.pm10) } : null,
        no2: cur.nitrogen_dioxide != null ? { valore: Math.round(cur.nitrogen_dioxide * 10) / 10, unita: "µg/m³", categoria: classificaNO2(cur.nitrogen_dioxide) } : null,
        o3: cur.ozone != null ? { valore: Math.round(cur.ozone * 10) / 10, unita: "µg/m³", categoria: classificaO3(cur.ozone) } : null,
        co: cur.carbon_monoxide != null ? { valore: Math.round(cur.carbon_monoxide), unita: "µg/m³", categoria: "N/D" } : null,
      },
    };
  } catch {
    return null;
  }
}

async function main() {
  console.log(`🌬️  Fetch qualità aria da Open-Meteo (CAMS) — ${CAPOLUOGHI.length} capoluoghi...`);

  const risultati = [];

  for (let i = 0; i < CAPOLUOGHI.length; i++) {
    const citta = CAPOLUOGHI[i];
    const record = await fetchCitta(citta);
    if (record) {
      writeFileSync(join(DATA_DIR, `${citta.slug}.json`), JSON.stringify(record, null, 2));
      risultati.push({
        slug: record.slug,
        nome: record.nome,
        sigla: record.sigla,
        regione: record.regione,
        aqi: record.aqi,
        aqi_categoria: record.aqi_categoria,
        aqi_colore: record.aqi_colore,
        aqi_idx: record.aqi_idx,
      });
      process.stdout.write(`  [${i + 1}/${CAPOLUOGHI.length}] ${citta.nome}: AQI ${record.aqi} (${record.aqi_categoria})\n`);
    } else {
      console.warn(`  ⚠️  ${citta.nome}: nessun dato`);
    }
    // Rispetta rate limit (max 10.000 req/day ma sii gentile)
    if (i < CAPOLUOGHI.length - 1) await sleep(100);
  }

  risultati.sort((a, b) => b.aqi - a.aqi || a.nome.localeCompare(b.nome));

  const indice = {
    aggiornato: new Date().toISOString(),
    n_citta: risultati.length,
    citta: risultati,
  };
  writeFileSync(join(DATA_DIR, "index.json"), JSON.stringify(indice, null, 2));

  console.log(`\n✅  Completato: ${risultati.length} capoluoghi salvati in public/data/aria/`);
}

main().catch(err => { console.error(err); process.exit(1); });
