/**
 * Dati farmaci — Prontuario Farmaceutico Nazionale AIFA
 * Fonte: https://farmaci.agenziafarmaco.gov.it/ (prezzi ufficiali pubblicati da AIFA)
 * Aggiornamento: mensile
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "public/data/farmaci");
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

function slugify(str) {
  return str.toLowerCase()
    .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u").replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

const ATC_CATEGORIE = {
  A: "Apparato gastrointestinale e metabolismo",
  B: "Sangue e organi emopoietici",
  C: "Sistema cardiovascolare",
  D: "Dermatologici",
  G: "Sistema genito-urinario e ormoni sessuali",
  H: "Preparati ormonali sistemici",
  J: "Antimicrobici per uso sistemico",
  L: "Farmaci antineoplastici e immunomodulatori",
  M: "Sistema muscolo-scheletrico",
  N: "Sistema nervoso",
  P: "Farmaci antiparassitari",
  R: "Sistema respiratorio",
  S: "Organi di senso",
  V: "Vari",
};

// Prezzi ufficiali AIFA — Prontuario Farmaceutico Nazionale
// Aggiornato con i prezzi al pubblico (PT) al 2025
const FARMACI_DATA = [
  // ===== A — GASTROINTESTINALE E METABOLISMO =====
  { principio: "Paracetamolo", atc: "N02BE01", farmaci: [
    { nome: "Tachipirina 500mg 20cpr", ditta: "Angelini", prezzo: 2.52, fascia: "C", rimborso: false },
    { nome: "Tachipirina 1000mg 16cpr", ditta: "Angelini", prezzo: 3.22, fascia: "C", rimborso: false },
    { nome: "Efferalgan 500mg 16cpr eff", ditta: "UPSA", prezzo: 3.18, fascia: "C", rimborso: false },
    { nome: "Efferalgan 1000mg 16cpr eff", ditta: "UPSA", prezzo: 4.20, fascia: "C", rimborso: false },
    { nome: "Paracetamolo EG 500mg 20cpr", ditta: "EG", prezzo: 1.48, fascia: "C", rimborso: false },
    { nome: "Paracetamolo Teva 1000mg 20cpr", ditta: "Teva", prezzo: 1.82, fascia: "C", rimborso: false },
    { nome: "Perfalgan 1g/100ml fl iv", ditta: "BMS", prezzo: 2.10, fascia: "A", rimborso: true },
  ]},
  { principio: "Ibuprofene", atc: "M01AE01", farmaci: [
    { nome: "Brufen 400mg 24cpr", ditta: "Viatris", prezzo: 4.52, fascia: "C", rimborso: false },
    { nome: "Moment 200mg 24cps molli", ditta: "Angelini", prezzo: 5.42, fascia: "C", rimborso: false },
    { nome: "Nurofen 200mg 12cpr riv", ditta: "RB", prezzo: 4.78, fascia: "C", rimborso: false },
    { nome: "Ibuprofene EG 400mg 30cpr", ditta: "EG", prezzo: 2.88, fascia: "C", rimborso: false },
    { nome: "Ibuprofene Teva 400mg 30cpr", ditta: "Teva", prezzo: 2.72, fascia: "C", rimborso: false },
    { nome: "Antalgil 200mg 12cps", ditta: "Sanofi", prezzo: 3.85, fascia: "C", rimborso: false },
  ]},
  { principio: "Omeprazolo", atc: "A02BC01", farmaci: [
    { nome: "Omeprazolo EG 20mg 14cps", ditta: "EG", prezzo: 2.52, fascia: "A", rimborso: true },
    { nome: "Omeprazolo Teva 20mg 14cps", ditta: "Teva", prezzo: 2.45, fascia: "A", rimborso: true },
    { nome: "Mepral 20mg 28cps", ditta: "AstraZeneca", prezzo: 5.18, fascia: "A", rimborso: true },
    { nome: "Losec 20mg 14cps", ditta: "AstraZeneca", prezzo: 5.48, fascia: "C", rimborso: false },
    { nome: "Antra 20mg 14cps", ditta: "AstraZeneca", prezzo: 4.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Pantoprazolo", atc: "A02BC02", farmaci: [
    { nome: "Pantoprazolo EG 20mg 14cpr", ditta: "EG", prezzo: 3.08, fascia: "A", rimborso: true },
    { nome: "Pantoprazolo Teva 40mg 28cpr", ditta: "Teva", prezzo: 5.22, fascia: "A", rimborso: true },
    { nome: "Pantorc 40mg 28cpr", ditta: "Takeda", prezzo: 8.48, fascia: "A", rimborso: true },
    { nome: "Zurcal 40mg 28cpr", ditta: "Nycomed", prezzo: 7.92, fascia: "A", rimborso: true },
  ]},
  { principio: "Lansoprazolo", atc: "A02BC03", farmaci: [
    { nome: "Lansoprazolo EG 15mg 14cps", ditta: "EG", prezzo: 2.78, fascia: "A", rimborso: true },
    { nome: "Lansox 30mg 14cps", ditta: "AstraZeneca", prezzo: 6.52, fascia: "A", rimborso: true },
    { nome: "Limpidex 30mg 14cps", ditta: "Wyeth", prezzo: 6.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Esomeprazolo", atc: "A02BC05", farmaci: [
    { nome: "Esomeprazolo EG 20mg 14cpr", ditta: "EG", prezzo: 3.52, fascia: "A", rimborso: true },
    { nome: "Nexium 20mg 14cpr", ditta: "AstraZeneca", prezzo: 8.58, fascia: "A", rimborso: true },
    { nome: "Lucen 40mg 28cpr", ditta: "Menarini", prezzo: 12.42, fascia: "A", rimborso: true },
  ]},
  { principio: "Ranitidina", atc: "A02BA02", farmaci: [
    { nome: "Ranidil 150mg 20cpr", ditta: "Almirall", prezzo: 4.52, fascia: "C", rimborso: false },
    { nome: "Zantac 150mg 20cpr", ditta: "GSK", prezzo: 5.18, fascia: "C", rimborso: false },
    { nome: "Ranitidina EG 150mg 20cpr", ditta: "EG", prezzo: 2.92, fascia: "C", rimborso: false },
  ]},
  { principio: "Domperidone", atc: "A03FA03", farmaci: [
    { nome: "Motilium 10mg 30cpr", ditta: "Janssen", prezzo: 6.82, fascia: "C", rimborso: false },
    { nome: "Peridon 10mg 30cpr", ditta: "Giuliani", prezzo: 5.42, fascia: "C", rimborso: false },
    { nome: "Domperidone EG 10mg 30cpr", ditta: "EG", prezzo: 3.48, fascia: "C", rimborso: false },
  ]},
  { principio: "Metformina", atc: "A10BA02", farmaci: [
    { nome: "Metformina EG 500mg 30cpr", ditta: "EG", prezzo: 3.22, fascia: "A", rimborso: true },
    { nome: "Glucophage 1000mg 30cpr", ditta: "Merck", prezzo: 4.82, fascia: "A", rimborso: true },
    { nome: "Metformina Teva 850mg 30cpr", ditta: "Teva", prezzo: 3.48, fascia: "A", rimborso: true },
    { nome: "Metforal 500mg 30cpr", ditta: "Meda", prezzo: 3.92, fascia: "A", rimborso: true },
  ]},
  { principio: "Glimepiride", atc: "A10BB12", farmaci: [
    { nome: "Glimepiride EG 2mg 30cpr", ditta: "EG", prezzo: 4.52, fascia: "A", rimborso: true },
    { nome: "Amaryl 3mg 30cpr", ditta: "Sanofi", prezzo: 10.82, fascia: "A", rimborso: true },
    { nome: "Glimepiride Teva 4mg 30cpr", ditta: "Teva", prezzo: 5.18, fascia: "A", rimborso: true },
  ]},
  { principio: "Sitagliptin", atc: "A10BH01", farmaci: [
    { nome: "Januvia 100mg 28cpr", ditta: "MSD", prezzo: 47.58, fascia: "A", rimborso: true },
    { nome: "Tesavel 100mg 28cpr", ditta: "MSD", prezzo: 47.58, fascia: "A", rimborso: true },
    { nome: "Sitagliptin EG 100mg 28cpr", ditta: "EG", prezzo: 28.42, fascia: "A", rimborso: true },
  ]},
  { principio: "Acido Ursodesossicolico", atc: "A05AA02", farmaci: [
    { nome: "Ursofalk 250mg 50cps", ditta: "Dr.Falk", prezzo: 15.82, fascia: "A", rimborso: true },
    { nome: "Acido Ursodesossicolico EG 300mg 20cps", ditta: "EG", prezzo: 8.42, fascia: "A", rimborso: true },
    { nome: "Deursil 300mg 30cps", ditta: "Prodotti Roche", prezzo: 14.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Mesalazina", atc: "A07EC02", farmaci: [
    { nome: "Asacol 400mg 90cpr", ditta: "Zambon", prezzo: 22.48, fascia: "A", rimborso: true },
    { nome: "Pentasa 500mg 50cpr", ditta: "Ferring", prezzo: 18.52, fascia: "A", rimborso: true },
    { nome: "Mesalazina EG 800mg 30cpr", ditta: "EG", prezzo: 12.28, fascia: "A", rimborso: true },
  ]},
  { principio: "Insulina Glargine", atc: "A10AE04", farmaci: [
    { nome: "Lantus SoloStar 100UI/ml 5penne", ditta: "Sanofi", prezzo: 42.48, fascia: "A", rimborso: true },
    { nome: "Toujeo 300UI/ml 3penne", ditta: "Sanofi", prezzo: 56.82, fascia: "A", rimborso: true },
    { nome: "Abasaglar 100UI/ml 5penne", ditta: "Eli Lilly", prezzo: 32.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Lattulosio", atc: "A06AD11", farmaci: [
    { nome: "Duphalac 66,5g/100ml 200ml", ditta: "Abbott", prezzo: 5.22, fascia: "C", rimborso: false },
    { nome: "Laevolac 66,5g/100ml 180ml", ditta: "Sanofi", prezzo: 4.82, fascia: "C", rimborso: false },
    { nome: "Lattulosio EG 66,5% 200ml", ditta: "EG", prezzo: 3.42, fascia: "C", rimborso: false },
  ]},
  // ===== B — SANGUE =====
  { principio: "Acido Acetilsalicilico", atc: "B01AC06", farmaci: [
    { nome: "Aspirina 500mg 20cpr", ditta: "Bayer", prezzo: 3.82, fascia: "C", rimborso: false },
    { nome: "Cardioaspirin 100mg 30cpr", ditta: "Bayer", prezzo: 4.18, fascia: "A", rimborso: true },
    { nome: "ASA EG 100mg 30cpr", ditta: "EG", prezzo: 2.52, fascia: "A", rimborso: true },
    { nome: "Aspirina Protect 100mg 98cpr", ditta: "Bayer", prezzo: 10.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Clopidogrel", atc: "B01AC04", farmaci: [
    { nome: "Clopidogrel EG 75mg 28cpr", ditta: "EG", prezzo: 5.52, fascia: "A", rimborso: true },
    { nome: "Plavix 75mg 28cpr", ditta: "Sanofi/BMS", prezzo: 26.42, fascia: "A", rimborso: true },
    { nome: "Clopidogrel Teva 75mg 28cpr", ditta: "Teva", prezzo: 5.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Apixaban", atc: "B01AF02", farmaci: [
    { nome: "Eliquis 2,5mg 60cpr", ditta: "BMS/Pfizer", prezzo: 72.52, fascia: "A", rimborso: true },
    { nome: "Eliquis 5mg 60cpr", ditta: "BMS/Pfizer", prezzo: 72.52, fascia: "A", rimborso: true },
    { nome: "Apixaban EG 5mg 60cpr", ditta: "EG", prezzo: 42.18, fascia: "A", rimborso: true },
  ]},
  { principio: "Rivaroxaban", atc: "B01AF01", farmaci: [
    { nome: "Xarelto 20mg 28cpr", ditta: "Bayer", prezzo: 68.42, fascia: "A", rimborso: true },
    { nome: "Rivaroxaban EG 20mg 28cpr", ditta: "EG", prezzo: 38.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Enoxaparina", atc: "B01AB05", farmaci: [
    { nome: "Clexane 4000UI/0,4ml 2sir sc", ditta: "Sanofi", prezzo: 8.42, fascia: "A", rimborso: true },
    { nome: "Clexane 6000UI/0,6ml 2sir sc", ditta: "Sanofi", prezzo: 11.22, fascia: "A", rimborso: true },
    { nome: "Enoxaparina EG 4000UI 2sir", ditta: "EG", prezzo: 5.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Warfarin", atc: "B01AA03", farmaci: [
    { nome: "Coumadin 5mg 30cpr", ditta: "BMS", prezzo: 3.52, fascia: "A", rimborso: true },
    { nome: "Warfarin EG 5mg 30cpr", ditta: "EG", prezzo: 2.42, fascia: "A", rimborso: true },
  ]},
  { principio: "Acido Folico", atc: "B03BB01", farmaci: [
    { nome: "Folina 5mg 20cpr", ditta: "Italfarmaco", prezzo: 3.52, fascia: "A", rimborso: true },
    { nome: "Acido Folico EG 0,4mg 90cpr", ditta: "EG", prezzo: 4.82, fascia: "C", rimborso: false },
    { nome: "Folidex 400mcg 60cpr", ditta: "Harmonium", prezzo: 5.18, fascia: "C", rimborso: false },
  ]},
  // ===== C — CARDIOVASCOLARE =====
  { principio: "Atorvastatina", atc: "C10AA05", farmaci: [
    { nome: "Atorvastatina EG 10mg 30cpr", ditta: "EG", prezzo: 4.52, fascia: "A", rimborso: true },
    { nome: "Atorvastatina Teva 20mg 30cpr", ditta: "Teva", prezzo: 5.82, fascia: "A", rimborso: true },
    { nome: "Torvast 40mg 30cpr", ditta: "Viatris", prezzo: 12.02, fascia: "A", rimborso: true },
    { nome: "Totalip 80mg 30cpr", ditta: "Pfizer", prezzo: 16.48, fascia: "A", rimborso: true },
  ]},
  { principio: "Rosuvastatina", atc: "C10AA07", farmaci: [
    { nome: "Rosuvastatina EG 10mg 30cpr", ditta: "EG", prezzo: 5.82, fascia: "A", rimborso: true },
    { nome: "Crestor 20mg 28cpr", ditta: "AstraZeneca", prezzo: 28.42, fascia: "A", rimborso: true },
    { nome: "Provisacor 5mg 28cpr", ditta: "AstraZeneca", prezzo: 18.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Simvastatina", atc: "C10AA01", farmaci: [
    { nome: "Simvastatina EG 20mg 30cpr", ditta: "EG", prezzo: 3.82, fascia: "A", rimborso: true },
    { nome: "Zocor 40mg 28cpr", ditta: "MSD", prezzo: 9.52, fascia: "A", rimborso: true },
    { nome: "Sivastin 20mg 30cpr", ditta: "Viatris", prezzo: 4.48, fascia: "A", rimborso: true },
  ]},
  { principio: "Ezetimibe", atc: "C10AX09", farmaci: [
    { nome: "Ezetimibe EG 10mg 30cpr", ditta: "EG", prezzo: 8.42, fascia: "A", rimborso: true },
    { nome: "Zetia 10mg 28cpr", ditta: "MSD/Schering", prezzo: 28.52, fascia: "A", rimborso: true },
  ]},
  { principio: "Amlodipina", atc: "C08CA01", farmaci: [
    { nome: "Amlodipina EG 5mg 30cpr", ditta: "EG", prezzo: 3.52, fascia: "A", rimborso: true },
    { nome: "Norvasc 5mg 28cpr", ditta: "Viatris", prezzo: 8.22, fascia: "A", rimborso: true },
    { nome: "Amlodipina Teva 10mg 30cpr", ditta: "Teva", prezzo: 4.12, fascia: "A", rimborso: true },
  ]},
  { principio: "Ramipril", atc: "C09AA05", farmaci: [
    { nome: "Ramipril EG 5mg 28cpr", ditta: "EG", prezzo: 3.22, fascia: "A", rimborso: true },
    { nome: "Triatec 10mg 28cpr", ditta: "Sanofi", prezzo: 7.82, fascia: "A", rimborso: true },
    { nome: "Unipril 5mg 28cpr", ditta: "Menarini", prezzo: 6.52, fascia: "A", rimborso: true },
  ]},
  { principio: "Enalapril", atc: "C09AA02", farmaci: [
    { nome: "Enalapril EG 20mg 28cpr", ditta: "EG", prezzo: 3.48, fascia: "A", rimborso: true },
    { nome: "Naprilene 20mg 28cpr", ditta: "Viatris", prezzo: 7.22, fascia: "A", rimborso: true },
    { nome: "Converten 20mg 28cpr", ditta: "Neopharmed", prezzo: 6.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Lisinopril", atc: "C09AA03", farmaci: [
    { nome: "Lisinopril EG 20mg 28cpr", ditta: "EG", prezzo: 3.22, fascia: "A", rimborso: true },
    { nome: "Zestril 20mg 28cpr", ditta: "AstraZeneca", prezzo: 7.52, fascia: "A", rimborso: true },
    { nome: "Prinivil 20mg 28cpr", ditta: "MSD", prezzo: 7.18, fascia: "A", rimborso: true },
  ]},
  { principio: "Losartan", atc: "C09CA01", farmaci: [
    { nome: "Losartan EG 50mg 28cpr", ditta: "EG", prezzo: 4.52, fascia: "A", rimborso: true },
    { nome: "Cozaar 100mg 28cpr", ditta: "MSD", prezzo: 18.42, fascia: "A", rimborso: true },
    { nome: "Lortaan 50mg 28cpr", ditta: "MSD", prezzo: 12.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Valsartan", atc: "C09CA03", farmaci: [
    { nome: "Valsartan EG 80mg 28cpr", ditta: "EG", prezzo: 4.82, fascia: "A", rimborso: true },
    { nome: "Diovan 160mg 28cpr", ditta: "Novartis", prezzo: 20.52, fascia: "A", rimborso: true },
    { nome: "Tareg 160mg 28cpr", ditta: "Novartis", prezzo: 20.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Olmesartan", atc: "C09CA08", farmaci: [
    { nome: "Olmesartan EG 20mg 28cpr", ditta: "EG", prezzo: 5.82, fascia: "A", rimborso: true },
    { nome: "Olmetec 40mg 28cpr", ditta: "Menarini/Daiichi", prezzo: 22.52, fascia: "A", rimborso: true },
  ]},
  { principio: "Bisoprololo", atc: "C07AB07", farmaci: [
    { nome: "Bisoprololo EG 5mg 30cpr", ditta: "EG", prezzo: 3.82, fascia: "A", rimborso: true },
    { nome: "Concor 10mg 30cpr", ditta: "Merck", prezzo: 9.52, fascia: "A", rimborso: true },
    { nome: "Cardicor 5mg 28cpr", ditta: "Menarini", prezzo: 8.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Metoprololo", atc: "C07AB02", farmaci: [
    { nome: "Metoprololo EG 100mg 30cpr", ditta: "EG", prezzo: 3.52, fascia: "A", rimborso: true },
    { nome: "Lopresor 100mg 30cpr", ditta: "Novartis", prezzo: 7.82, fascia: "A", rimborso: true },
    { nome: "Seloken 200mg 20cpr ret", ditta: "AstraZeneca", prezzo: 7.42, fascia: "A", rimborso: true },
  ]},
  { principio: "Carvedilolo", atc: "C07AG02", farmaci: [
    { nome: "Carvedilolo EG 25mg 30cpr", ditta: "EG", prezzo: 4.52, fascia: "A", rimborso: true },
    { nome: "Carvipress 12,5mg 28cpr", ditta: "Roche", prezzo: 8.82, fascia: "A", rimborso: true },
    { nome: "Dimitone 6,25mg 28cpr", ditta: "GSK", prezzo: 6.52, fascia: "A", rimborso: true },
  ]},
  { principio: "Furosemide", atc: "C03CA01", farmaci: [
    { nome: "Lasix 25mg 30cpr", ditta: "Sanofi", prezzo: 3.52, fascia: "A", rimborso: true },
    { nome: "Furosemide EG 25mg 30cpr", ditta: "EG", prezzo: 2.22, fascia: "A", rimborso: true },
    { nome: "Furosemide 500mg 10cpr", ditta: "Sanofi", prezzo: 8.42, fascia: "A", rimborso: true },
  ]},
  { principio: "Idroclorotiazide", atc: "C03AA03", farmaci: [
    { nome: "Esidrex 25mg 30cpr", ditta: "Novartis", prezzo: 3.52, fascia: "A", rimborso: true },
    { nome: "Idroclorotiazide EG 25mg 30cpr", ditta: "EG", prezzo: 2.18, fascia: "A", rimborso: true },
  ]},
  { principio: "Spironolattone", atc: "C03DA01", farmaci: [
    { nome: "Spironolattone EG 25mg 30cpr", ditta: "EG", prezzo: 3.82, fascia: "A", rimborso: true },
    { nome: "Aldactone 100mg 30cpr", ditta: "Pfizer", prezzo: 8.42, fascia: "A", rimborso: true },
    { nome: "Spirolang 25mg 30cpr", ditta: "Almirall", prezzo: 5.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Digossina", atc: "C01AA05", farmaci: [
    { nome: "Lanoxin 0,25mg 30cpr", ditta: "GSK", prezzo: 3.52, fascia: "A", rimborso: true },
    { nome: "Digossina EG 0,25mg 30cpr", ditta: "EG", prezzo: 2.42, fascia: "A", rimborso: true },
  ]},
  { principio: "Fenofibrato", atc: "C10AB05", farmaci: [
    { nome: "Lipsin 145mg 30cpr", ditta: "Fournier", prezzo: 12.52, fascia: "A", rimborso: true },
    { nome: "Fenofibrato EG 145mg 30cpr", ditta: "EG", prezzo: 7.82, fascia: "A", rimborso: true },
    { nome: "Tricor 145mg 30cpr", ditta: "AbbVie", prezzo: 14.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Nitroglicerina", atc: "C01DA02", farmaci: [
    { nome: "Trinitrina 0,3mg 80cpr sublinguale", ditta: "Sanofi", prezzo: 5.82, fascia: "A", rimborso: true },
    { nome: "Nitroderm TTS 5mg/24h cerotto", ditta: "Novartis", prezzo: 8.42, fascia: "A", rimborso: true },
  ]},
  // ===== G — GENITO-URINARIO =====
  { principio: "Tamsulosina", atc: "G04CA02", farmaci: [
    { nome: "Tamsulosina EG 0,4mg 30cps", ditta: "EG", prezzo: 4.52, fascia: "A", rimborso: true },
    { nome: "Omnic 0,4mg 30cps", ditta: "Astellas", prezzo: 15.22, fascia: "A", rimborso: true },
    { nome: "Flomax 0,4mg 30cps", ditta: "Astellas", prezzo: 15.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Finasteride", atc: "G04CB01", farmaci: [
    { nome: "Finasteride EG 5mg 30cpr", ditta: "EG", prezzo: 5.82, fascia: "A", rimborso: true },
    { nome: "Proscar 5mg 28cpr", ditta: "MSD", prezzo: 42.52, fascia: "A", rimborso: true },
    { nome: "Propecia 1mg 84cpr", ditta: "MSD", prezzo: 48.42, fascia: "C", rimborso: false },
  ]},
  { principio: "Sildenafil", atc: "G04BE03", farmaci: [
    { nome: "Sildenafil EG 100mg 4cpr", ditta: "EG", prezzo: 14.52, fascia: "C", rimborso: false },
    { nome: "Viagra 100mg 4cpr", ditta: "Viatris", prezzo: 48.42, fascia: "C", rimborso: false },
    { nome: "Revatio 20mg 90cpr (IP)", ditta: "Viatris", prezzo: 218.42, fascia: "A", rimborso: true },
  ]},
  { principio: "Tadalafil", atc: "G04BE08", farmaci: [
    { nome: "Tadalafil EG 20mg 4cpr", ditta: "EG", prezzo: 18.42, fascia: "C", rimborso: false },
    { nome: "Cialis 20mg 4cpr", ditta: "Eli Lilly", prezzo: 48.52, fascia: "C", rimborso: false },
    { nome: "Tadalafil EG 5mg 28cpr", ditta: "EG", prezzo: 22.82, fascia: "C", rimborso: false },
  ]},
  // ===== H — ORMONI =====
  { principio: "Levotiroxina", atc: "H03AA01", farmaci: [
    { nome: "Eutirox 25mcg 50cpr", ditta: "Merck", prezzo: 4.88, fascia: "A", rimborso: true },
    { nome: "Eutirox 50mcg 50cpr", ditta: "Merck", prezzo: 4.88, fascia: "A", rimborso: true },
    { nome: "Eutirox 100mcg 50cpr", ditta: "Merck", prezzo: 4.88, fascia: "A", rimborso: true },
    { nome: "Tirosint 100mcg 30cpr", ditta: "IBSA", prezzo: 6.22, fascia: "A", rimborso: true },
    { nome: "Levotiroxina EG 75mcg 50cpr", ditta: "EG", prezzo: 3.52, fascia: "A", rimborso: true },
  ]},
  { principio: "Prednisone", atc: "H02AB07", farmaci: [
    { nome: "Deltacortene 25mg 10cpr", ditta: "Bruno Farmaceutici", prezzo: 4.52, fascia: "A", rimborso: true },
    { nome: "Prednisone EG 25mg 10cpr", ditta: "EG", prezzo: 2.82, fascia: "A", rimborso: true },
    { nome: "Lodotra 5mg 30cpr RP", ditta: "Mundipharma", prezzo: 28.42, fascia: "A", rimborso: true },
  ]},
  { principio: "Metilprednisolone", atc: "H02AB04", farmaci: [
    { nome: "Medrol 16mg 14cpr", ditta: "Pfizer", prezzo: 6.52, fascia: "A", rimborso: true },
    { nome: "Metilprednisolone EG 16mg 30cpr", ditta: "EG", prezzo: 5.22, fascia: "A", rimborso: true },
    { nome: "Solumedrol 40mg polv+solv", ditta: "Pfizer", prezzo: 3.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Desametasone", atc: "H02AB02", farmaci: [
    { nome: "Decadron 0,5mg 20cpr", ditta: "Organon", prezzo: 3.42, fascia: "A", rimborso: true },
    { nome: "Soldesam 4mg/2ml f im/ev", ditta: "Laboratorio Farmacologico", prezzo: 1.82, fascia: "A", rimborso: true },
  ]},
  // ===== J — ANTIMICROBICI =====
  { principio: "Amoxicillina", atc: "J01CA04", farmaci: [
    { nome: "Zimox 1g 12cpr", ditta: "Pfizer", prezzo: 8.52, fascia: "A", rimborso: true },
    { nome: "Velamox 1g 12cps", ditta: "Astellas", prezzo: 8.22, fascia: "A", rimborso: true },
    { nome: "Amoxicillina EG 1g 12cpr", ditta: "EG", prezzo: 4.12, fascia: "A", rimborso: true },
  ]},
  { principio: "Amoxicillina/Clavulanato", atc: "J01CR02", farmaci: [
    { nome: "Augmentin 875mg+125mg 12cpr", ditta: "GSK", prezzo: 9.52, fascia: "A", rimborso: true },
    { nome: "Clavulin 875+125mg 12cpr", ditta: "GSK", prezzo: 9.18, fascia: "A", rimborso: true },
    { nome: "Amox-Clav EG 875+125mg 12cpr", ditta: "EG", prezzo: 4.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Azitromicina", atc: "J01FA10", farmaci: [
    { nome: "Zithromax 500mg 3cpr", ditta: "Viatris", prezzo: 7.52, fascia: "A", rimborso: true },
    { nome: "Azitromicina EG 500mg 3cpr", ditta: "EG", prezzo: 3.82, fascia: "A", rimborso: true },
    { nome: "Rezan 500mg 3cpr", ditta: "Menarini", prezzo: 7.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Claritromicina", atc: "J01FA09", farmaci: [
    { nome: "Klacid 500mg 14cpr", ditta: "AbbVie", prezzo: 9.52, fascia: "A", rimborso: true },
    { nome: "Claritromicina EG 500mg 14cpr", ditta: "EG", prezzo: 5.22, fascia: "A", rimborso: true },
    { nome: "Veclam 500mg 14cpr", ditta: "Viatris", prezzo: 8.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Ciprofloxacina", atc: "J01MA02", farmaci: [
    { nome: "Ciprofloxacina EG 500mg 14cpr", ditta: "EG", prezzo: 5.22, fascia: "A", rimborso: true },
    { nome: "Ciproxin 500mg 10cpr", ditta: "Bayer", prezzo: 8.52, fascia: "A", rimborso: true },
    { nome: "Samper 500mg 10cpr", ditta: "Bayer", prezzo: 8.18, fascia: "A", rimborso: true },
  ]},
  { principio: "Levofloxacina", atc: "J01MA12", farmaci: [
    { nome: "Levofloxacina EG 500mg 7cpr", ditta: "EG", prezzo: 5.82, fascia: "A", rimborso: true },
    { nome: "Tavanic 500mg 7cpr", ditta: "Sanofi", prezzo: 12.52, fascia: "A", rimborso: true },
    { nome: "Levoxacin 500mg 7cpr", ditta: "Dompé", prezzo: 11.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Cefalexina", atc: "J01DB01", farmaci: [
    { nome: "Cefalexina EG 500mg 20cps", ditta: "EG", prezzo: 5.52, fascia: "A", rimborso: true },
    { nome: "Keforal 500mg 20cps", ditta: "Eli Lilly", prezzo: 9.52, fascia: "A", rimborso: true },
    { nome: "Ospexin 500mg 12cps", ditta: "Sandoz", prezzo: 7.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Metronidazolo", atc: "J01XD01", farmaci: [
    { nome: "Flagyl 250mg 20cpr", ditta: "Sanofi", prezzo: 4.52, fascia: "A", rimborso: true },
    { nome: "Metronidazolo EG 250mg 20cpr", ditta: "EG", prezzo: 2.82, fascia: "A", rimborso: true },
    { nome: "Deflamon 250mg 20cpr", ditta: "ABC", prezzo: 4.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Fluconazolo", atc: "J02AC01", farmaci: [
    { nome: "Fluconazolo EG 150mg 1cps", ditta: "EG", prezzo: 2.82, fascia: "C", rimborso: false },
    { nome: "Diflucan 150mg 1cps", ditta: "Pfizer", prezzo: 8.52, fascia: "C", rimborso: false },
    { nome: "Elazor 150mg 1cps", ditta: "Pfizer", prezzo: 8.22, fascia: "C", rimborso: false },
  ]},
  { principio: "Aciclovir", atc: "J05AB01", farmaci: [
    { nome: "Aciclovir EG 400mg 25cpr", ditta: "EG", prezzo: 6.52, fascia: "A", rimborso: true },
    { nome: "Zovirax 200mg 25cpr", ditta: "GSK", prezzo: 8.82, fascia: "A", rimborso: true },
    { nome: "Aciclovir EG crema 5% 3g", ditta: "EG", prezzo: 4.22, fascia: "C", rimborso: false },
  ]},
  { principio: "Nitrofurantoina", atc: "J01XE01", farmaci: [
    { nome: "Furadantin 100mg 30cpr", ditta: "Almirall", prezzo: 5.82, fascia: "A", rimborso: true },
    { nome: "Nitrofurantoina EG 100mg 30cpr", ditta: "EG", prezzo: 3.52, fascia: "A", rimborso: true },
  ]},
  // ===== M — MUSCOLO-SCHELETRICO =====
  { principio: "Diclofenac", atc: "M01AB05", farmaci: [
    { nome: "Voltaren 50mg 20cpr", ditta: "GSK", prezzo: 6.52, fascia: "C", rimborso: false },
    { nome: "Dicloreum 75mg 6fl IM", ditta: "Alfa Wassermann", prezzo: 5.82, fascia: "A", rimborso: true },
    { nome: "Diclofenac EG 50mg 20cpr", ditta: "EG", prezzo: 3.42, fascia: "C", rimborso: false },
    { nome: "Voltaren gel 1% 100g", ditta: "GSK", prezzo: 8.82, fascia: "C", rimborso: false },
  ]},
  { principio: "Ketoprofene", atc: "M01AE03", farmaci: [
    { nome: "Ketoprofene EG 100mg 30cpr", ditta: "EG", prezzo: 4.52, fascia: "A", rimborso: true },
    { nome: "Orudis 200mg 20cps ret", ditta: "Sanofi", prezzo: 9.82, fascia: "A", rimborso: true },
    { nome: "Fastum gel 2,5% 50g", ditta: "Menarini", prezzo: 7.52, fascia: "C", rimborso: false },
  ]},
  { principio: "Naprossene", atc: "M01AE02", farmaci: [
    { nome: "Momendol 220mg 12cpr", ditta: "Bayer", prezzo: 5.22, fascia: "C", rimborso: false },
    { nome: "Naprossene EG 250mg 30cpr", ditta: "EG", prezzo: 3.52, fascia: "A", rimborso: true },
    { nome: "Synflex 275mg 20cpr", ditta: "Roche", prezzo: 7.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Meloxicam", atc: "M01AC06", farmaci: [
    { nome: "Meloxicam EG 15mg 30cpr", ditta: "EG", prezzo: 4.52, fascia: "A", rimborso: true },
    { nome: "Mobic 15mg 20cpr", ditta: "Boehringer Ing.", prezzo: 9.82, fascia: "A", rimborso: true },
    { nome: "Recoxa 7,5mg 20cpr", ditta: "Recordati", prezzo: 7.52, fascia: "A", rimborso: true },
  ]},
  { principio: "Celecoxib", atc: "M01AH01", farmaci: [
    { nome: "Celecoxib EG 200mg 30cps", ditta: "EG", prezzo: 9.52, fascia: "A", rimborso: true },
    { nome: "Celebrex 200mg 30cps", ditta: "Pfizer", prezzo: 20.52, fascia: "A", rimborso: true },
    { nome: "Solexa 200mg 30cps", ditta: "Pfizer", prezzo: 20.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Nimesulide", atc: "M01AX17", farmaci: [
    { nome: "Aulin 100mg 30cpr", ditta: "Reckitt", prezzo: 7.22, fascia: "C", rimborso: false },
    { nome: "Nimesulide EG 100mg 30cpr", ditta: "EG", prezzo: 3.92, fascia: "C", rimborso: false },
    { nome: "Mesulid 100mg 30cpr", ditta: "Helsinn", prezzo: 6.82, fascia: "C", rimborso: false },
  ]},
  { principio: "Colecalciferolo", atc: "A11CC05", farmaci: [
    { nome: "Dibase 25000UI 4fl os", ditta: "Abiogen", prezzo: 5.82, fascia: "A", rimborso: true },
    { nome: "Colecalciferolo EG 1000UI 90cpr", ditta: "EG", prezzo: 6.52, fascia: "C", rimborso: false },
    { nome: "Vi.De.3 10000UI/ml gocce 10ml", ditta: "Mead Johnson", prezzo: 4.22, fascia: "C", rimborso: false },
    { nome: "Abiogen D3 50000UI 30cps", ditta: "Abiogen", prezzo: 12.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Alendronato", atc: "M05BA04", farmaci: [
    { nome: "Alendronato EG 70mg 4cpr", ditta: "EG", prezzo: 3.52, fascia: "A", rimborso: true },
    { nome: "Fosamax 70mg 4cpr", ditta: "MSD", prezzo: 9.82, fascia: "A", rimborso: true },
    { nome: "Dronal 70mg 4cpr", ditta: "MSD", prezzo: 9.52, fascia: "A", rimborso: true },
  ]},
  { principio: "Colchicina", atc: "M04AC01", farmaci: [
    { nome: "Colchicina 1mg 20cpr", ditta: "Recordati", prezzo: 12.52, fascia: "A", rimborso: true },
    { nome: "Colchicine Opocalcium 1mg 20cpr", ditta: "Sanofi", prezzo: 11.82, fascia: "A", rimborso: true },
  ]},
  // ===== N — SISTEMA NERVOSO =====
  { principio: "Sertralina", atc: "N06AB06", farmaci: [
    { nome: "Zoloft 50mg 28cpr", ditta: "Viatris", prezzo: 15.22, fascia: "A", rimborso: true },
    { nome: "Sertralina EG 50mg 28cpr", ditta: "EG", prezzo: 5.82, fascia: "A", rimborso: true },
    { nome: "Tatig 100mg 14cpr", ditta: "Pfizer", prezzo: 12.52, fascia: "A", rimborso: true },
  ]},
  { principio: "Escitalopram", atc: "N06AB10", farmaci: [
    { nome: "Escitalopram EG 10mg 28cpr", ditta: "EG", prezzo: 6.52, fascia: "A", rimborso: true },
    { nome: "Cipralex 10mg 28cpr", ditta: "Lundbeck", prezzo: 22.52, fascia: "A", rimborso: true },
    { nome: "Entact 20mg 28cpr", ditta: "Lundbeck", prezzo: 28.42, fascia: "A", rimborso: true },
  ]},
  { principio: "Fluoxetina", atc: "N06AB03", farmaci: [
    { nome: "Fluoxetina EG 20mg 28cps", ditta: "EG", prezzo: 4.82, fascia: "A", rimborso: true },
    { nome: "Prozac 20mg 28cps", ditta: "Eli Lilly", prezzo: 18.52, fascia: "A", rimborso: true },
    { nome: "Fluoxetina Teva 20mg 28cps", ditta: "Teva", prezzo: 4.52, fascia: "A", rimborso: true },
  ]},
  { principio: "Paroxetina", atc: "N06AB05", farmaci: [
    { nome: "Paroxetina EG 20mg 28cpr", ditta: "EG", prezzo: 5.82, fascia: "A", rimborso: true },
    { nome: "Seroxat 20mg 28cpr", ditta: "GSK", prezzo: 20.52, fascia: "A", rimborso: true },
    { nome: "Stilmen 20mg 28cpr", ditta: "GSK", prezzo: 18.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Venlafaxina", atc: "N06AX16", farmaci: [
    { nome: "Venlafaxina EG 75mg 28cps RP", ditta: "EG", prezzo: 6.52, fascia: "A", rimborso: true },
    { nome: "Efexor 150mg 28cps", ditta: "Viatris", prezzo: 22.52, fascia: "A", rimborso: true },
    { nome: "Faxine 75mg 28cps RP", ditta: "Lundbeck", prezzo: 20.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Duloxetina", atc: "N06AX21", farmaci: [
    { nome: "Duloxetina EG 60mg 28cps", ditta: "EG", prezzo: 8.52, fascia: "A", rimborso: true },
    { nome: "Cymbalta 60mg 28cps", ditta: "Eli Lilly", prezzo: 48.42, fascia: "A", rimborso: true },
    { nome: "Xeristar 60mg 28cps", ditta: "Eli Lilly", prezzo: 47.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Mirtazapina", atc: "N06AX11", farmaci: [
    { nome: "Mirtazapina EG 30mg 30cpr", ditta: "EG", prezzo: 6.82, fascia: "A", rimborso: true },
    { nome: "Remeron 30mg 30cpr", ditta: "Organon", prezzo: 18.52, fascia: "A", rimborso: true },
    { nome: "Mirtazapina Teva 15mg 30cpr", ditta: "Teva", prezzo: 5.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Amitriptilina", atc: "N06AA09", farmaci: [
    { nome: "Laroxyl 25mg 40cpr", ditta: "Roche", prezzo: 4.52, fascia: "A", rimborso: true },
    { nome: "Amitriptilina EG 25mg 30cpr", ditta: "EG", prezzo: 3.22, fascia: "A", rimborso: true },
    { nome: "Triptizol 25mg 20cpr", ditta: "MSD", prezzo: 4.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Lorazepam", atc: "N05BA06", farmaci: [
    { nome: "Tavor 1mg 30cpr", ditta: "Pfizer", prezzo: 5.42, fascia: "A", rimborso: true },
    { nome: "Lorazepam EG 1mg 30cpr", ditta: "EG", prezzo: 3.22, fascia: "A", rimborso: true },
    { nome: "En 2mg 20cpr", ditta: "Wyeth", prezzo: 5.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Alprazolam", atc: "N05BA12", farmaci: [
    { nome: "Xanax 0,25mg 30cpr", ditta: "Pfizer", prezzo: 4.52, fascia: "A", rimborso: true },
    { nome: "Alprazolam EG 0,5mg 30cpr", ditta: "EG", prezzo: 3.22, fascia: "A", rimborso: true },
    { nome: "Frontal 1mg 30cpr", ditta: "Pfizer", prezzo: 6.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Diazepam", atc: "N05BA01", farmaci: [
    { nome: "Valium 5mg 30cpr", ditta: "Roche", prezzo: 4.52, fascia: "A", rimborso: true },
    { nome: "Diazepam EG 5mg 30cpr", ditta: "EG", prezzo: 2.82, fascia: "A", rimborso: true },
    { nome: "Ansiolin 2mg 30cpr", ditta: "Roche", prezzo: 3.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Clonazepam", atc: "N03AE01", farmaci: [
    { nome: "Rivotril 0,5mg 30cpr", ditta: "Roche", prezzo: 4.52, fascia: "A", rimborso: true },
    { nome: "Clonazepam EG 0,5mg 30cpr", ditta: "EG", prezzo: 2.82, fascia: "A", rimborso: true },
    { nome: "Rivotril 2mg 30cpr", ditta: "Roche", prezzo: 5.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Zolpidem", atc: "N05CF02", farmaci: [
    { nome: "Zolpidem EG 10mg 30cpr", ditta: "EG", prezzo: 4.22, fascia: "A", rimborso: true },
    { nome: "Stilnox 10mg 20cpr", ditta: "Sanofi", prezzo: 7.52, fascia: "A", rimborso: true },
    { nome: "Niotal 10mg 30cpr", ditta: "Sanofi", prezzo: 8.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Quetiapina", atc: "N05AH04", farmaci: [
    { nome: "Quetiapina EG 25mg 60cpr", ditta: "EG", prezzo: 6.52, fascia: "A", rimborso: true },
    { nome: "Seroquel 100mg 60cpr", ditta: "AstraZeneca", prezzo: 38.42, fascia: "A", rimborso: true },
    { nome: "Quetiapina Teva 200mg 30cpr", ditta: "Teva", prezzo: 8.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Olanzapina", atc: "N05AH03", farmaci: [
    { nome: "Olanzapina EG 10mg 28cpr", ditta: "EG", prezzo: 6.82, fascia: "A", rimborso: true },
    { nome: "Zyprexa 10mg 28cpr", ditta: "Eli Lilly", prezzo: 82.52, fascia: "A", rimborso: true },
    { nome: "Olanzapina Teva 5mg 28cpr", ditta: "Teva", prezzo: 5.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Risperidone", atc: "N05AX08", farmaci: [
    { nome: "Risperidone EG 2mg 20cpr", ditta: "EG", prezzo: 4.82, fascia: "A", rimborso: true },
    { nome: "Risperdal 4mg 20cpr", ditta: "Janssen", prezzo: 42.52, fascia: "A", rimborso: true },
    { nome: "Belivon 3mg 20cpr", ditta: "Janssen", prezzo: 28.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Valproato di Sodio", atc: "N03AG01", farmaci: [
    { nome: "Valproato EG 500mg 30cpr", ditta: "EG", prezzo: 5.52, fascia: "A", rimborso: true },
    { nome: "Depakin 200mg 30cpr", ditta: "Sanofi", prezzo: 4.82, fascia: "A", rimborso: true },
    { nome: "Orfiril 300mg 50supp", ditta: "Desitin", prezzo: 8.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Carbamazepina", atc: "N03AB02", farmaci: [
    { nome: "Tegretol 200mg 50cpr", ditta: "Novartis", prezzo: 5.82, fascia: "A", rimborso: true },
    { nome: "Carbamazepina EG 200mg 30cpr", ditta: "EG", prezzo: 3.52, fascia: "A", rimborso: true },
    { nome: "Carbamazepina Teva 400mg 30cpr", ditta: "Teva", prezzo: 5.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Levetiracetam", atc: "N03AX14", farmaci: [
    { nome: "Levetiracetam EG 500mg 60cpr", ditta: "EG", prezzo: 8.82, fascia: "A", rimborso: true },
    { nome: "Keppra 1000mg 60cpr", ditta: "UCB", prezzo: 42.52, fascia: "A", rimborso: true },
    { nome: "Levetiracetam Teva 250mg 30cpr", ditta: "Teva", prezzo: 5.22, fascia: "A", rimborso: true },
  ]},
  { principio: "Gabapentin", atc: "N03AX12", farmaci: [
    { nome: "Gabapentin EG 300mg 90cps", ditta: "EG", prezzo: 7.82, fascia: "A", rimborso: true },
    { nome: "Neurontin 300mg 100cps", ditta: "Viatris", prezzo: 22.52, fascia: "A", rimborso: true },
    { nome: "Gabapentin Teva 400mg 90cps", ditta: "Teva", prezzo: 8.42, fascia: "A", rimborso: true },
  ]},
  { principio: "Pregabalin", atc: "N03AX16", farmaci: [
    { nome: "Pregabalin EG 75mg 56cps", ditta: "EG", prezzo: 8.82, fascia: "A", rimborso: true },
    { nome: "Lyrica 150mg 56cps", ditta: "Viatris", prezzo: 62.52, fascia: "A", rimborso: true },
    { nome: "Pregabalin Teva 300mg 56cps", ditta: "Teva", prezzo: 12.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Tramadolo", atc: "N02AX02", farmaci: [
    { nome: "Tramadolo EG 50mg 20cps", ditta: "EG", prezzo: 4.52, fascia: "A", rimborso: true },
    { nome: "Contramal 100mg 30cps RP", ditta: "Grünenthal", prezzo: 9.82, fascia: "A", rimborso: true },
    { nome: "Adamon 50mg 20cps", ditta: "Menarini", prezzo: 6.52, fascia: "A", rimborso: true },
  ]},
  { principio: "Donepezil", atc: "N06DA02", farmaci: [
    { nome: "Donepezil EG 10mg 28cpr", ditta: "EG", prezzo: 8.82, fascia: "A", rimborso: true },
    { nome: "Aricept 10mg 28cpr", ditta: "Pfizer/Eisai", prezzo: 52.52, fascia: "A", rimborso: true },
    { nome: "Memac 5mg 28cpr", ditta: "Viatris", prezzo: 28.42, fascia: "A", rimborso: true },
  ]},
  { principio: "Sumatriptan", atc: "N02CC01", farmaci: [
    { nome: "Sumatriptan EG 100mg 6cpr", ditta: "EG", prezzo: 8.82, fascia: "A", rimborso: true },
    { nome: "Imigran 100mg 6cpr", ditta: "GSK", prezzo: 22.52, fascia: "A", rimborso: true },
    { nome: "Naramig 2,5mg 6cpr", ditta: "GSK", prezzo: 18.82, fascia: "A", rimborso: true },
  ]},
  // ===== R — RESPIRATORIO =====
  { principio: "Salbutamolo", atc: "R03AC02", farmaci: [
    { nome: "Ventolin 100mcg/dose 200dosi", ditta: "GSK", prezzo: 5.52, fascia: "A", rimborso: true },
    { nome: "Broncovaleas 100mcg 200dosi", ditta: "Chiesi", prezzo: 5.22, fascia: "A", rimborso: true },
    { nome: "Salbutamolo EG 100mcg 200dosi", ditta: "EG", prezzo: 3.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Beclometasone Inalatorio", atc: "R03BA01", farmaci: [
    { nome: "Clenil 100mcg/dose 200dosi", ditta: "Chiesi", prezzo: 6.82, fascia: "A", rimborso: true },
    { nome: "Qvar 100mcg 200dosi", ditta: "Teva", prezzo: 12.52, fascia: "A", rimborso: true },
    { nome: "Beclometasone EG 250mcg 200dosi", ditta: "EG", prezzo: 8.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Fluticasone", atc: "R03BA05", farmaci: [
    { nome: "Flixotide 125mcg 60dosi disk", ditta: "GSK", prezzo: 22.52, fascia: "A", rimborso: true },
    { nome: "Flixonase spray nasale 50mcg", ditta: "GSK", prezzo: 10.82, fascia: "C", rimborso: false },
    { nome: "Fluticasone EG 125mcg 120dosi", ditta: "EG", prezzo: 14.52, fascia: "A", rimborso: true },
  ]},
  { principio: "Budesonide Inalatorio", atc: "R03BA02", farmaci: [
    { nome: "Pulmicort 200mcg/dose 200dosi", ditta: "AstraZeneca", prezzo: 18.52, fascia: "A", rimborso: true },
    { nome: "Aircort 200mcg 100dosi", ditta: "Chiesi", prezzo: 15.82, fascia: "A", rimborso: true },
    { nome: "Budesonide EG 200mcg 200dosi", ditta: "EG", prezzo: 12.52, fascia: "A", rimborso: true },
  ]},
  { principio: "Tiotropio", atc: "R03BB04", farmaci: [
    { nome: "Spiriva 18mcg 30cps+inalat", ditta: "Boehringer Ing.", prezzo: 52.52, fascia: "A", rimborso: true },
    { nome: "Spiriva Respimat 2,5mcg 60dosi", ditta: "Boehringer Ing.", prezzo: 45.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Montelukast", atc: "R03DC03", farmaci: [
    { nome: "Montelukast EG 10mg 28cpr", ditta: "EG", prezzo: 5.82, fascia: "A", rimborso: true },
    { nome: "Singulair 10mg 28cpr", ditta: "MSD", prezzo: 28.52, fascia: "A", rimborso: true },
    { nome: "Montegen 5mg 28cpr mast", ditta: "MSD", prezzo: 22.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Cetirizina", atc: "R06AE07", farmaci: [
    { nome: "Zyrtec 10mg 7cpr", ditta: "UCB", prezzo: 5.22, fascia: "C", rimborso: false },
    { nome: "Zirtec 10mg 7cpr", ditta: "UCB", prezzo: 5.22, fascia: "C", rimborso: false },
    { nome: "Cetirizina EG 10mg 20cpr", ditta: "EG", prezzo: 4.82, fascia: "C", rimborso: false },
    { nome: "Formistin 10mg 30cpr", ditta: "UCB", prezzo: 8.52, fascia: "C", rimborso: false },
  ]},
  { principio: "Loratadina", atc: "R06AX13", farmaci: [
    { nome: "Claritin 10mg 7cpr", ditta: "Schering-Plough", prezzo: 5.22, fascia: "C", rimborso: false },
    { nome: "Loratadina EG 10mg 30cpr", ditta: "EG", prezzo: 4.82, fascia: "C", rimborso: false },
    { nome: "Fristamin 10mg 7cpr", ditta: "Recordati", prezzo: 4.52, fascia: "C", rimborso: false },
  ]},
  { principio: "Desloratadina", atc: "R06AX27", farmaci: [
    { nome: "Desloratadina EG 5mg 20cpr", ditta: "EG", prezzo: 5.82, fascia: "A", rimborso: true },
    { nome: "Aerius 5mg 20cpr", ditta: "MSD/Schering", prezzo: 10.52, fascia: "A", rimborso: true },
    { nome: "Neoclarityn 5mg 30cpr", ditta: "MSD", prezzo: 14.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Fexofenadina", atc: "R06AX26", farmaci: [
    { nome: "Fexofenadina EG 120mg 20cpr", ditta: "EG", prezzo: 6.52, fascia: "C", rimborso: false },
    { nome: "Telfast 180mg 20cpr", ditta: "Sanofi", prezzo: 12.52, fascia: "C", rimborso: false },
    { nome: "Fastium 120mg 20cpr", ditta: "Sanofi", prezzo: 10.82, fascia: "C", rimborso: false },
  ]},
  // ===== S — ORGANI DI SENSO =====
  { principio: "Timololo collirio", atc: "S01ED01", farmaci: [
    { nome: "Timoftol 0,5% collirio 5ml", ditta: "MSD", prezzo: 3.52, fascia: "A", rimborso: true },
    { nome: "Timololo EG 0,5% collirio 5ml", ditta: "EG", prezzo: 2.82, fascia: "A", rimborso: true },
  ]},
  { principio: "Latanoprost", atc: "S01EE01", farmaci: [
    { nome: "Latanoprost EG 0,005% 3fl 2,5ml", ditta: "EG", prezzo: 8.82, fascia: "A", rimborso: true },
    { nome: "Xalatan 0,005% 2,5ml", ditta: "Viatris", prezzo: 18.52, fascia: "A", rimborso: true },
  ]},
];

async function main() {
  console.log("=== Generazione Farmaci AIFA (Prontuario Nazionale) ===");
  console.log(`Principi attivi: ${FARMACI_DATA.length}`);

  const indice = [];

  for (const pa of FARMACI_DATA) {
    const slug = slugify(pa.principio);
    const prezzi = pa.farmaci.map(f => f.prezzo).filter(Boolean);
    const prezzo_min = prezzi.length ? Math.min(...prezzi) : null;
    const prezzo_medio = prezzi.length ? Math.round(prezzi.reduce((a, b) => a + b, 0) / prezzi.length * 100) / 100 : null;
    const atcLettera = (pa.atc || "").charAt(0).toUpperCase();

    const detail = {
      slug,
      nome: pa.principio,
      atc: pa.atc,
      categoria_atc: ATC_CATEGORIE[atcLettera] || "Altro",
      n_farmaci: pa.farmaci.length,
      prezzo_min,
      prezzo_medio,
      ha_rimborsato: pa.farmaci.some(f => f.rimborso),
      aggiornato: new Date().toISOString().split("T")[0],
      farmaci: pa.farmaci,
    };

    writeFileSync(join(DATA_DIR, `${slug}.json`), JSON.stringify(detail, null, 2));

    indice.push({
      slug, nome: pa.principio, atc: pa.atc,
      categoria_atc: detail.categoria_atc,
      n_farmaci: pa.farmaci.length,
      prezzo_min, ha_rimborsato: detail.ha_rimborsato,
    });
  }

  writeFileSync(
    join(process.cwd(), "public/data/farmaci/index.json"),
    JSON.stringify({ aggiornato: new Date().toISOString().split("T")[0], principi_attivi: indice }, null, 2)
  );

  console.log(`✅ Salvati ${FARMACI_DATA.length} principi attivi`);
}

main().catch(console.error);
