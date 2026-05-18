"use client";

import {
  BarChart,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

interface Categoria {
  nome: string;
  icona: string;
  var_annua: number;
  var_mensile: number;
}

interface StoricoPeriodo {
  periodo: string;
  inflazione: number;
}

interface CarrelloChartProps {
  categorie: Categoria[];
  storico: StoricoPeriodo[];
  inflazioneMedia: number;
}

export default function CarrelloChart({ categorie, storico, inflazioneMedia }: CarrelloChartProps) {
  const catData = [...categorie]
    .sort((a, b) => b.var_annua - a.var_annua)
    .map((c) => ({
      name: c.icona + " " + (c.nome.length > 18 ? c.nome.slice(0, 16) + "…" : c.nome),
      full: c.nome,
      annua: c.var_annua,
      mensile: c.var_mensile,
    }));

  const storicoData = [...storico].map((s) => ({ periodo: s.periodo, inflazione: s.inflazione }));

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-0.5">Variazione annua per categoria</h2>
        <p className="text-xs text-gray-400 mb-4">% rispetto a un anno fa · la linea è la media generale</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={catData} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip
              formatter={(v) => {
                const n = typeof v === "number" ? v : 0;
                return [`${n > 0 ? "+" : ""}${n.toFixed(1)}%`, "Var. annua"];
              }}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.full ?? label}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <ReferenceLine x={inflazioneMedia} stroke="#9ca3af" strokeDasharray="4 3" strokeWidth={1.5} />
            <Bar dataKey="annua" radius={[0, 4, 4, 0]} maxBarSize={18}>
              {catData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.annua > inflazioneMedia * 1.5 ? "#dc2626" : entry.annua > inflazioneMedia ? "#f97316" : "#16a34a"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-0.5">Andamento inflazione</h2>
        <p className="text-xs text-gray-400 mb-4">Indice NIC ISTAT — variazione % annua</p>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={storicoData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="periodo"
              tick={{ fontSize: 9, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v.toFixed(1)}%`}
              domain={["auto", "auto"]}
            />
            <Tooltip
              formatter={(v) => { const n = typeof v === "number" ? v : 0; return [`+${n.toFixed(1)}%`, "Inflazione NIC"]; }}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Bar dataKey="inflazione" fill="#fde68a" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Line
              type="monotone"
              dataKey="inflazione"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
