"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const NAVY = "#1d3f84";
const BLUE = "#2f6bdb";
const GOLD = "#c99a3c";
const SLATE = "#94a3b8";

export const CHART_COLORS = [NAVY, BLUE, GOLD, "#0d9488", "#7c3aed", SLATE];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgb(15 38 83 / 0.12)",
  fontSize: 13,
  fontWeight: 500,
};

export function SimpleBar({
  data,
  xKey,
  bars,
  height = 220,
  horizontal = false,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  bars: { key: string; color?: string; name?: string }[];
  height?: number;
  horizontal?: boolean;
}) {
  return (
    <div className="h-[200px] w-full min-w-0 sm:h-[240px] md:h-[260px]" style={height !== 220 ? { height } : undefined}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 4, right: 8, left: horizontal ? 8 : -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={!horizontal} vertical={horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey={xKey} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={88} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={36} />
          </>
        )}
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(29,63,132,0.05)" }} />
        {bars.map((b, i) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            name={b.name ?? b.key}
            fill={b.color ?? CHART_COLORS[i]}
            radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
            maxBarSize={36}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}

export function SimpleLine({
  data,
  xKey,
  lines,
  height = 220,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  lines: { key: string; color?: string; name?: string }[];
  height?: number;
}) {
  return (
    <div className="h-[200px] w-full min-w-0 sm:h-[240px] md:h-[260px]" style={height !== 220 ? { height } : undefined}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={36} />
        <Tooltip contentStyle={tooltipStyle} />
        {lines.map((l, i) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name ?? l.key}
            stroke={l.color ?? CHART_COLORS[i]}
            strokeWidth={2.5}
            dot={{ r: 3.5, strokeWidth: 2, fill: "#fff" }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
}

export function Donut({
  data,
  height = 240,
  centerLabel,
  centerValue,
}: {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={d.color ?? CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      {centerValue && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-extrabold text-navy-900">{centerValue}</span>
          {centerLabel && <span className="text-xs font-medium text-slate-500">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}
