"use client";

import { useState, useMemo } from "react";
import { Filters } from "@/components/filters";
import { BoxplotChart } from "@/components/boxplot";
import { PromoAnalytics } from "@/components/promo-analytics";
import { FilterState } from "@/lib/types";
import {
  parseData,
  getAvailableFilterOptions,
  generateBoxplotComparisons,
  generatePromoAnalysis,
  generatePromoAnalysisByCompetitor,
} from "@/lib/data";

/**
 * Main dashboard page
 * Displays pricing comparison boxplots with dynamic filtering
 */
export default function Dashboard() {
  // Load and parse data once
  const data = useMemo(() => parseData(), []);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    pais: null,
    competidor: null,
    segmento: null,
    tamanoKit: null,
  });

  // Tab state
  const [activeTab, setActiveTab] = useState<"precios" | "promociones">("precios");

  // Get available filter options based on current selections
  const availableOptions = useMemo(
    () => getAvailableFilterOptions(data, filters),
    [data, filters]
  );

  // Generate boxplot data for PRECIO RECURRENTE comparison
  const recurrenteComparisons = useMemo(
    () => generateBoxplotComparisons(data, filters, "recurrente"),
    [data, filters]
  );

  // Generate boxplot data for PRECIO ALTA comparison
  const altaComparisons = useMemo(
    () => generateBoxplotComparisons(data, filters, "alta"),
    [data, filters]
  );

  // Generate promo analysis
  const promoAnalysis = useMemo(
    () => generatePromoAnalysis(data, filters),
    [data, filters]
  );

  // Generate promo analysis by competitor
  const promoByCompetitor = useMemo(
    () => generatePromoAnalysisByCompetitor(data, filters),
    [data, filters]
  );

  // Calculate summary stats
  const totalRecords = useMemo(() => {
    let count = data.length;
    if (filters.pais) count = data.filter((d) => d.pais === filters.pais).length;
    if (filters.competidor)
      count = data.filter(
        (d) =>
          (!filters.pais || d.pais === filters.pais) &&
          d.competidor === filters.competidor
      ).length;
    if (filters.segmento)
      count = data.filter(
        (d) =>
          (!filters.pais || d.pais === filters.pais) &&
          (!filters.competidor || d.competidor === filters.competidor) &&
          d.segmento === filters.segmento
      ).length;
    return count;
  }, [data, filters]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800">
            Competitive Pricing Dashboard
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Análisis comparativo de precios de la competencia (EUR)
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <Filters
          filters={filters}
          onFiltersChange={setFilters}
          availableOptions={availableOptions}
        />

        {/* Summary Stats & Tabs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
              <span className="text-slate-500 text-sm">Mostrando </span>
              <span className="font-bold text-indigo-600 text-lg">{totalRecords}</span>
              <span className="text-slate-500 text-sm"> registros</span>
            </div>
            {filters.pais && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs font-semibold shadow-sm">
                {filters.pais}
              </span>
            )}
            {filters.competidor && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-xs font-semibold shadow-sm">
                {filters.competidor}
              </span>
            )}
            {filters.segmento && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs font-semibold shadow-sm">
                {filters.segmento}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("precios")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "precios"
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              Comparación de Precios
            </button>
            <button
              onClick={() => setActiveTab("promociones")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "promociones"
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              Análisis de Promociones
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "precios" ? (
          <div className="space-y-8">
            {/* PRECIO RECURRENTE Comparison */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-slate-800">
                  Precio Recurrente
                </h2>
                <span className="text-slate-400 text-sm">BASE vs PROMOCIONAL</span>
              </div>
              <BoxplotChart
                title=""
                comparisons={recurrenteComparisons}
                baseLabel="BASE"
                promoLabel="PROMO"
              />
            </section>

            {/* PRECIO ALTA Comparison */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-slate-800">
                  Precio de Alta
                </h2>
                <span className="text-slate-400 text-sm">BASE vs PROMOCIONAL</span>
              </div>
              <BoxplotChart
                title=""
                comparisons={altaComparisons}
                baseLabel="BASE"
                promoLabel="PROMO"
              />
            </section>
          </div>
        ) : (
          <PromoAnalytics
            overallAnalysis={promoAnalysis}
            byCompetitor={promoByCompetitor}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 px-6 py-4 mt-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-400">
          Competitive Pricing Analysis Dashboard
        </div>
      </footer>
    </div>
  );
}
