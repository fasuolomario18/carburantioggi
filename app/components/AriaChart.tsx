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

interface CittaAqi {
  nome: string;
  sigla: string;
  aqi: number;
  aqi_categoria: string;
}

interface AriaChartProps {
  citta: CittaAqi[];
}

const AQI_COLOR: Record<string, string> = {
  "Buono": "#16a34a",
  "Discreto": "#eab308",
  "Moderato": "#f97316",
  "Scarso": "#dc2626",
  "Molto Scarso": "#7c3aed",
  "Pericoloso": "#450a0a",
};

export default function AriaChart({ citta }: AriaChartProps) {
  const distribuzione = ["Buono", "Discreto", "Moderato", "Scarso", "Molto Scarso", "Pericoloso"].map((cat) => ({
    name: cat,
    count: citta.filter((c) => c.aqi_categoria === cat).length,
  })).filter((d) => d.count > 0);

  const top20 = [...citta].sort((a, b) => b.aqi - a.aqi).slice(0, 20).map((c) => ({
    name: c.sigla,
    full: c.nome,
    aqi: c.aqi,
    categoria: c.aqi_categoria,
  }));

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-0.5">Distribuzione qualità dell&apos;aria</h2>
        <p className="text-xs text-gray-400 mb-4">Numero di città per categoria AQI oggi</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={distribuzione} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
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
              allowDecimals={false}
            />
            <Tooltip
              formatter={(v) => [v, "Città"]}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {distribuzione.map((entry) => (
                <Cell key={entry.name} fill={AQI_COLOR[entry.name] ?? "#6b7280"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-0.5">Città con aria peggiore</h2>
        <p className="text-xs text-gray-400 mb-4">Top 20 per valore AQI più alto oggi</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={top20} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              domain={[0, "auto"]}
            />
            <Tooltip
              formatter={(v) => [v, "AQI"]}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.full ?? label}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Bar dataKey="aqi" radius={[4, 4, 0, 0]} maxBarSize={22}>
              {top20.map((entry) => (
                <Cell key={entry.name} fill={AQI_COLOR[entry.categoria] ?? "#6b7280"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
