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

interface Provincia {
  nome: string;
  sigla: string;
  premio: number;
  vs_media: number;
}

interface RcAutoChartProps {
  piuCare: Provincia[];
  piuEco: Provincia[];
  mediaNazionale: number;
}

export default function RcAutoChart({ piuCare, piuEco, mediaNazionale }: RcAutoChartProps) {
  const dataCare = [...piuCare].reverse().map((p) => ({ name: p.sigla, premio: p.premio, full: p.nome }));
  const dataEco = [...piuEco].map((p) => ({ name: p.sigla, premio: p.premio, full: p.nome }));

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-0.5">Province più care</h2>
        <p className="text-xs text-gray-400 mb-4">Premio medio annuo RC Auto · €</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dataCare} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `€${v}`}
              domain={[0, "auto"]}
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
              formatter={(v) => [`€${v}`, "Premio"]}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.full ?? label}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Bar dataKey="premio" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {dataCare.map((entry) => (
                <Cell key={entry.name} fill={entry.premio > mediaNazionale * 1.2 ? "#dc2626" : "#f97316"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-0.5">Province più economiche</h2>
        <p className="text-xs text-gray-400 mb-4">Premio medio annuo RC Auto · €</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dataEco} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `€${v}`}
              domain={[0, "auto"]}
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
              formatter={(v) => [`€${v}`, "Premio"]}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.full ?? label}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Bar dataKey="premio" radius={[0, 4, 4, 0]} maxBarSize={22}>
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
