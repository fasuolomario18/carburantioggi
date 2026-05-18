import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi siamo — PrezziOggi.com",
  description:
    "Scopri chi c'è dietro PrezziOggi.com: il portale italiano dei dati ufficiali su carburanti, case, farmaci, bollette e qualità dell'aria.",
};

export default function ChiSiamoPage() {
  return (
    <div className="prose max-w-3xl">
      <h1>Chi siamo</h1>
      <p>
        <strong>PrezziOggi.com</strong> è un portale indipendente che raccoglie e pubblica
        dati ufficiali italiani in modo chiaro e aggiornato, senza scopo di lucro editoriale.
      </p>
      <p>
        Il progetto è sviluppato e mantenuto da <strong>PlasmaCompany</strong>, una realtà
        italiana che crede nella trasparenza e nell&apos;accessibilità delle informazioni pubbliche.
      </p>

      <h2>La nostra missione</h2>
      <p>
        Rendere i dati delle istituzioni italiane — Ministeri, ARERA, AIFA, OMI e altri enti
        pubblici — facilmente consultabili da chiunque, senza registrazioni e senza abbonamenti.
      </p>

      <h2>Fonti dei dati</h2>
      <ul>
        <li><strong>Carburanti:</strong> MIMIT (Ministero delle Imprese e del Made in Italy)</li>
        <li><strong>Prezzi delle case:</strong> OMI (Osservatorio del Mercato Immobiliare — Agenzia delle Entrate)</li>
        <li><strong>Bollette luce e gas:</strong> ARERA (Autorità di Regolazione per Energia Reti e Ambiente)</li>
        <li><strong>Farmaci:</strong> AIFA (Agenzia Italiana del Farmaco)</li>
        <li><strong>Qualità dell&apos;aria:</strong> Open-Meteo / CAMS (Copernicus Atmosphere Monitoring Service)</li>
      </ul>
      <p>
        I dati vengono aggiornati automaticamente ogni giorno tramite procedure robotizzate.
        Non vengono modificati o interpretati editorialmente.
      </p>

      <h2>Contatti</h2>
      <p>
        Per domande o segnalazioni scrivi a{" "}
        <a href="mailto:info@plasmacompany.net">info@plasmacompany.net</a> oppure
        visita la pagina <a href="/contatti">Contatti</a>.
      </p>
    </div>
  );
}
