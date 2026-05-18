"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

interface CaseChartProps {
  regioniData: { nome: string; mediaResidenziale: number; mediaAffitto: number }[];
}

export default function CaseChart({ regioniData }: CaseChartProps) {
  const sorted = [...regioniData].sort((a, b) => b.mediaResidenziale - a.mediaResidenziale);
  const mediaNazionale = Math.round(sorted.reduce((s, r) => s + r.mediaResidenziale, 0) / sorted.length);

  const SHORT: Record<string, string> = {
    "Valle d'Aosta": "VdA", "Piemonte": "PIE", "Liguria": "LIG", "Lombardia": "LOM",
    "Trentino-Alto Adige": "TAA", "Friuli-Venezia Giulia": "FVG", "Veneto": "VEN",
    "Emilia-Romagna": "EMR", "Toscana": "TOS", "Marche": "MAR", "Umbria": "UMB",
    "Lazio": "LAZ", "Abruzzo": "ABR", "Molise": "MOL", "Campania": "CAM",
    "Puglia": "PUG", "Basilicata": "BAS", "Calabria": "CAL", "Sicilia": "SIC", "Sardegna": "SAR",
  };

  const data = sorted.map((r) => ({
    name: SHORT[r.nome] ?? r.nome.slice(0, 3).toUpperCase(),
    full: r.nome,
    vendita: r.mediaResidenziale,
    affitto: r.mediaAffitto,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
      <h2 className="font-semibold text-gray-800 mb-0.5">Prezzi medi per regione</h2>
      <p className="text-xs text-gray-400 mb-4">€/m² residenziale · la linea tratteggiata è la media nazionale · Fonte OMI</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `€${v}`}
          />
          <Tooltip
            formatter={(v, name) => {
              const n = typeof v === "number" ? v : 0;
              const label = name === "vendita" ? `€${n.toLocaleString("it-IT")}/m²` : `€${n}/m²/mese`;
              return [label, name === "vendita" ? "Vendita" : "Affitto"];
            }}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.full ?? label}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <ReferenceLine y={mediaNazionale} stroke="#9ca3af" strokeDasharray="4 3" strokeWidth={1.5} />
          <Bar dataKey="vendita" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.vendita > mediaNazionale * 1.3 ? "#2563eb" : entry.vendita > mediaNazionale ? "#16a34a" : "#86efac"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
