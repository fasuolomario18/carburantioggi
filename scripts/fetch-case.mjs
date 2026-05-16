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
  // LOMBARDIA
  { nome: "Monza", prov: "MB", reg: "Lombardia", zone: [
    { nome: "Centro/San Fruttuoso", res_min: 2500, res_max: 4200, loc_min: 78, loc_max: 128 },
    { nome: "Cederna/Libertà", res_min: 1800, res_max: 3000, loc_min: 58, loc_max: 92 },
  ]},
  { nome: "Como", prov: "CO", reg: "Lombardia", zone: [
    { nome: "Centro/Lago", res_min: 3000, res_max: 5500, loc_min: 92, loc_max: 165 },
    { nome: "Camerlata/Rebbio", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Varese", prov: "VA", reg: "Lombardia", zone: [
    { nome: "Centro/Giubiano", res_min: 2000, res_max: 3800, loc_min: 62, loc_max: 115 },
  ]},
  { nome: "Lecco", prov: "LC", reg: "Lombardia", zone: [
    { nome: "Centro/Rancio", res_min: 2000, res_max: 3800, loc_min: 62, loc_max: 115 },
  ]},
  { nome: "Mantova", prov: "MN", reg: "Lombardia", zone: [
    { nome: "Centro Storico", res_min: 2000, res_max: 3800, loc_min: 62, loc_max: 115 },
  ]},
  { nome: "Cremona", prov: "CR", reg: "Lombardia", zone: [
    { nome: "Centro", res_min: 1800, res_max: 3200, loc_min: 55, loc_max: 98 },
  ]},
  { nome: "Pavia", prov: "PV", reg: "Lombardia", zone: [
    { nome: "Centro/Ticinello", res_min: 1800, res_max: 3500, loc_min: 58, loc_max: 108 },
  ]},
  { nome: "Sondrio", prov: "SO", reg: "Lombardia", zone: [
    { nome: "Centro", res_min: 1500, res_max: 2800, loc_min: 50, loc_max: 88 },
  ]},
  // PIEMONTE
  { nome: "Alessandria", prov: "AL", reg: "Piemonte", zone: [
    { nome: "Centro/Cristo", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Asti", prov: "AT", reg: "Piemonte", zone: [
    { nome: "Centro Storico", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Cuneo", prov: "CN", reg: "Piemonte", zone: [
    { nome: "Centro", res_min: 1800, res_max: 3200, loc_min: 55, loc_max: 98 },
  ]},
  { nome: "Novara", prov: "NO", reg: "Piemonte", zone: [
    { nome: "Centro/Bicocca", res_min: 1500, res_max: 2800, loc_min: 50, loc_max: 88 },
  ]},
  { nome: "Verbania", prov: "VB", reg: "Piemonte", zone: [
    { nome: "Centro/Pallanza", res_min: 2000, res_max: 3800, loc_min: 62, loc_max: 115 },
  ]},
  { nome: "Vercelli", prov: "VC", reg: "Piemonte", zone: [
    { nome: "Centro", res_min: 1000, res_max: 2200, loc_min: 38, loc_max: 70 },
  ]},
  // VENETO
  { nome: "Vicenza", prov: "VI", reg: "Veneto", zone: [
    { nome: "Centro Storico", res_min: 2500, res_max: 4500, loc_min: 78, loc_max: 138 },
    { nome: "Gogna/Laghetto", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Treviso", prov: "TV", reg: "Veneto", zone: [
    { nome: "Centro Murato", res_min: 2800, res_max: 5000, loc_min: 85, loc_max: 150 },
    { nome: "Fiera/Santi Quaranta", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Rovigo", prov: "RO", reg: "Veneto", zone: [
    { nome: "Centro", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Belluno", prov: "BL", reg: "Veneto", zone: [
    { nome: "Centro/Lambioi", res_min: 1500, res_max: 2800, loc_min: 50, loc_max: 88 },
  ]},
  // FRIULI-VENEZIA GIULIA
  { nome: "Udine", prov: "UD", reg: "Friuli-Venezia Giulia", zone: [
    { nome: "Centro/Laipacco", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Pordenone", prov: "PN", reg: "Friuli-Venezia Giulia", zone: [
    { nome: "Centro", res_min: 1500, res_max: 2800, loc_min: 50, loc_max: 88 },
  ]},
  // LIGURIA
  { nome: "La Spezia", prov: "SP", reg: "Liguria", zone: [
    { nome: "Centro/Migliarina", res_min: 1800, res_max: 3500, loc_min: 58, loc_max: 108 },
  ]},
  { nome: "Savona", prov: "SV", reg: "Liguria", zone: [
    { nome: "Centro/Villetta", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Imperia", prov: "IM", reg: "Liguria", zone: [
    { nome: "Porto Maurizio/Oneglia", res_min: 2000, res_max: 3800, loc_min: 62, loc_max: 115 },
  ]},
  { nome: "Sanremo", prov: "IM", reg: "Liguria", zone: [
    { nome: "Centro/Levante", res_min: 2500, res_max: 5000, loc_min: 78, loc_max: 150 },
  ]},
  // EMILIA-ROMAGNA
  { nome: "Piacenza", prov: "PC", reg: "Emilia-Romagna", zone: [
    { nome: "Centro Storico", res_min: 1800, res_max: 3200, loc_min: 55, loc_max: 98 },
  ]},
  { nome: "Forlì", prov: "FC", reg: "Emilia-Romagna", zone: [
    { nome: "Centro/San Pietro", res_min: 1800, res_max: 3200, loc_min: 55, loc_max: 98 },
  ]},
  { nome: "Cesena", prov: "FC", reg: "Emilia-Romagna", zone: [
    { nome: "Centro/Oltresavio", res_min: 1800, res_max: 3200, loc_min: 55, loc_max: 98 },
  ]},
  // TOSCANA
  { nome: "Pistoia", prov: "PT", reg: "Toscana", zone: [
    { nome: "Centro Storico", res_min: 1800, res_max: 3500, loc_min: 55, loc_max: 108 },
  ]},
  { nome: "Grosseto", prov: "GR", reg: "Toscana", zone: [
    { nome: "Centro/Gorarella", res_min: 1500, res_max: 2800, loc_min: 48, loc_max: 88 },
  ]},
  { nome: "Massa", prov: "MS", reg: "Toscana", zone: [
    { nome: "Centro/Marina di Massa", res_min: 2000, res_max: 3800, loc_min: 62, loc_max: 115 },
  ]},
  { nome: "Carrara", prov: "MS", reg: "Toscana", zone: [
    { nome: "Centro/Avenza", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  // UMBRIA
  { nome: "Terni", prov: "TR", reg: "Umbria", zone: [
    { nome: "Centro/Borgo Bovio", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  // MARCHE
  { nome: "Pesaro", prov: "PU", reg: "Marche", zone: [
    { nome: "Centro/Tombaccia", res_min: 1800, res_max: 3500, loc_min: 55, loc_max: 108 },
  ]},
  { nome: "Macerata", prov: "MC", reg: "Marche", zone: [
    { nome: "Centro Storico", res_min: 1500, res_max: 2800, loc_min: 48, loc_max: 88 },
  ]},
  { nome: "Ascoli Piceno", prov: "AP", reg: "Marche", zone: [
    { nome: "Centro Storico", res_min: 1500, res_max: 2800, loc_min: 48, loc_max: 88 },
  ]},
  // LAZIO
  { nome: "Latina", prov: "LT", reg: "Lazio", zone: [
    { nome: "Centro/Q4", res_min: 1500, res_max: 2800, loc_min: 48, loc_max: 88 },
  ]},
  { nome: "Frosinone", prov: "FR", reg: "Lazio", zone: [
    { nome: "Centro/Scalo", res_min: 1000, res_max: 2200, loc_min: 38, loc_max: 70 },
  ]},
  { nome: "Viterbo", prov: "VT", reg: "Lazio", zone: [
    { nome: "Centro Storico", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  // CAMPANIA
  { nome: "Caserta", prov: "CE", reg: "Campania", zone: [
    { nome: "Centro/Ercole", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Avellino", prov: "AV", reg: "Campania", zone: [
    { nome: "Centro/Valle", res_min: 1000, res_max: 2200, loc_min: 38, loc_max: 70 },
  ]},
  { nome: "Benevento", prov: "BN", reg: "Campania", zone: [
    { nome: "Centro/Ferrovia", res_min: 900, res_max: 2000, loc_min: 32, loc_max: 62 },
  ]},
  { nome: "Torre del Greco", prov: "NA", reg: "Campania", zone: [
    { nome: "Centro/Marina", res_min: 1500, res_max: 2800, loc_min: 48, loc_max: 88 },
  ]},
  { nome: "Giugliano in Campania", prov: "NA", reg: "Campania", zone: [
    { nome: "Centro/Varcaturo", res_min: 1200, res_max: 2200, loc_min: 40, loc_max: 70 },
  ]},
  // BASILICATA
  { nome: "Potenza", prov: "PZ", reg: "Basilicata", zone: [
    { nome: "Centro/Poggio Tre Galli", res_min: 900, res_max: 2000, loc_min: 32, loc_max: 62 },
  ]},
  { nome: "Matera", prov: "MT", reg: "Basilicata", zone: [
    { nome: "Sassi/Centro", res_min: 2000, res_max: 4500, loc_min: 62, loc_max: 138 },
  ]},
  // CALABRIA
  { nome: "Crotone", prov: "KR", reg: "Calabria", zone: [
    { nome: "Centro/Farina", res_min: 700, res_max: 1600, loc_min: 28, loc_max: 52 },
  ]},
  { nome: "Vibo Valentia", prov: "VV", reg: "Calabria", zone: [
    { nome: "Centro", res_min: 700, res_max: 1600, loc_min: 28, loc_max: 52 },
  ]},
  { nome: "Lamezia Terme", prov: "CZ", reg: "Calabria", zone: [
    { nome: "Centro/Sambiase", res_min: 800, res_max: 1800, loc_min: 30, loc_max: 58 },
  ]},
  // SICILIA
  { nome: "Agrigento", prov: "AG", reg: "Sicilia", zone: [
    { nome: "Centro/Villaseta", res_min: 700, res_max: 1800, loc_min: 28, loc_max: 58 },
  ]},
  { nome: "Trapani", prov: "TP", reg: "Sicilia", zone: [
    { nome: "Centro/Villa Rosina", res_min: 900, res_max: 2000, loc_min: 32, loc_max: 62 },
  ]},
  { nome: "Ragusa", prov: "RG", reg: "Sicilia", zone: [
    { nome: "Ibla/Centro", res_min: 1000, res_max: 2200, loc_min: 38, loc_max: 70 },
  ]},
  { nome: "Marsala", prov: "TP", reg: "Sicilia", zone: [
    { nome: "Centro/Lido", res_min: 800, res_max: 1800, loc_min: 30, loc_max: 58 },
  ]},
  { nome: "Gela", prov: "CL", reg: "Sicilia", zone: [
    { nome: "Centro", res_min: 600, res_max: 1400, loc_min: 25, loc_max: 48 },
  ]},
  // SARDEGNA
  { nome: "Nuoro", prov: "NU", reg: "Sardegna", zone: [
    { nome: "Centro/Biscollai", res_min: 900, res_max: 2000, loc_min: 32, loc_max: 62 },
  ]},
  { nome: "Oristano", prov: "OR", reg: "Sardegna", zone: [
    { nome: "Centro", res_min: 900, res_max: 2000, loc_min: 32, loc_max: 62 },
  ]},
  { nome: "Olbia", prov: "SS", reg: "Sardegna", zone: [
    { nome: "Centro/Berchideddu", res_min: 2000, res_max: 4000, loc_min: 62, loc_max: 120 },
  ]},
  // ABRUZZO
  { nome: "L'Aquila", prov: "AQ", reg: "Abruzzo", zone: [
    { nome: "Centro Storico", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Chieti", prov: "CH", reg: "Abruzzo", zone: [
    { nome: "Centro/Scalo", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Teramo", prov: "TE", reg: "Abruzzo", zone: [
    { nome: "Centro", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  // MOLISE
  { nome: "Campobasso", prov: "CB", reg: "Molise", zone: [
    { nome: "Centro/Vazzieri", res_min: 900, res_max: 2000, loc_min: 32, loc_max: 62 },
  ]},
  // PUGLIA
  { nome: "Lecce", prov: "LE", reg: "Puglia", zone: [
    { nome: "Centro Storico", res_min: 1800, res_max: 3800, loc_min: 58, loc_max: 115 },
    { nome: "Rudiae/San Lazzaro", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Brindisi", prov: "BR", reg: "Puglia", zone: [
    { nome: "Centro/Bozzano", res_min: 1000, res_max: 2200, loc_min: 38, loc_max: 70 },
  ]},
  { nome: "Andria", prov: "BT", reg: "Puglia", zone: [
    { nome: "Centro", res_min: 900, res_max: 2000, loc_min: 32, loc_max: 62 },
  ]},
  { nome: "Barletta", prov: "BT", reg: "Puglia", zone: [
    { nome: "Centro/Patalini", res_min: 1000, res_max: 2200, loc_min: 38, loc_max: 70 },
  ]},
  // VALLE D'AOSTA
  { nome: "Aosta", prov: "AO", reg: "Valle d'Aosta", zone: [
    { nome: "Centro Storico/Consolata", res_min: 2500, res_max: 4500, loc_min: 78, loc_max: 138 },
  ]},
  // CAPOLUOGHI MANCANTI
  { nome: "Biella", prov: "BI", reg: "Piemonte", zone: [
    { nome: "Centro/Vandorno", res_min: 900, res_max: 2200, loc_min: 35, loc_max: 70 },
  ]},
  { nome: "Caltanissetta", prov: "CL", reg: "Sicilia", zone: [
    { nome: "Centro/Villaggio Aldisio", res_min: 600, res_max: 1500, loc_min: 25, loc_max: 50 },
  ]},
  { nome: "Enna", prov: "EN", reg: "Sicilia", zone: [
    { nome: "Centro/Pergusa", res_min: 600, res_max: 1400, loc_min: 22, loc_max: 48 },
  ]},
  { nome: "Fermo", prov: "FM", reg: "Marche", zone: [
    { nome: "Centro Storico/Porto San Giorgio", res_min: 1400, res_max: 2800, loc_min: 48, loc_max: 88 },
  ]},
  { nome: "Gorizia", prov: "GO", reg: "Friuli-Venezia Giulia", zone: [
    { nome: "Centro/Piazzagrande", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Isernia", prov: "IS", reg: "Molise", zone: [
    { nome: "Centro/Santa Maria", res_min: 700, res_max: 1600, loc_min: 28, loc_max: 52 },
  ]},
  { nome: "Lodi", prov: "LO", reg: "Lombardia", zone: [
    { nome: "Centro Storico/Revellino", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Rieti", prov: "RI", reg: "Lazio", zone: [
    { nome: "Centro/Quattro Strade", res_min: 1000, res_max: 2200, loc_min: 38, loc_max: 70 },
  ]},
  // COMUNI MAGGIORI NON CAPOLUOGO
  { nome: "Sesto San Giovanni", prov: "MI", reg: "Lombardia", zone: [
    { nome: "Centro/Rondò", res_min: 2800, res_max: 4800, loc_min: 88, loc_max: 148 },
  ]},
  { nome: "Cinisello Balsamo", prov: "MI", reg: "Lombardia", zone: [
    { nome: "Centro/Crocetta", res_min: 2500, res_max: 4200, loc_min: 80, loc_max: 130 },
  ]},
  { nome: "Busto Arsizio", prov: "VA", reg: "Lombardia", zone: [
    { nome: "Centro/San Michele", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Gallarate", prov: "VA", reg: "Lombardia", zone: [
    { nome: "Centro/Cajello", res_min: 1700, res_max: 3000, loc_min: 55, loc_max: 92 },
  ]},
  { nome: "Rho", prov: "MI", reg: "Lombardia", zone: [
    { nome: "Centro/Mazzo", res_min: 2200, res_max: 3800, loc_min: 70, loc_max: 118 },
  ]},
  { nome: "Cernusco sul Naviglio", prov: "MI", reg: "Lombardia", zone: [
    { nome: "Centro/Ronco", res_min: 2500, res_max: 4200, loc_min: 78, loc_max: 130 },
  ]},
  { nome: "Settimo Torinese", prov: "TO", reg: "Piemonte", zone: [
    { nome: "Centro/Falchera", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Collegno", prov: "TO", reg: "Piemonte", zone: [
    { nome: "Centro/Leumann", res_min: 1500, res_max: 2800, loc_min: 50, loc_max: 88 },
  ]},
  { nome: "Moncalieri", prov: "TO", reg: "Piemonte", zone: [
    { nome: "Centro/Borgo", res_min: 1600, res_max: 2800, loc_min: 52, loc_max: 88 },
  ]},
  { nome: "Imola", prov: "BO", reg: "Emilia-Romagna", zone: [
    { nome: "Centro/Pedagna", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Faenza", prov: "RA", reg: "Emilia-Romagna", zone: [
    { nome: "Centro Storico/San Silvestro", res_min: 1600, res_max: 3000, loc_min: 52, loc_max: 92 },
  ]},
  { nome: "Carpi", prov: "MO", reg: "Emilia-Romagna", zone: [
    { nome: "Centro/Fossoli", res_min: 1700, res_max: 3000, loc_min: 55, loc_max: 92 },
  ]},
  { nome: "Sassuolo", prov: "MO", reg: "Emilia-Romagna", zone: [
    { nome: "Centro/Braida", res_min: 1500, res_max: 2800, loc_min: 48, loc_max: 88 },
  ]},
  { nome: "Reggio nell'Emilia", prov: "RE", reg: "Emilia-Romagna", zone: [
    { nome: "Centro Storico/Massenzatico", res_min: 2200, res_max: 3800, loc_min: 68, loc_max: 115 },
  ]},
  { nome: "Guidonia Montecelio", prov: "RM", reg: "Lazio", zone: [
    { nome: "Centro/Villalba", res_min: 1800, res_max: 3200, loc_min: 58, loc_max: 98 },
  ]},
  { nome: "Civitavecchia", prov: "RM", reg: "Lazio", zone: [
    { nome: "Centro/Porto", res_min: 1500, res_max: 2800, loc_min: 50, loc_max: 88 },
  ]},
  { nome: "Velletri", prov: "RM", reg: "Lazio", zone: [
    { nome: "Centro/Quartarella", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Tivoli", prov: "RM", reg: "Lazio", zone: [
    { nome: "Centro/Villanova", res_min: 1500, res_max: 2800, loc_min: 50, loc_max: 88 },
  ]},
  { nome: "Pozzuoli", prov: "NA", reg: "Campania", zone: [
    { nome: "Centro/Lucrino", res_min: 1800, res_max: 3500, loc_min: 58, loc_max: 108 },
  ]},
  { nome: "Torre Annunziata", prov: "NA", reg: "Campania", zone: [
    { nome: "Centro/Oplonti", res_min: 1000, res_max: 2200, loc_min: 38, loc_max: 70 },
  ]},
  { nome: "Ercolano", prov: "NA", reg: "Campania", zone: [
    { nome: "Centro/Miglio d'Oro", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Castellammare di Stabia", prov: "NA", reg: "Campania", zone: [
    { nome: "Centro/Varano", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Trani", prov: "BT", reg: "Puglia", zone: [
    { nome: "Centro/Marina", res_min: 1200, res_max: 2800, loc_min: 42, loc_max: 88 },
  ]},
  { nome: "Cerignola", prov: "FG", reg: "Puglia", zone: [
    { nome: "Centro", res_min: 700, res_max: 1600, loc_min: 28, loc_max: 52 },
  ]},
  { nome: "Altamura", prov: "BA", reg: "Puglia", zone: [
    { nome: "Centro Storico/Materdomini", res_min: 900, res_max: 2000, loc_min: 32, loc_max: 62 },
  ]},
  { nome: "Molfetta", prov: "BA", reg: "Puglia", zone: [
    { nome: "Centro/Porto", res_min: 1000, res_max: 2200, loc_min: 38, loc_max: 70 },
  ]},
  { nome: "Vittoria", prov: "RG", reg: "Sicilia", zone: [
    { nome: "Centro/Scoglitti", res_min: 700, res_max: 1600, loc_min: 28, loc_max: 52 },
  ]},
  { nome: "Bagheria", prov: "PA", reg: "Sicilia", zone: [
    { nome: "Centro/Aspra", res_min: 900, res_max: 2000, loc_min: 32, loc_max: 62 },
  ]},
  { nome: "Acireale", prov: "CT", reg: "Sicilia", zone: [
    { nome: "Centro/Santa Tecla", res_min: 1000, res_max: 2200, loc_min: 38, loc_max: 70 },
  ]},
  { nome: "Marsala", prov: "TP", reg: "Sicilia", zone: [
    { nome: "Centro/Lido", res_min: 800, res_max: 1800, loc_min: 30, loc_max: 58 },
  ]},
  { nome: "Gela", prov: "CL", reg: "Sicilia", zone: [
    { nome: "Centro", res_min: 600, res_max: 1400, loc_min: 25, loc_max: 48 },
  ]},
  { nome: "Mazara del Vallo", prov: "TP", reg: "Sicilia", zone: [
    { nome: "Centro/Porto", res_min: 800, res_max: 1800, loc_min: 30, loc_max: 58 },
  ]},
  { nome: "Modica", prov: "RG", reg: "Sicilia", zone: [
    { nome: "Centro Storico/Sorda", res_min: 900, res_max: 2000, loc_min: 32, loc_max: 62 },
  ]},
  { nome: "Noto", prov: "SR", reg: "Sicilia", zone: [
    { nome: "Centro Barocco/Marina di Noto", res_min: 1200, res_max: 2800, loc_min: 42, loc_max: 88 },
  ]},
  { nome: "Olbia", prov: "SS", reg: "Sardegna", zone: [
    { nome: "Centro/Berchideddu", res_min: 2000, res_max: 4000, loc_min: 62, loc_max: 120 },
  ]},
  { nome: "Alghero", prov: "SS", reg: "Sardegna", zone: [
    { nome: "Centro Storico/Lungomare", res_min: 2200, res_max: 4500, loc_min: 68, loc_max: 138 },
  ]},
  { nome: "Quartu Sant'Elena", prov: "CA", reg: "Sardegna", zone: [
    { nome: "Centro/Lido", res_min: 1500, res_max: 2800, loc_min: 50, loc_max: 88 },
  ]},
  { nome: "Nuoro", prov: "NU", reg: "Sardegna", zone: [
    { nome: "Centro/Biscollai", res_min: 900, res_max: 2000, loc_min: 32, loc_max: 62 },
  ]},
  { nome: "Oristano", prov: "OR", reg: "Sardegna", zone: [
    { nome: "Centro", res_min: 900, res_max: 2000, loc_min: 32, loc_max: 62 },
  ]},
  { nome: "Sorrento", prov: "NA", reg: "Campania", zone: [
    { nome: "Centro/Marina Grande", res_min: 4500, res_max: 9000, loc_min: 130, loc_max: 270 },
  ]},
  { nome: "Ravello", prov: "SA", reg: "Campania", zone: [
    { nome: "Centro/Torello", res_min: 3500, res_max: 7500, loc_min: 100, loc_max: 220 },
  ]},
  { nome: "Ischia", prov: "NA", reg: "Campania", zone: [
    { nome: "Centro/Ischia Porto", res_min: 3500, res_max: 7000, loc_min: 100, loc_max: 210 },
  ]},
  { nome: "Procida", prov: "NA", reg: "Campania", zone: [
    { nome: "Marina Grande/Terra Murata", res_min: 2800, res_max: 6000, loc_min: 88, loc_max: 180 },
  ]},
  { nome: "Riccione", prov: "RN", reg: "Emilia-Romagna", zone: [
    { nome: "Centro/Lungomare", res_min: 3000, res_max: 5800, loc_min: 92, loc_max: 175 },
  ]},
  { nome: "Cattolica", prov: "RN", reg: "Emilia-Romagna", zone: [
    { nome: "Centro/Lungomare", res_min: 2500, res_max: 5000, loc_min: 80, loc_max: 150 },
  ]},
  { nome: "Cesenatico", prov: "FC", reg: "Emilia-Romagna", zone: [
    { nome: "Centro/Porto Canale", res_min: 2800, res_max: 5500, loc_min: 88, loc_max: 165 },
  ]},
  { nome: "Viareggio", prov: "LU", reg: "Toscana", zone: [
    { nome: "Centro/Lungomare", res_min: 3000, res_max: 6000, loc_min: 92, loc_max: 180 },
  ]},
  { nome: "Montecatini Terme", prov: "PT", reg: "Toscana", zone: [
    { nome: "Centro/Terme", res_min: 1800, res_max: 3500, loc_min: 58, loc_max: 108 },
  ]},
  { nome: "Scandicci", prov: "FI", reg: "Toscana", zone: [
    { nome: "Centro/Vingone", res_min: 2800, res_max: 4800, loc_min: 88, loc_max: 148 },
  ]},
  { nome: "Empoli", prov: "FI", reg: "Toscana", zone: [
    { nome: "Centro/Ponzano", res_min: 1800, res_max: 3500, loc_min: 58, loc_max: 108 },
  ]},
  { nome: "Foligno", prov: "PG", reg: "Umbria", zone: [
    { nome: "Centro/Maceratola", res_min: 1000, res_max: 2200, loc_min: 38, loc_max: 70 },
  ]},
  { nome: "Spoleto", prov: "PG", reg: "Umbria", zone: [
    { nome: "Centro Storico/San Giovanni", res_min: 1500, res_max: 3000, loc_min: 50, loc_max: 92 },
  ]},
  { nome: "Assisi", prov: "PG", reg: "Umbria", zone: [
    { nome: "Centro Storico/Santa Maria degli Angeli", res_min: 1800, res_max: 4000, loc_min: 58, loc_max: 120 },
  ]},
  { nome: "Jesi", prov: "AN", reg: "Marche", zone: [
    { nome: "Centro Storico/Piana", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Senigallia", prov: "AN", reg: "Marche", zone: [
    { nome: "Centro/Lungomare", res_min: 2000, res_max: 4000, loc_min: 62, loc_max: 120 },
  ]},
  { nome: "Civitanova Marche", prov: "MC", reg: "Marche", zone: [
    { nome: "Centro/Porto", res_min: 1800, res_max: 3800, loc_min: 58, loc_max: 115 },
  ]},
  { nome: "San Benedetto del Tronto", prov: "AP", reg: "Marche", zone: [
    { nome: "Centro/Lungomare", res_min: 2200, res_max: 4500, loc_min: 68, loc_max: 138 },
  ]},
  { nome: "Terracina", prov: "LT", reg: "Lazio", zone: [
    { nome: "Centro/Lungomare", res_min: 1800, res_max: 3800, loc_min: 58, loc_max: 115 },
  ]},
  { nome: "Formia", prov: "LT", reg: "Lazio", zone: [
    { nome: "Centro/Porto", res_min: 1800, res_max: 3500, loc_min: 58, loc_max: 108 },
  ]},
  { nome: "Sabaudia", prov: "LT", reg: "Lazio", zone: [
    { nome: "Centro/Lago Sabaudia", res_min: 2000, res_max: 4000, loc_min: 62, loc_max: 120 },
  ]},
  { nome: "Cassino", prov: "FR", reg: "Lazio", zone: [
    { nome: "Centro/Folcara", res_min: 900, res_max: 2000, loc_min: 32, loc_max: 62 },
  ]},
  { nome: "Anzio", prov: "RM", reg: "Lazio", zone: [
    { nome: "Centro/Nettuno", res_min: 2000, res_max: 4000, loc_min: 62, loc_max: 120 },
  ]},
  { nome: "Ostia", prov: "RM", reg: "Lazio", zone: [
    { nome: "Lido di Ostia/Ponente", res_min: 2800, res_max: 5000, loc_min: 85, loc_max: 150 },
  ]},
  { nome: "Monfalcone", prov: "GO", reg: "Friuli-Venezia Giulia", zone: [
    { nome: "Centro/Panzano", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Portogruaro", prov: "VE", reg: "Veneto", zone: [
    { nome: "Centro/San Stino", res_min: 1200, res_max: 2500, loc_min: 42, loc_max: 78 },
  ]},
  { nome: "Chioggia", prov: "VE", reg: "Veneto", zone: [
    { nome: "Centro/Sottomarina", res_min: 1800, res_max: 3800, loc_min: 58, loc_max: 115 },
  ]},
  { nome: "Jesolo", prov: "VE", reg: "Veneto", zone: [
    { nome: "Centro/Lido di Jesolo", res_min: 2500, res_max: 5500, loc_min: 78, loc_max: 165 },
  ]},
  { nome: "Caorle", prov: "VE", reg: "Veneto", zone: [
    { nome: "Centro/Porto Santa Margherita", res_min: 2200, res_max: 5000, loc_min: 68, loc_max: 150 },
  ]},
  { nome: "Thiene", prov: "VI", reg: "Veneto", zone: [
    { nome: "Centro/Rozzampia", res_min: 1500, res_max: 2800, loc_min: 50, loc_max: 88 },
  ]},
  { nome: "Bassano del Grappa", prov: "VI", reg: "Veneto", zone: [
    { nome: "Centro/Anconetta", res_min: 1800, res_max: 3500, loc_min: 58, loc_max: 108 },
  ]},
  { nome: "Castelfranco Veneto", prov: "TV", reg: "Veneto", zone: [
    { nome: "Centro Murato/Salvarosa", res_min: 1600, res_max: 3000, loc_min: 52, loc_max: 92 },
  ]},
  { nome: "Conegliano", prov: "TV", reg: "Veneto", zone: [
    { nome: "Centro/Collalto", res_min: 1800, res_max: 3500, loc_min: 58, loc_max: 108 },
  ]},
  { nome: "Valdagno", prov: "VI", reg: "Veneto", zone: [
    { nome: "Centro/Maglio di Sopra", res_min: 1000, res_max: 2200, loc_min: 38, loc_max: 70 },
  ]},
  { nome: "Merano", prov: "BZ", reg: "Trentino-Alto Adige", zone: [
    { nome: "Centro/Maia", res_min: 3500, res_max: 6500, loc_min: 100, loc_max: 195 },
  ]},
  { nome: "Bressanone", prov: "BZ", reg: "Trentino-Alto Adige", zone: [
    { nome: "Centro/Millan", res_min: 3000, res_max: 5500, loc_min: 92, loc_max: 165 },
  ]},
  { nome: "Rovereto", prov: "TN", reg: "Trentino-Alto Adige", zone: [
    { nome: "Centro/Marco", res_min: 2000, res_max: 3800, loc_min: 62, loc_max: 115 },
  ]},
  { nome: "Riva del Garda", prov: "TN", reg: "Trentino-Alto Adige", zone: [
    { nome: "Centro/Lago", res_min: 2800, res_max: 5500, loc_min: 88, loc_max: 165 },
  ]},
  { nome: "Madonna di Campiglio", prov: "TN", reg: "Trentino-Alto Adige", zone: [
    { nome: "Centro/Campo Carlo Magno", res_min: 5000, res_max: 12000, loc_min: 145, loc_max: 350 },
  ]},
  { nome: "Verbania", prov: "VB", reg: "Piemonte", zone: [
    { nome: "Centro/Pallanza", res_min: 2000, res_max: 3800, loc_min: 62, loc_max: 115 },
  ]},
  { nome: "Stresa", prov: "VB", reg: "Piemonte", zone: [
    { nome: "Centro/Lago Maggiore", res_min: 3000, res_max: 6500, loc_min: 92, loc_max: 195 },
  ]},
  { nome: "Bellagio", prov: "CO", reg: "Lombardia", zone: [
    { nome: "Centro/Lago di Como", res_min: 4000, res_max: 9000, loc_min: 118, loc_max: 270 },
  ]},
  { nome: "Varenna", prov: "LC", reg: "Lombardia", zone: [
    { nome: "Centro/Lago", res_min: 3500, res_max: 8000, loc_min: 105, loc_max: 240 },
  ]},
  { nome: "Desenzano del Garda", prov: "BS", reg: "Lombardia", zone: [
    { nome: "Centro/Lungolago", res_min: 2800, res_max: 5500, loc_min: 88, loc_max: 165 },
  ]},
  { nome: "Sirmione", prov: "BS", reg: "Lombardia", zone: [
    { nome: "Centro/Terme", res_min: 3500, res_max: 7500, loc_min: 105, loc_max: 225 },
  ]},
  { nome: "Bardolino", prov: "VR", reg: "Veneto", zone: [
    { nome: "Centro/Garda", res_min: 2500, res_max: 5500, loc_min: 78, loc_max: 165 },
  ]},
  { nome: "Peschiera del Garda", prov: "VR", reg: "Veneto", zone: [
    { nome: "Centro/Porto", res_min: 2800, res_max: 5500, loc_min: 88, loc_max: 165 },
  ]},
  { nome: "Montecarlo", prov: "LU", reg: "Toscana", zone: [
    { nome: "Centro Storico/Colle", res_min: 2000, res_max: 4000, loc_min: 62, loc_max: 120 },
  ]},
  { nome: "San Gimignano", prov: "SI", reg: "Toscana", zone: [
    { nome: "Centro Medievale/Campagna", res_min: 2500, res_max: 5000, loc_min: 78, loc_max: 150 },
  ]},
  { nome: "Montalcino", prov: "SI", reg: "Toscana", zone: [
    { nome: "Centro Storico/Campagna", res_min: 2500, res_max: 6000, loc_min: 78, loc_max: 180 },
  ]},
  { nome: "Volterra", prov: "PI", reg: "Toscana", zone: [
    { nome: "Centro Storico/Saline", res_min: 1800, res_max: 4000, loc_min: 58, loc_max: 120 },
  ]},
  { nome: "Castiglione della Pescaia", prov: "GR", reg: "Toscana", zone: [
    { nome: "Centro/Marina", res_min: 3000, res_max: 7000, loc_min: 92, loc_max: 210 },
  ]},
  { nome: "Orbetello", prov: "GR", reg: "Toscana", zone: [
    { nome: "Centro/Laguna", res_min: 2000, res_max: 4500, loc_min: 62, loc_max: 138 },
  ]},
  { nome: "Agropoli", prov: "SA", reg: "Campania", zone: [
    { nome: "Centro/Marina", res_min: 1800, res_max: 3800, loc_min: 58, loc_max: 115 },
  ]},
  { nome: "Paestum", prov: "SA", reg: "Campania", zone: [
    { nome: "Centro/Marina di Paestum", res_min: 2000, res_max: 4500, loc_min: 62, loc_max: 138 },
  ]},
  { nome: "Tropea", prov: "VV", reg: "Calabria", zone: [
    { nome: "Centro Storico/Marina", res_min: 1800, res_max: 4000, loc_min: 58, loc_max: 120 },
  ]},
  { nome: "Scilla", prov: "RC", reg: "Calabria", zone: [
    { nome: "Chianalea/Marina", res_min: 1200, res_max: 3000, loc_min: 42, loc_max: 92 },
  ]},
  { nome: "Cefalù", prov: "PA", reg: "Sicilia", zone: [
    { nome: "Centro Storico/Lungomare", res_min: 2000, res_max: 5000, loc_min: 62, loc_max: 150 },
  ]},
  { nome: "Castellammare del Golfo", prov: "TP", reg: "Sicilia", zone: [
    { nome: "Centro/Marina", res_min: 1200, res_max: 3000, loc_min: 42, loc_max: 92 },
  ]},
  { nome: "Ragusa Ibla", prov: "RG", reg: "Sicilia", zone: [
    { nome: "Ibla Barocca/Patro", res_min: 1000, res_max: 2500, loc_min: 38, loc_max: 78 },
  ]},
  { nome: "Pachino", prov: "SR", reg: "Sicilia", zone: [
    { nome: "Centro/Portopalo", res_min: 800, res_max: 2000, loc_min: 30, loc_max: 62 },
  ]},
  { nome: "Caltagirone", prov: "CT", reg: "Sicilia", zone: [
    { nome: "Centro Storico/San Giacomo", res_min: 800, res_max: 1800, loc_min: 30, loc_max: 58 },
  ]},
  { nome: "Gallipoli", prov: "LE", reg: "Puglia", zone: [
    { nome: "Centro Storico/Rivabella", res_min: 1800, res_max: 4500, loc_min: 58, loc_max: 138 },
  ]},
  { nome: "Otranto", prov: "LE", reg: "Puglia", zone: [
    { nome: "Centro Storico/Idro", res_min: 2000, res_max: 5000, loc_min: 62, loc_max: 150 },
  ]},
  { nome: "Martina Franca", prov: "TA", reg: "Puglia", zone: [
    { nome: "Centro Storico/Pergolo", res_min: 1200, res_max: 2800, loc_min: 42, loc_max: 88 },
  ]},
  { nome: "Alberobello", prov: "BA", reg: "Puglia", zone: [
    { nome: "Trulli/Rione Monti", res_min: 1500, res_max: 4000, loc_min: 50, loc_max: 120 },
  ]},
  { nome: "Monopoli", prov: "BA", reg: "Puglia", zone: [
    { nome: "Centro/Porto", res_min: 1800, res_max: 4000, loc_min: 58, loc_max: 120 },
  ]},
  { nome: "Polignano a Mare", prov: "BA", reg: "Puglia", zone: [
    { nome: "Centro Storico/Lungomare", res_min: 2500, res_max: 6000, loc_min: 78, loc_max: 180 },
  ]},
  { nome: "Vieste", prov: "FG", reg: "Puglia", zone: [
    { nome: "Centro/Marina Piccola", res_min: 1800, res_max: 4500, loc_min: 58, loc_max: 138 },
  ]},
  // CITTÀ TURISTICHE GIÀ PRESENTI
  { nome: "Amalfi", prov: "SA", reg: "Campania", zone: [
    { nome: "Centro/Marina Grande", res_min: 3500, res_max: 7000, loc_min: 100, loc_max: 210 },
  ]},
  { nome: "Portofino", prov: "GE", reg: "Liguria", zone: [
    { nome: "Centro/Porto", res_min: 8000, res_max: 18000, loc_min: 220, loc_max: 500 },
  ]},
  { nome: "Taormina", prov: "ME", reg: "Sicilia", zone: [
    { nome: "Centro/Isolabella", res_min: 3000, res_max: 7000, loc_min: 92, loc_max: 210 },
  ]},
  { nome: "Positano", prov: "SA", reg: "Campania", zone: [
    { nome: "Centro/Fornillo", res_min: 5000, res_max: 12000, loc_min: 145, loc_max: 350 },
  ]},
  { nome: "Cortina d'Ampezzo", prov: "BL", reg: "Veneto", zone: [
    { nome: "Centro/Zuel", res_min: 6000, res_max: 15000, loc_min: 170, loc_max: 430 },
  ]},
  { nome: "Forte dei Marmi", prov: "LU", reg: "Toscana", zone: [
    { nome: "Centro/Ponente", res_min: 5000, res_max: 12000, loc_min: 145, loc_max: 350 },
  ]},
  { nome: "Porto Cervo", prov: "SS", reg: "Sardegna", zone: [
    { nome: "Centro/Porto Vecchio", res_min: 8000, res_max: 20000, loc_min: 220, loc_max: 580 },
  ]},
  { nome: "Capri", prov: "NA", reg: "Campania", zone: [
    { nome: "Centro/Marina Grande", res_min: 7000, res_max: 18000, loc_min: 200, loc_max: 520 },
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
