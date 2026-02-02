"use client";

import dynamic from "next/dynamic";
import { BoxplotComparison } from "@/lib/types";

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface BoxplotChartProps {
  title: string;
  comparisons: BoxplotComparison[];
  baseLabel?: string;
  promoLabel?: string;
}

/**
 * BoxPlot chart component using Plotly
 * Displays side-by-side comparison of BASE vs PROMOCIONAL prices
 */
export function BoxplotChart({
  title,
  comparisons,
  baseLabel = "BASE",
  promoLabel = "PROMO",
}: BoxplotChartProps) {
  if (comparisons.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-700">{title}</h3>
        <div className="flex items-center justify-center h-64 text-slate-400">
          No hay datos disponibles para los filtros seleccionados
        </div>
      </div>
    );
  }

  // Prepare data for Plotly
  const traces: Plotly.Data[] = [];

  // Vibrant colors for BASE and PROMO
  const baseColor = "rgba(99, 102, 241, 0.7)"; // Indigo
  const baseLine = "rgb(79, 70, 229)"; // Darker indigo
  const promoColor = "rgba(16, 185, 129, 0.7)"; // Emerald
  const promoLine = "rgb(5, 150, 105)"; // Darker emerald

  comparisons.forEach((comp, index) => {
    // BASE boxplot
    traces.push({
      type: "box",
      y: comp.base.values,
      name: baseLabel,
      x: Array(comp.base.values.length).fill(`${comp.label}`),
      boxpoints: false,
      marker: { color: baseLine },
      fillcolor: baseColor,
      line: { color: baseLine, width: 2 },
      offsetgroup: `${index}-base`,
      legendgroup: baseLabel,
      showlegend: index === 0,
    } as Plotly.Data);

    // PROMO boxplot
    traces.push({
      type: "box",
      y: comp.promo.values,
      name: promoLabel,
      x: Array(comp.promo.values.length).fill(`${comp.label}`),
      boxpoints: false,
      marker: { color: promoLine },
      fillcolor: promoColor,
      line: { color: promoLine, width: 2 },
      offsetgroup: `${index}-promo`,
      legendgroup: promoLabel,
      showlegend: index === 0,
    } as Plotly.Data);
  });

  const layout: Partial<Plotly.Layout> = {
    title: {
      text: title,
      font: { size: 18, color: "#334155", family: "system-ui, sans-serif" },
    },
    showlegend: true,
    legend: {
      orientation: "h",
      y: -0.15,
      x: 0.5,
      xanchor: "center",
      font: { size: 12, color: "#64748b" },
      bgcolor: "rgba(255,255,255,0)",
    },
    boxmode: "group",
    boxgap: 0.3,
    boxgroupgap: 0.15,
    margin: { t: 60, b: 80, l: 80, r: 40 },
    yaxis: {
      title: "Precio (EUR)",
      tickformat: ",.0f",
      tickprefix: "€",
      gridcolor: "rgba(148, 163, 184, 0.3)",
      zerolinecolor: "rgba(148, 163, 184, 0.5)",
      titlefont: { size: 12, color: "#64748b" },
      tickfont: { size: 11, color: "#64748b" },
    },
    xaxis: {
      title: "",
      tickfont: { size: 12, color: "#334155" },
      gridcolor: "rgba(148, 163, 184, 0.2)",
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(248, 250, 252, 0.5)",
    hoverlabel: {
      bgcolor: "#1e293b",
      font: { color: "#fff", size: 12 },
      bordercolor: "#334155",
    },
  };

  const config: Partial<Plotly.Config> = {
    responsive: true,
    displayModeBar: false,
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <Plot
        data={traces}
        layout={layout}
        config={config}
        style={{ width: "100%", height: "420px" }}
      />
    </div>
  );
}
