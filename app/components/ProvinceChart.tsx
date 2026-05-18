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

interface ProvinciaPrezzo {
  nome: string;
  sigla: string;
  regione: string;
  benzina: number;
}

interface ProvinceChartProps {
  top10: ProvinciaPrezzo[];
  bottom10: ProvinciaPrezzo[];
  mediaNazionale: number;
}

export default function ProvinceChart({ top10, bottom10, mediaNazionale }: ProvinceChartProps) {
  const dataCare = [...top10].reverse().map((p) => ({
    name: p.sigla,
    full: p.nome,
    regione: p.regione,
    prezzo: p.benzina,
  }));

  const dataEco = [...bottom10].map((p) => ({
    name: p.sigla,
    full: p.nome,
    regione: p.regione,
    prezzo: p.benzina,
  }));

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-0.5">Province più care — Benzina</h2>
        <p className="text-xs text-gray-400 mb-4">Prezzo medio self €/litro · la linea è la media nazionale</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dataCare} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `€${v.toFixed(3)}`}
              domain={["auto", "auto"]}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip
              formatter={(v) => { const n = typeof v === "number" ? v : 0; return [`€${n.toFixed(3)}/l`, "Benzina self"]; }}
              labelFormatter={(label, payload) => {
                const p = payload?.[0]?.payload;
                return p ? `${p.full} (${p.regione})` : label;
              }}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <ReferenceLine x={mediaNazionale} stroke="#9ca3af" strokeDasharray="4 3" strokeWidth={1.5} />
            <Bar dataKey="prezzo" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {dataCare.map((entry) => (
                <Cell key={entry.name} fill={entry.prezzo > mediaNazionale * 1.01 ? "#dc2626" : "#f97316"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-0.5">Province più economiche — Benzina</h2>
        <p className="text-xs text-gray-400 mb-4">Prezzo medio self €/litro · la linea è la media nazionale</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dataEco} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `€${v.toFixed(3)}`}
              domain={["auto", "auto"]}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip
              formatter={(v) => { const n = typeof v === "number" ? v : 0; return [`€${n.toFixed(3)}/l`, "Benzina self"]; }}
              labelFormatter={(label, payload) => {
                const p = payload?.[0]?.payload;
                return p ? `${p.full} (${p.regione})` : label;
              }}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <ReferenceLine x={mediaNazionale} stroke="#9ca3af" strokeDasharray="4 3" strokeWidth={1.5} />
            <Bar dataKey="prezzo" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {dataEco.map((entry) => (
                <Cell key={entry.name} fill="#16a34a" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
