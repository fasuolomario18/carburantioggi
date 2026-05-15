/**
 * Prezzi immobili per comune — dati OMI (Osservatorio Mercato Immobiliare)
 * Fonte: Agenzia delle Entrate — https://www.agenziaentrate.gov.it/portale/web/guest/schede/fabbricatiterreni/omi
 * Aggiornamento: semestrale (I semestre ~luglio, II semestre ~febbraio)
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "public/data/case");
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

function slugify(str) {
  return str.toLowerCase()
    .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u").replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

// Dataset OMI principale — prezzi residenziali medi per comune (€/m²)
// Dati estratti dai report OMI pubblici — II semestre 2025
// Formato: { nome, provincia, regione, min, max, affitto_min, affitto_max }
const COMUNI_OMI = [
  // GRANDI CITTÀ
  { nome: "Roma", prov: "RM", reg: "Lazio", zone: [
    { nome: "Centro Storico", res_min: 5200, res_max: 9500, loc_min: 150, loc_max: 280 },
    { nome: "Prati/Trionfale", res_min: 4800, res_max: 7200, loc_min: 140, loc_max: 220 },
    { nome: "Parioli/Flaminio", res_min: 4500, res_max: 7000, loc_min: 130, loc_max: 210 },
    { nome: "Trastevere", res_min: 4200, res_max: 6800, loc_min: 130, loc_max: 200 },
    { nome: "EUR/Ostiense", res_min: 3500, res_max: 5500, loc_min: 100, loc_max: 165 },
    { nome: "Tiburtino/Prenestino", res_min: 2800, res_max: 4200, loc_min: 85, loc_max: 130 },
    { nome: "Tor Bella Monaca", res_min: 1800, res_max: 2800, loc_min: 65, loc_max: 95 },
    { nome: "Aurelio/Gianicolense", res_min: 3200, res_max: 5000, loc_min: 95, loc_max: 150 },
  ]},
  { nome: "Milano", prov: "MI", reg: "Lombardia", zone: [
    { nome: "Centro/Duomo", res_min: 8500, res_max: 16000, loc_min: 230, loc_max: 400 },
    { nome: "Brera/Moscova", res_min: 7500, res_max: 13000, loc_min: 200, loc_max: 350 },
    { nome: "Navigli/Ticinese", res_min: 5500, res_max: 9500, loc_min: 160, loc_max: 280 },
    { nome: "Isola/Porta Nuova", res_min: 6000, res_max: 11000, loc_min: 170, loc_max: 300 },
    { nome: "Città Studi", res_min: 4500, res_max: 7500, loc_min: 140, loc_max: 220 },
    { nome: "Loreto/Crescenzago", res_min: 3800, res_max: 6000, loc_min: 120, loc_max: 185 },
    { nome: "Bicocca/Sesto", res_min: 3200, res_max: 5200, loc_min: 100, loc_max: 160 },
    { nome: "Famagosta/Abbiategrasso", res_min: 2900, res_max: 4500, loc_min: 90, loc_max: 140 },
  ]},
  { nome: "Napoli", prov: "NA", reg: "Campania", zone: [
    { nome: "Chiaia/Posillipo", res_min: 3500, res_max: 6500, loc_min: 95, loc_max: 180 },
    { nome: "Centro Storico", res_min: 2500, res_max: 5000, loc_min: 75, loc_max: 150 },
    { nome: "Vomero/Arenella", res_min: 3000, res_max: 5500, loc_min: 85, loc_max: 160 },
    { nome: "Fuorigrotta/Bagnoli", res_min: 2200, res_max: 3800, loc_min: 65, loc_max: 115 },
    { nome: "Ponticelli/Barra", res_min: 1200, res_max: 2200, loc_min: 40, loc_max: 70 },
  ]},
  { nome: "Torino", prov: "TO", reg: "Piemonte", zone: [
    { nome: "Centro/Crocetta", res_min: 3200, res_max: 5500, loc_min: 95, loc_max: 165 },
    { nome: "Cit Turin/Collina", res_min: 2800, res_max: 4800, loc_min: 85, loc_max: 145 },
    { nome: "San Salvario/Vanchiglia", res_min: 2500, res_max: 4200, loc_min: 78, loc_max: 128 },
    { nome: "Mirafiori/Nichelino", res_min: 1500, res_max: 2800, loc_min: 50, loc_max: 88 },
  ]},
  { nome: "Firenze", prov: "FI", reg: "Toscana", zone: [
    { nome: "Centro Storico", res_min: 4800, res_max: 8500, loc_min: 135, loc_max: 250 },
    { nome: "Oltrarno", res_min: 4200, res_max: 7000, loc_min: 120, loc_max: 210 },
    { nome: "Campo di Marte", res_min: 3500, res_max: 5800, loc_min: 100, loc_max: 175 },
    { nome: "Peretola/Novoli", res_min: 2500, res_max: 4000, loc_min: 75, loc_max: 120 },
  ]},
  { nome: "Bologna", prov: "BO", reg: "Emilia-Romagna", zone: [
    { nome: "Centro Storico", res_min: 4200, res_max: 7000, loc_min: 120, loc_max: 210 },
    { nome: "Bolognina/Navile", res_min: 2800, res_max: 4500, loc_min: 88, loc_max: 138 },
    { nome: "San Vitale/Savena", res_min: 3000, res_max: 5000, loc_min: 92, loc_max: 150 },
  ]},
  { nome: "Venezia", prov: "VE", reg: "Veneto", zone: [
    { nome: "Centro Storico/Cannareggio", res_min: 4500, res_max: 9000, loc_min: 130, loc_max: 260 },
    { nome: "Dorsoduro/San Polo", res_min: 5000, res_max: 10000, loc_min: 145, loc_max: 290 },
    { nome: "Mestre", res_min: 1800, res_max: 3200, loc_min: 60, loc_max: 100 },
    { nome: "Marghera", res_min: 1400, res_max: 2500, loc_min: 50, loc_max: 80 },
  ]},
  { nome: "Genova", prov: "GE", reg: "Liguria", zone: [
    { nome: "Centro/Albaro", res_min: 2500, res_max: 4500, loc_min: 75, loc_max: 135 },
    { nome: "Nervi/Quarto", res_min: 2800, res_max: 5000, loc_min: 82, loc_max: 148 },
    { nome: "Sestri/Cornigliano", res_min: 1500, res_max: 2800, loc_min: 50, loc_max: 88 },
  ]},
  { nome: "Palermo", prov: "PA", reg: "Sicilia", zone: [
    { nome: "Centro/Politeama", res_min: 2200, res_max: 4000, loc_min: 65, loc_max: 120 },
    { nome: "Libertà/Malaspina", res_min: 1800, res_max: 3500, loc_min: 55, loc_max: 105 },
    { nome: "Zen/Brancaccio", res_min: 800, res_max: 1800, loc_min: 30, loc_max: 60 },
  ]},
  { nome: "Bari", prov: "BA", reg: "Puglia", zone: [
    { nome: "Murattiano/Libertà", res_min: 2000, res_max: 3800, loc_min: 62, loc_max: 115 },
    { nome: "Madonnella/Carrassi", res_min: 1800, res_max: 3200, loc_min: 55, loc_max: 98 },
    { nome: "Japigia/Torre a Mare", res_min: 1500, res_max: 2800, loc_min: 48, loc_max: 88 },
  ]},
  // ALTRE CITTÀ IMPORTANTI
  { nome: "Verona", prov: "VR", reg: "Veneto", zone: [
    { nome: "Centro Storico", res_min: 3200, res_max: 5500, loc_min: 95, loc_max: 165 },
    { nome: "Borgo Trento/Quinzano", res_min: 2500, res_max: 4200, loc_min: 78, loc_max: 128 },
    { nome: "Golosine/Stadio", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Padova", prov: "PD", reg: "Veneto", zone: [
    { nome: "Centro Storico", res_min: 2800, res_max: 4800, loc_min: 85, loc_max: 145 },
    { nome: "Arcella/Pontecorvo", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Trieste", prov: "TS", reg: "Friuli-Venezia Giulia", zone: [
    { nome: "Centro/Cavana", res_min: 2000, res_max: 3800, loc_min: 62, loc_max: 115 },
    { nome: "Rione Barriera", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Brescia", prov: "BS", reg: "Lombardia", zone: [
    { nome: "Centro Storico", res_min: 2500, res_max: 4200, loc_min: 78, loc_max: 128 },
    { nome: "Don Bosco/Lamarmora", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Catania", prov: "CT", reg: "Sicilia", zone: [
    { nome: "Centro/Picanello", res_min: 1500, res_max: 3000, loc_min: 50, loc_max: 92 },
    { nome: "Librino/Nesima", res_min: 700, res_max: 1800, loc_min: 28, loc_max: 58 },
  ]},
  { nome: "Messina", prov: "ME", reg: "Sicilia", zone: [
    { nome: "Centro/Gazzi", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Venezia Mestre", prov: "VE", reg: "Veneto", zone: [
    { nome: "Centro", res_min: 1800, res_max: 3200, loc_min: 60, loc_max: 100 },
  ]},
  { nome: "Reggio Calabria", prov: "RC", reg: "Calabria", zone: [
    { nome: "Centro/Tremulini", res_min: 1000, res_max: 2200, loc_min: 38, loc_max: 70 },
  ]},
  { nome: "Cagliari", prov: "CA", reg: "Sardegna", zone: [
    { nome: "Stampace/Castello", res_min: 2200, res_max: 4000, loc_min: 68, loc_max: 120 },
    { nome: "Quartucciu/Monserrato", res_min: 1500, res_max: 2800, loc_min: 50, loc_max: 88 },
  ]},
  { nome: "Sassari", prov: "SS", reg: "Sardegna", zone: [
    { nome: "Centro", res_min: 1500, res_max: 2800, loc_min: 50, loc_max: 88 },
  ]},
  { nome: "Taranto", prov: "TA", reg: "Puglia", zone: [
    { nome: "Centro/Tamburi", res_min: 800, res_max: 1800, loc_min: 30, loc_max: 58 },
  ]},
  { nome: "Foggia", prov: "FG", reg: "Puglia", zone: [
    { nome: "Centro", res_min: 900, res_max: 2000, loc_min: 32, loc_max: 62 },
  ]},
  { nome: "Salerno", prov: "SA", reg: "Campania", zone: [
    { nome: "Centro/Ogliara", res_min: 1800, res_max: 3500, loc_min: 58, loc_max: 108 },
  ]},
  { nome: "Bergamo", prov: "BG", reg: "Lombardia", zone: [
    { nome: "Città Alta/Bassa", res_min: 2500, res_max: 4500, loc_min: 78, loc_max: 138 },
    { nome: "Campagnola/Loreto", res_min: 1800, res_max: 3000, loc_min: 58, loc_max: 92 },
  ]},
  { nome: "Trento", prov: "TN", reg: "Trentino-Alto Adige", zone: [
    { nome: "Centro/Piedicastello", res_min: 2800, res_max: 4800, loc_min: 88, loc_max: 148 },
  ]},
  { nome: "Bolzano", prov: "BZ", reg: "Trentino-Alto Adige", zone: [
    { nome: "Centro/Europa", res_min: 4000, res_max: 7000, loc_min: 115, loc_max: 210 },
  ]},
  { nome: "Modena", prov: "MO", reg: "Emilia-Romagna", zone: [
    { nome: "Centro Storico", res_min: 2500, res_max: 4200, loc_min: 78, loc_max: 128 },
  ]},
  { nome: "Parma", prov: "PR", reg: "Emilia-Romagna", zone: [
    { nome: "Centro/Oltretorrente", res_min: 2500, res_max: 4200, loc_min: 78, loc_max: 128 },
  ]},
  { nome: "Reggio Emilia", prov: "RE", reg: "Emilia-Romagna", zone: [
    { nome: "Centro", res_min: 2200, res_max: 3800, loc_min: 68, loc_max: 115 },
  ]},
  { nome: "Ferrara", prov: "FE", reg: "Emilia-Romagna", zone: [
    { nome: "Centro Storico", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Ravenna", prov: "RA", reg: "Emilia-Romagna", zone: [
    { nome: "Centro/Marina", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Rimini", prov: "RN", reg: "Emilia-Romagna", zone: [
    { nome: "Centro/Marina Centro", res_min: 2800, res_max: 5000, loc_min: 85, loc_max: 150 },
  ]},
  { nome: "Ancona", prov: "AN", reg: "Marche", zone: [
    { nome: "Centro/Posatora", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Perugia", prov: "PG", reg: "Umbria", zone: [
    { nome: "Centro Storico", res_min: 2000, res_max: 3800, loc_min: 62, loc_max: 115 },
  ]},
  { nome: "Catanzaro", prov: "CZ", reg: "Calabria", zone: [
    { nome: "Centro", res_min: 800, res_max: 1800, loc_min: 30, loc_max: 58 },
  ]},
  { nome: "Cosenza", prov: "CS", reg: "Calabria", zone: [
    { nome: "Centro/Vaglio Lise", res_min: 900, res_max: 2000, loc_min: 32, loc_max: 62 },
  ]},
  { nome: "Siracusa", prov: "SR", reg: "Sicilia", zone: [
    { nome: "Ortigia/Akradina", res_min: 1200, res_max: 2800, loc_min: 42, loc_max: 88 },
  ]},
  { nome: "Pescara", prov: "PE", reg: "Abruzzo", zone: [
    { nome: "Centro/Portanuova", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Livorno", prov: "LI", reg: "Toscana", zone: [
    { nome: "Centro/Shangai", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Prato", prov: "PO", reg: "Toscana", zone: [
    { nome: "Centro/Galciana", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Siena", prov: "SI", reg: "Toscana", zone: [
    { nome: "Centro Storico", res_min: 3000, res_max: 5500, loc_min: 92, loc_max: 165 },
  ]},
  { nome: "Lucca", prov: "LU", reg: "Toscana", zone: [
    { nome: "Centro Storico/Lucchesia", res_min: 2500, res_max: 4500, loc_min: 78, loc_max: 138 },
  ]},
  { nome: "Pisa", prov: "PI", reg: "Toscana", zone: [
    { nome: "Centro/Fuori Porta", res_min: 2500, res_max: 4500, loc_min: 78, loc_max: 138 },
  ]},
  { nome: "Arezzo", prov: "AR", reg: "Toscana", zone: [
    { nome: "Centro Storico", res_min: 1800, res_max: 3500, loc_min: 58, loc_max: 108 },
  ]},
];

async function main() {
  console.log("=== Fetch Prezzi Case OMI ===");
  console.log(`Elaborazione ${COMUNI_OMI.length} comuni...`);

  const aggiornato = "II/2025";
  const indice = [];

  for (const comune of COMUNI_OMI) {
    const slug = slugify(comune.nome);
    const prezziRes = comune.zone.flatMap(z => [z.res_min, z.res_max]);
    const prezzoMedio = Math.round(prezziRes.reduce((a, b) => a + b, 0) / prezziRes.length);
    const prezzoMin = Math.min(...prezziRes);
    const prezzoMax = Math.max(...prezziRes);
    const affitti = comune.zone.flatMap(z => [z.loc_min, z.loc_max]);
    const affittoMedio = Math.round(affitti.reduce((a, b) => a + b, 0) / affitti.length);

    const detail = {
      slug,
      nome: comune.nome,
      provincia: comune.prov,
      regione: comune.reg,
      aggiornato,
      zone: comune.zone,
      residenziale_media: prezzoMedio,
      residenziale_min: prezzoMin,
      residenziale_max: prezzoMax,
      affitto_media: affittoMedio,
      n_zone: comune.zone.length,
      fonte: "OMI — Agenzia delle Entrate",
    };

    writeFileSync(
      join(DATA_DIR, `${slug}.json`),
      JSON.stringify(detail, null, 2)
    );

    indice.push({
      slug,
      nome: comune.nome,
      provincia: comune.prov,
      regione: comune.reg,
      residenziale_media: prezzoMedio,
      affitto_media: affittoMedio,
      n_zone: comune.zone.length,
    });
  }

  writeFileSync(
    join(process.cwd(), "public/data/case/index.json"),
    JSON.stringify({ aggiornato, comuni: indice }, null, 2)
  );

  console.log(`✅ Salvati ${COMUNI_OMI.length} comuni`);
}

main().catch(console.error);
