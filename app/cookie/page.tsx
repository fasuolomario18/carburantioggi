import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookie Policy di PrezziOggi.com",
  robots: { index: false },
};

export default function CookiePage() {
  return (
    <div className="prose max-w-3xl">
      <h1>Cookie Policy</h1>
      <p>Ultimo aggiornamento: maggio 2026</p>
      <h2>Cookie tecnici</h2>
      <p>
        PrezziOggi.com utilizza esclusivamente cookie tecnici strettamente necessari al funzionamento del sito.
        Questi cookie non richiedono consenso ai sensi della normativa vigente.
      </p>
      <h2>Cookie di terze parti (Google AdSense)</h2>
      <p>
        Il sito può mostrare annunci tramite Google AdSense. Google utilizza cookie per la misurazione e la
        personalizzazione degli annunci. Puoi gestire le preferenze pubblicitarie su{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>.
      </p>
      <h2>Come disabilitare i cookie</h2>
      <p>
        Puoi disabilitare i cookie nelle impostazioni del tuo browser. La disabilitazione non pregiudica la
        fruizione dei contenuti del sito.
      </p>
      <p>Per info: <a href="mailto:info@plasmacompany.net">info@plasmacompany.net</a></p>
    </div>
  );
}
