import { writeFileSync, mkdirSync } from 'fs';
import { PROVINCE, REGIONI, slugify } from './province.js';

const API_BASE = 'https://carburanti.mise.gov.it/ospzApi';
const RADIUS = 15; // km
const DELAY = 400; // ms tra richieste per non sovraccaricare l'API

const CARBURANTI = [
  { id: 1, nome: 'benzina', label: 'Benzina' },
  { id: 2, nome: 'gasolio', label: 'Gasolio' },
  { id: 3, nome: 'metano', label: 'Metano' },
  { id: 4, nome: 'gpl', label: 'GPL' },
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchZona(lat, lng) {
  try {
    const res = await fetch(`${API_BASE}/search/zone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ points: [{ lat, lng }], radius: RADIUS }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

function calcolaMedia(impianti, fuelId, isSelf) {
  const prezzi = impianti
    .flatMap(i => i.fuels)
    .filter(f => f.fuelId === fuelId && f.isSelf === isSelf && f.price > 0.5 && f.price < 5)
    .map(f => f.price);
  if (!prezzi.length) return null;
  return Math.round(prezzi.reduce((a, b) => a + b, 0) / prezzi.length * 1000) / 1000;
}

function calcolaMin(impianti, fuelId, isSelf) {
  const prezzi = impianti
    .flatMap(i => i.fuels)
    .filter(f => f.fuelId === fuelId && f.isSelf === isSelf && f.price > 0.5 && f.price < 5)
    .map(f => f.price);
  if (!prezzi.length) return null;
  return Math.min(...prezzi);
}

async function main() {
  const oggi = new Date().toISOString().split('T')[0];
  console.log(`=== Fetch prezzi carburanti — ${oggi} ===`);

  const datiProvince = {};
  const datiRegioni = {};

  for (const prov of PROVINCE) {
    console.log(`[${prov.sigla}] ${prov.nome}...`);
    const impianti = await fetchZona(prov.lat, prov.lng);
    console.log(`  ${impianti.length} impianti trovati`);

    const slug = slugify(prov.nome);
    datiProvince[slug] = {
      sigla: prov.sigla,
      nome: prov.nome,
      regione: prov.regione,
      slug,
      aggiornato: oggi,
      impianti_count: impianti.length,
      prezzi: {},
    };

    for (const carb of CARBURANTI) {
      const selfMedia = calcolaMedia(impianti, carb.id, true);
      const servitoMedia = calcolaMedia(impianti, carb.id, false);
      const selfMin = calcolaMin(impianti, carb.id, true);
      if (selfMedia || servitoMedia) {
        datiProvince[slug].prezzi[carb.nome] = {
          label: carb.label,
          self_media: selfMedia,
          servito_media: servitoMedia,
          self_min: selfMin,
        };
      }
    }

    // Aggrega per regione
    const regSlug = slugify(prov.regione);
    if (!datiRegioni[regSlug]) {
      datiRegioni[regSlug] = {
        nome: prov.regione,
        slug: regSlug,
        aggiornato: oggi,
        impianti_count: 0,
        _impianti: [],
      };
    }
    datiRegioni[regSlug].impianti_count += impianti.length;
    datiRegioni[regSlug]._impianti.push(...impianti);

    await sleep(DELAY);
  }

  // Calcola medie regionali
  for (const regSlug of Object.keys(datiRegioni)) {
    const reg = datiRegioni[regSlug];
    reg.prezzi = {};
    for (const carb of CARBURANTI) {
      const selfMedia = calcolaMedia(reg._impianti, carb.id, true);
      const servitoMedia = calcolaMedia(reg._impianti, carb.id, false);
      const selfMin = calcolaMin(reg._impianti, carb.id, true);
      if (selfMedia || servitoMedia) {
        reg.prezzi[carb.nome] = {
          label: carb.label,
          self_media: selfMedia,
          servito_media: servitoMedia,
          self_min: selfMin,
        };
      }
    }
    delete reg._impianti;
  }

  // Calcola media nazionale
  const tuttiImpianti = Object.values(datiProvince).flatMap(p => []);
  // Per la nazionale usiamo le medie delle province
  const nazionale = { aggiornato: oggi, prezzi: {} };
  for (const carb of CARBURANTI) {
    const selfVals = Object.values(datiProvince)
      .map(p => p.prezzi[carb.nome]?.self_media)
      .filter(Boolean);
    const servitoVals = Object.values(datiProvince)
      .map(p => p.prezzi[carb.nome]?.servito_media)
      .filter(Boolean);
    if (selfVals.length) {
      nazionale.prezzi[carb.nome] = {
        label: carb.label,
        self_media: Math.round(selfVals.reduce((a,b)=>a+b,0)/selfVals.length*1000)/1000,
        servito_media: servitoVals.length
          ? Math.round(servitoVals.reduce((a,b)=>a+b,0)/servitoVals.length*1000)/1000
          : null,
      };
    }
  }

  // Salva i JSON
  mkdirSync('./public/data', { recursive: true });
  writeFileSync('./public/data/province.json', JSON.stringify(datiProvince, null, 2));
  writeFileSync('./public/data/regioni.json', JSON.stringify(datiRegioni, null, 2));
  writeFileSync('./public/data/nazionale.json', JSON.stringify(nazionale, null, 2));

  // Indice per le pagine statiche
  const indice = {
    aggiornato: oggi,
    province: Object.values(datiProvince).map(p => ({ slug: p.slug, nome: p.nome, sigla: p.sigla, regione: p.regione })),
    regioni: Object.values(datiRegioni).map(r => ({ slug: r.slug, nome: r.nome })),
  };
  writeFileSync('./public/data/indice.json', JSON.stringify(indice, null, 2));

  console.log('\n=== Completato ===');
  console.log(`Province: ${Object.keys(datiProvince).length}`);
  console.log(`Regioni: ${Object.keys(datiRegioni).length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
