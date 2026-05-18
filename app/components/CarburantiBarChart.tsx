"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CarburantiBarChartProps {
  prezzi: {
    label: string;
    self_media: number | null;
    servito_media: number | null;
  }[];
}

const COLORS: Record<string, string> = {
  Benzina: "#16a34a",
  Gasolio: "#2563eb",
  GPL: "#f59e0b",
  Metano: "#8b5cf6",
};

export default function CarburantiBarChart({ prezzi }: CarburantiBarChartProps) {
  const data = prezzi
    .filter((p) => p.self_media !== null)
    .map((p) => ({
      name: p.label,
      Self: p.self_media,
      Servito: p.servito_media,
    }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-10">
      <h2 className="font-semibold text-gray-800 mb-1">Confronto prezzi nazionali</h2>
      <p className="text-xs text-gray-400 mb-4">Medie nazionali self vs servito · €/litro · Fonte MIMIT</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v.toFixed(2)}`}
            domain={[0.5, "auto"]}
          />
          <Tooltip
            formatter={(v, name) => typeof v === "number" ? [`${v.toFixed(3)} €/l`, name] : [String(v), name]}
            labelStyle={{ fontSize: 12, fontWeight: 600, color: "#111827" }}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
          <Bar dataKey="Self" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "#16a34a"} />
            ))}
          </Bar>
          <Bar dataKey="Servito" radius={[4, 4, 0, 0]} fill="#d1d5db" maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
