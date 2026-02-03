"use client";

import dynamic from "next/dynamic";
import { PromoAnalysis, PromoAnalysisByCompetitor } from "@/lib/types";
import { getCompetitorConfig, PIE_COLORS } from "@/lib/constants";

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface PromoAnalyticsProps {
  overallAnalysis: PromoAnalysis;
  byCompetitor: PromoAnalysisByCompetitor[];
}

/**
 * Format number as EUR currency
 */
function formatEUR(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage
 */
function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Stat card component
 */
function StatCard({
  title,
  value,
  subtitle,
  color = "indigo",
}: {
  title: string;
  value: string;
  subtitle?: string;
  color?: "indigo" | "emerald" | "amber" | "rose";
}) {
  const colorClasses = {
    indigo: "from-indigo-500 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <p className={`text-2xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

/**
 * Competitor logo/badge component
 */
function CompetitorBadge({ name }: { name: string }) {
  const config = getCompetitorConfig(name);

  return (
    <div className="flex items-center gap-2">
      <img
        src={config.logo}
        alt={`${name} logo`}
        className="w-8 h-8 object-contain"
        onError={(e) => {
          // Fallback to colored circle if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement?.querySelector('.fallback-badge')?.classList.remove('hidden');
        }}
      />
      <div
        className="fallback-badge hidden w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: config.color }}
      >
        {name.charAt(0)}
      </div>
      <span className="font-medium text-slate-700">{name}</span>
    </div>
  );
}

/**
 * Promo Analytics component
 * Shows promo amount averages, percentages, and pie charts
 */
export function PromoAnalytics({ overallAnalysis, byCompetitor }: PromoAnalyticsProps) {
  // Pie chart for overall promo presence
  const overallPieData: Plotly.Data[] = [
    {
      type: "pie",
      values: [overallAnalysis.withPromoCount, overallAnalysis.withoutPromoCount],
      labels: ["Con Promoción", "Sin Promoción"],
      marker: {
        colors: [PIE_COLORS.withPromo, PIE_COLORS.withoutPromo],
      },
      hole: 0.4,
      textinfo: "percent+label",
      textposition: "outside",
    } as Plotly.Data,
  ];

  const pieLayout: Partial<Plotly.Layout> = {
    showlegend: false,
    margin: { t: 30, b: 30, l: 30, r: 30 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
  };

  const pieConfig: Partial<Plotly.Config> = {
    responsive: true,
    displayModeBar: false,
  };

  // Prepare pie charts by competitor
  const competitorPies = byCompetitor.map((item) => {
    const config = getCompetitorConfig(item.competidor);
    return {
      competidor: item.competidor,
      data: [
        {
          type: "pie",
          values: [item.analysis.withPromoCount, item.analysis.withoutPromoCount],
          labels: ["Con Promo", "Sin Promo"],
          marker: {
            colors: [config.color, "#E5E7EB"],
          },
          hole: 0.5,
          textinfo: "percent",
          textposition: "inside",
        } as Plotly.Data,
      ],
      analysis: item.analysis,
    };
  });

  return (
    <div className="space-y-8">
      {/* Overall Stats */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-1 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-slate-800">Análisis de Promociones</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Monto Promedio de Promo"
            value={formatEUR(overallAnalysis.avgPromoAmount)}
            subtitle="Solo registros con promoción"
            color="indigo"
          />
          <StatCard
            title="% Descuento Recurrente"
            value={formatPercent(overallAnalysis.avgRecurringPromoPercent)}
            subtitle="Promedio de descuento"
            color="emerald"
          />
          <StatCard
            title="% Descuento de Alta"
            value={formatPercent(overallAnalysis.avgAltaPromoPercent)}
            subtitle="Promedio de descuento"
            color="amber"
          />
          <StatCard
            title="Registros con Promo"
            value={`${overallAnalysis.withPromoCount} / ${overallAnalysis.totalCount}`}
            subtitle={`${((overallAnalysis.withPromoCount / overallAnalysis.totalCount) * 100).toFixed(0)}% del total`}
            color="rose"
          />
        </div>

        {/* Overall Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-600 mb-2 text-center">
            Presencia de Promociones (General)
          </h3>
          <div className="h-64">
            <Plot
              data={overallPieData}
              layout={pieLayout}
              config={pieConfig}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </section>

      {/* By Competitor */}
      {byCompetitor.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-800">Por Competidor</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitorPies.map((item) => (
              <div
                key={item.competidor}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <CompetitorBadge name={item.competidor} />
                  <span className="text-xs text-slate-400">
                    {item.analysis.totalCount} registros
                  </span>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-500">Monto Promo</p>
                    <p className="font-semibold text-slate-700">
                      {formatEUR(item.analysis.avgPromoAmount)}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-500">% Descuento</p>
                    <p className="font-semibold text-slate-700">
                      {formatPercent(item.analysis.avgRecurringPromoPercent)}
                    </p>
                  </div>
                </div>

                {/* Pie chart */}
                <div className="h-40">
                  <Plot
                    data={item.data}
                    layout={{
                      ...pieLayout,
                      margin: { t: 10, b: 10, l: 10, r: 10 },
                    }}
                    config={pieConfig}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>

                <div className="text-center text-xs text-slate-500 mt-2">
                  {item.analysis.withPromoCount} con promo / {item.analysis.withoutPromoCount} sin promo
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
