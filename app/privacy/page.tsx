import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Informativa sulla privacy di CarburantiOggi.it",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <div className="prose max-w-3xl">
      <h1>Privacy Policy</h1>
      <p>Ultimo aggiornamento: maggio 2026</p>
      <p>
        CarburantiOggi.it, gestito da PlasmaCompany (info@plasmacompany.net), rispetta la tua privacy
        e si impegna a proteggere i dati personali degli utenti in conformità al Regolamento (UE) 2016/679 (GDPR).
      </p>
      <h2>Dati raccolti</h2>
      <p>
        Questo sito non raccoglie dati personali degli utenti in modo diretto. I dati di navigazione (indirizzo IP,
        browser, pagine visitate) possono essere raccolti automaticamente dai sistemi di hosting (Vercel) per finalità
        tecniche e di sicurezza.
      </p>
      <h2>Cookie</h2>
      <p>
        Il sito utilizza esclusivamente cookie tecnici necessari al funzionamento. Non utilizza cookie di profilazione
        di terze parti. Per maggiori informazioni consulta la <a href="/cookie">Cookie Policy</a>.
      </p>
      <h2>Pubblicità</h2>
      <p>
        Il sito può utilizzare Google AdSense per mostrare annunci pubblicitari. Google può utilizzare cookie per
        personalizzare gli annunci. Per disattivare la personalizzazione visita{" "}
        <a href="https://www.google.it/settings/ads" target="_blank" rel="noopener noreferrer">google.it/settings/ads</a>.
      </p>
      <h2>Dati sui prezzi</h2>
      <p>
        I prezzi carburanti provengono dall&apos;API pubblica del Ministero delle Imprese e del Made in Italy (MIMIT).
        CarburantiOggi.it non è responsabile di eventuali imprecisioni nei dati forniti dalla fonte ufficiale.
      </p>
      <h2>Contatti</h2>
      <p>Per qualsiasi richiesta relativa alla privacy: <a href="mailto:info@plasmacompany.net">info@plasmacompany.net</a></p>
    </div>
  );
}
