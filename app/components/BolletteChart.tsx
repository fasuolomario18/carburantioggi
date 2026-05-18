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
  kwh?: number;
  smc?: number;
}

interface BolletteChartProps {
  storicoLuce: StoricoPeriodo[];
  storicoGas: StoricoPeriodo[];
}

export default function BolletteChart({ storicoLuce, storicoGas }: BolletteChartProps) {
  const data = storicoLuce.map((item) => {
    const gas = storicoGas.find((g) => g.periodo === item.periodo);
    return {
      periodo: item.periodo,
      luce: item.kwh ?? null,
      gas: gas?.smc ?? null,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
      <h2 className="font-semibold text-gray-800 mb-1">Andamento prezzi luce e gas</h2>
      <p className="text-xs text-gray-400 mb-4">Valori trimestrali dal 2022 · Fonte ARERA</p>
      <div className="grid md:grid-cols-2 gap-6">

        {/* LUCE */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">⚡ Energia Elettrica (€/kWh)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="periodo"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v.toFixed(2)}`}
                domain={["auto", "auto"]}
              />
              <Tooltip
                formatter={(v) => typeof v === "number" ? [`${v.toFixed(3)} €/kWh`, "Luce"] : [v, "Luce"]}
                labelStyle={{ fontSize: 11, color: "#374151" }}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Line
                type="monotone"
                dataKey="luce"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* GAS */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">🔥 Gas Naturale (€/Smc)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="periodo"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v.toFixed(2)}`}
                domain={["auto", "auto"]}
              />
              <Tooltip
                formatter={(v) => typeof v === "number" ? [`${v.toFixed(3)} €/Smc`, "Gas"] : [String(v), "Gas"]}
                labelStyle={{ fontSize: 11, color: "#374151" }}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Line
                type="monotone"
                dataKey="gas"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
