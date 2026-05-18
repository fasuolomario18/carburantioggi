"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StoricoPeriodo {
  periodo: string;
  fisso_20y: number;
  variabile: number;
}

interface MutuiChartProps {
  storico: StoricoPeriodo[];
}

export default function MutuiChart({ storico }: MutuiChartProps) {
  const data = [...storico];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
      <h2 className="font-semibold text-gray-800 mb-0.5">Andamento tassi mutuo</h2>
      <p className="text-xs text-gray-400 mb-4">Fisso 20 anni vs Variabile · % · Fonte Banca d&apos;Italia</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="periodo"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v.toFixed(1)}%`}
            domain={["auto", "auto"]}
          />
          <Tooltip
            formatter={(v, name) => { const n = typeof v === "number" ? v : 0; return [`${n.toFixed(2)}%`, name]; }}
            labelStyle={{ fontSize: 11, color: "#374151" }}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
          <Line
            type="monotone"
            dataKey="fisso_20y"
            name="Fisso 20y"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ r: 3, fill: "#16a34a" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="variabile"
            name="Variabile"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3, fill: "#2563eb" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
