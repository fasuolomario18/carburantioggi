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
} from "recharts";

interface FarmaciChartProps {
  perCategoria: { nome: string; count: number }[];
}

const PALETTE = [
  "#16a34a", "#2563eb", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#ef4444", "#84cc16",
  "#f97316", "#14b8a6", "#a855f7", "#64748b",
];

const LABEL_MAP: Record<string, string> = {
  "Apparato gastrointestinale e metabolismo": "GI/Metabolismo",
  "Sangue e organi emopoietici": "Sangue",
  "Sistema cardiovascolare": "Cardiologici",
  "Dermatologici": "Dermatologici",
  "Sistema genito-urinario e ormoni sessuali": "Genito-urinario",
  "Preparati ormonali sistemici": "Ormonali",
  "Antimicrobici per uso sistemico": "Antimicrobici",
  "Farmaci antineoplastici e immunomodulatori": "Oncologici",
  "Sistema muscolo-scheletrico": "Muscolo-scheletrico",
  "Sistema nervoso": "Sistema nervoso",
  "Farmaci antiparassitari": "Antiparassitari",
  "Sistema respiratorio": "Respiratorio",
  "Organi di senso": "Organi di senso",
  "Vari": "Vari",
};

export default function FarmaciChart({ perCategoria }: FarmaciChartProps) {
  const data = [...perCategoria]
    .sort((a, b) => b.count - a.count)
    .map((c) => ({ name: LABEL_MAP[c.nome] ?? c.nome, count: c.count, full: c.nome }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
      <h2 className="font-semibold text-gray-800 mb-0.5">Principi attivi per categoria</h2>
      <p className="text-xs text-gray-400 mb-4">Numero di principi attivi disponibili · Fonte AIFA</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip
            formatter={(v) => [v, "Principi attivi"]}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.full ?? label}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
