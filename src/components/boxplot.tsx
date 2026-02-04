"use client";

import dynamic from "next/dynamic";
import { BoxplotComparison, CurrencyMode } from "@/lib/types";
import { getCompetitorConfig } from "@/lib/constants";

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface BoxplotChartProps {
  title: string;
  comparisons: BoxplotComparison[];
  baseLabel?: string;
  promoLabel?: string;
  currency?: CurrencyMode;
}

/**
 * Competitor legend with logos
 */
function CompetitorLegend({ competitors }: { competitors: string[] }) {
  if (competitors.length === 0 || (competitors.length === 1 && competitors[0] === "Todos")) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
      {competitors.map((name) => {
        const config = getCompetitorConfig(name);
        return (
          <div key={name} className="flex items-center gap-2">
            <img
              src={config.logo}
              alt={`${name} logo`}
              className="w-6 h-6 object-contain"
            />
            <span className="text-sm font-medium text-slate-700">{name}</span>
            <div className="flex items-center gap-1 ml-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: config.color }}
                title="BASE"
              />
              <div
                className="w-3 h-3 rounded border-2 border-dashed"
                style={{ borderColor: config.color, backgroundColor: 'transparent' }}
                title="PROMO"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * BoxPlot chart component using Plotly
 * Displays side-by-side comparison of BASE vs PROMOCIONAL prices
 * Colors are based on competitor brand colors
 */
export function BoxplotChart({
  title,
  comparisons,
  baseLabel = "BASE",
  promoLabel = "PROMO",
  currency = "EUR",
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

  // Get list of competitors for legend
  const competitors = comparisons.map((c) => c.label);

  // Calculate Y-axis range focused on boxplot whiskers (IQR-based)
  // Outliers will be shown but won't dominate the scale
  const calculateAxisRange = (): [number, number] => {
    let minWhisker = Infinity;
    let maxWhisker = -Infinity;

    comparisons.forEach((comp) => {
      [comp.base, comp.promo].forEach((stats) => {
        if (stats.values.length === 0) return;

        const iqr = stats.q3 - stats.q1;
        // Standard boxplot whiskers: Q1 - 1.5*IQR and Q3 + 1.5*IQR
        const lowerBound = stats.q1 - 1.5 * iqr;
        const upperBound = stats.q3 + 1.5 * iqr;

        // Whisker ends at the furthest data point within bounds
        const lowerWhisker = Math.max(stats.min, lowerBound);
        const upperWhisker = Math.min(stats.max, upperBound);

        minWhisker = Math.min(minWhisker, lowerWhisker);
        maxWhisker = Math.max(maxWhisker, upperWhisker);
      });
    });

    if (minWhisker === Infinity) return [0, 100];

    // Add 20% padding to whisker range for outlier dots
    const whiskerRange = maxWhisker - minWhisker;
    const padding = whiskerRange * 0.2;

    return [
      Math.max(0, minWhisker - padding),
      maxWhisker + padding
    ];
  };

  const yAxisRange = calculateAxisRange();

  // Prepare data for Plotly
  const traces: Plotly.Data[] = [];

  comparisons.forEach((comp, index) => {
    // Get competitor colors
    const config = getCompetitorConfig(comp.label);
    const baseColor = config.colorLight;
    const baseLine = config.color;
    // Promo uses a lighter/desaturated version
    const promoColor = config.colorLight.replace("0.6", "0.3");
    const promoLine = config.color;

    // BASE boxplot
    traces.push({
      type: "box",
      y: comp.base.values,
      name: `${comp.label} - ${baseLabel}`,
      x: Array(comp.base.values.length).fill(`${comp.label}`),
      boxpoints: "outliers",  // Show outliers as dots outside whiskers
      marker: {
        color: baseLine,
        outliercolor: baseLine,
        size: 6,
      },
      fillcolor: baseColor,
      line: { color: baseLine, width: 2 },
      offsetgroup: `${index}-base`,
      legendgroup: comp.label,
      showlegend: index === 0,
    } as Plotly.Data);

    // PROMO boxplot
    traces.push({
      type: "box",
      y: comp.promo.values,
      name: `${comp.label} - ${promoLabel}`,
      x: Array(comp.promo.values.length).fill(`${comp.label}`),
      boxpoints: "outliers",  // Show outliers as dots outside whiskers
      marker: {
        color: promoLine,
        outliercolor: promoLine,
        size: 6,
      },
      fillcolor: promoColor,
      line: { color: promoLine, width: 2, dash: "dot" },
      offsetgroup: `${index}-promo`,
      legendgroup: comp.label,
      showlegend: false,
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
      title: currency === "EUR" ? "Precio (EUR)" : "Precio (Moneda Local)",
      tickformat: ",.0f",
      tickprefix: currency === "EUR" ? "€" : "",
      gridcolor: "rgba(148, 163, 184, 0.3)",
      zerolinecolor: "rgba(148, 163, 184, 0.5)",
      titlefont: { size: 12, color: "#64748b" },
      tickfont: { size: 11, color: "#64748b" },
      range: yAxisRange,  // Smart range that focuses on main data, not outliers
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
      <CompetitorLegend competitors={competitors} />
      <Plot
        data={traces}
        layout={layout}
        config={config}
        style={{ width: "100%", height: "420px" }}
      />
    </div>
  );
}
