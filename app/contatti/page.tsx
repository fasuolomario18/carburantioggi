import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contatti",
  description: "Contatta CarburantiOggi.it — gestito da PlasmaCompany",
};

export default function ContattiPage() {
  return (
    <div className="prose max-w-3xl">
      <h1>Contatti</h1>
      <p>
        <strong>CarburantiOggi.it</strong> è un progetto di <strong>PlasmaCompany</strong>.
      </p>
      <p>
        Per segnalazioni, collaborazioni o informazioni:<br />
        Email: <a href="mailto:info@plasmacompany.net">info@plasmacompany.net</a>
      </p>
      <h2>Segnala un errore</h2>
      <p>
        I dati sui prezzi provengono dall&apos;API ufficiale del MIMIT. Se noti un&apos;imprecisione,
        ti invitiamo a segnalarla via email specificando la provincia e il tipo di carburante.
      </p>
      <h2>Disclaimer</h2>
      <p>
        I prezzi mostrati sono medie calcolate sulle comunicazioni degli esercenti al Ministero.
        CarburantiOggi.it non garantisce l&apos;esattezza dei prezzi al momento del rifornimento.
        Verifica sempre il prezzo esposto presso il distributore.
      </p>
    </div>
  );
}
