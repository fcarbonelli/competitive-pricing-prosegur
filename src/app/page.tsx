"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Filters } from "@/components/filters";
import { BoxplotChart } from "@/components/boxplot";
import { PromoAnalytics } from "@/components/promo-analytics";
import { PriceTable } from "@/components/price-table";
import { FilterState, CurrencyMode } from "@/lib/types";
import {
  parseData,
  getAvailableFilterOptions,
  generateBoxplotComparisons,
  generatePromoAnalysis,
  generatePromoAnalysisByCompetitor,
  filterData,
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
  const [activeTab, setActiveTab] = useState<"precios" | "promociones" | "metodologia">("precios");

  // Currency state
  const [currency, setCurrency] = useState<CurrencyMode>("EUR");

  // Get available filter options based on current selections
  const availableOptions = useMemo(
    () => getAvailableFilterOptions(data, filters),
    [data, filters]
  );

  // Generate boxplot data for PRECIO RECURRENTE comparison
  const recurrenteComparisons = useMemo(
    () => generateBoxplotComparisons(data, filters, "recurrente", currency),
    [data, filters, currency]
  );

  // Generate boxplot data for PRECIO ALTA comparison
  const altaComparisons = useMemo(
    () => generateBoxplotComparisons(data, filters, "alta", currency),
    [data, filters, currency]
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

  // Get filtered data for tables
  const filteredData = useMemo(
    () => filterData(data, filters),
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
          <div className="flex items-center justify-between">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Competitive Pricing Dashboard
              </h1>
              <p className="text-slate-500 mt-1 text-sm">
                Análisis comparativo de precios de la competencia
              </p>
            </div>
            {/* Mega Logo */}
            <Image
              src="/logos/mega-logo.png"
              alt="Mega Logo"
              width={200}
              height={64}
              className="h-16 w-auto object-contain"
            />
          </div>
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

        {/* Summary Stats & Controls */}
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

          {/* Currency Toggle */}
          <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
            <span className="text-xs text-slate-500 px-2">Moneda:</span>
            <button
              onClick={() => setCurrency("EUR")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${currency === "EUR"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              EUR €
            </button>
            <button
              onClick={() => setCurrency("LOCAL")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${currency === "LOCAL"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              Local
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm w-fit">
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
          <button
            onClick={() => setActiveTab("metodologia")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "metodologia"
              ? "bg-indigo-500 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            Metodología
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "precios" && (
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
                currency={currency}
              />
              {/* Price Table for Recurrente */}
              <div className="mt-4">
                <PriceTable
                  data={filteredData}
                  title="Precio Promedio Recurrente por Tipo de Kit"
                  priceType="recurrente"
                  currency={currency}
                  comparisons={recurrenteComparisons}
                />
              </div>
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
                currency={currency}
              />
              {/* Price Table for Alta */}
              <div className="mt-4">
                <PriceTable
                  data={filteredData}
                  title="Precio Promedio de Alta por Tipo de Kit"
                  priceType="alta"
                  currency={currency}
                  comparisons={altaComparisons}
                />
              </div>
            </section>
          </div>
        )}

        {activeTab === "promociones" && (
          <PromoAnalytics
            overallAnalysis={promoAnalysis}
            byCompetitor={promoByCompetitor}
          />
        )}

        {activeTab === "metodologia" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Metodología</h2>

            <div className="space-y-8 text-slate-700">
              {/* Encuesta Cuantitativa */}
              <section>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Encuesta cuantitativa:</h3>
                <div className="bg-slate-50 rounded-lg p-5">
                  <h4 className="font-semibold text-slate-700 mb-3">TARGET</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-1">•</span>
                      <span>Usuarios de marca seleccionada, dado de alta en los últimos 12 meses.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-1">•</span>
                      <span>Decisores de la contratación, en su hogar o trabajo.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-1">•</span>
                      <span>Que compartan su última factura.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-1">•</span>
                      <span>Residentes de CABA o Gran Buenos Aires.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Mystery Shopper */}
              <section>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Mystery Shopper:</h3>
                <div className="bg-slate-50 rounded-lg p-5">
                  <p className="text-sm">
                    Con perfiles diferenciados por tamaño de su propiedad (negocio u hogar) y actitud de negociación (hard & soft).
                  </p>
                </div>
              </section>

              {/* Glosario */}
              <section>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Glosario de conceptos</h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <span className="font-semibold text-slate-800">Precio recurrente:</span>
                    <span className="text-slate-600 ml-2">el precio de abono mensual de los usuarios.</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <span className="font-semibold text-slate-800">Precio de alta:</span>
                    <span className="text-slate-600 ml-2">el precio que pagaron por la instalación del equipo.</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <span className="font-semibold text-slate-800">Precio base:</span>
                    <span className="text-slate-600 ml-2">El precio que pagan descontando impuestos y sin considerar promociones.</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <span className="font-semibold text-slate-800">Precio promocional:</span>
                    <span className="text-slate-600 ml-2">El precio pagado considerando las promociones aplicadas y sin impuestos.</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <span className="font-semibold text-slate-800">Precio efectivo:</span>
                    <span className="text-slate-600 ml-2">El precio finalmente abonado por el usuario, considerando las promociones aplicadas (si las hay) y los impuestos.</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <span className="font-semibold text-slate-800">Kit estándar:</span>
                    <span className="text-slate-600 ml-2">tiene 4 o menos elementos de detección y no tiene cámara.</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <span className="font-semibold text-slate-800">Kit avanzado:</span>
                    <span className="text-slate-600 ml-2">Tiene 5 o más elementos de detección e incluye cámara.</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
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
