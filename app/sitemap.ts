import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { MetadataRoute } from "next";

const BASE_URL = "https://www.carburantioggi.it";

function loadJSON<T>(filename: string): T | null {
  const path = join(process.cwd(), "public/data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

interface Indice {
  aggiornato: string;
  regioni: { slug: string }[];
  province: { slug: string }[];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const indice = loadJSON<Indice>("indice.json");
  const farmaciIndex = loadJSON<{ principi_attivi: { slug: string }[] }>("farmaci/index.json");
  const caseIndex = loadJSON<{ comuni: { slug: string }[] }>("case/index.json");
  const oggi = new Date().toISOString();

  const statiche: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: oggi, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/regioni`, lastModified: oggi, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/province`, lastModified: oggi, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/bollette`, lastModified: oggi, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/farmaci`, lastModified: oggi, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/case`, lastModified: oggi, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/contatti`, lastModified: oggi, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: oggi, changeFrequency: "monthly", priority: 0.2 },
  ];

  const regioniUrls: MetadataRoute.Sitemap = (indice?.regioni ?? []).map((r) => ({
    url: `${BASE_URL}/regioni/${r.slug}`,
    lastModified: oggi,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const provinceUrls: MetadataRoute.Sitemap = (indice?.province ?? []).map((p) => ({
    url: `${BASE_URL}/province/${p.slug}`,
    lastModified: oggi,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const farmaciUrls: MetadataRoute.Sitemap = (farmaciIndex?.principi_attivi ?? []).map((f) => ({
    url: `${BASE_URL}/farmaci/${f.slug}`,
    lastModified: oggi,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const caseUrls: MetadataRoute.Sitemap = (caseIndex?.comuni ?? []).map((c) => ({
    url: `${BASE_URL}/case/${c.slug}`,
    lastModified: oggi,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...statiche, ...regioniUrls, ...provinceUrls, ...farmaciUrls, ...caseUrls];
}
