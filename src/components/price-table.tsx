"use client";

import React from "react";
import { PricingDataRow, CurrencyMode, BoxplotComparison } from "@/lib/types";
import { getCompetitorConfig } from "@/lib/constants";

interface PriceTableProps {
  data: PricingDataRow[];
  title: string;
  priceType: "recurrente" | "alta";
  currency: CurrencyMode;
  comparisons: BoxplotComparison[];  // To know which competitors to show columns for
}

/**
 * Format number as currency (EUR or local)
 */
function formatCurrency(value: number, currency: CurrencyMode): string {
  if (value === 0 || isNaN(value)) return "-";

  if (currency === "EUR") {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } else {
    // Local currency - just format as number
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
}

/**
 * Calculate average for an array of numbers, excluding zeros
 */
function calculateAverage(values: number[]): number {
  const filtered = values.filter((v) => v > 0);
  if (filtered.length === 0) return 0;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

/**
 * Normalize kit size values to standard categories
 */
function normalizeKitSize(kitSize: string | null): string {
  if (!kitSize || kitSize === "-" || kitSize === "") return "Sin especificar";

  const lower = kitSize.toLowerCase().trim();

  // Map variations to standard names
  if (lower.includes("estandar") || lower.includes("estándar") || lower.includes("standard") || lower.includes("basico") || lower.includes("básico")) {
    return "Kit Estándar";
  }
  if (lower.includes("avanzado") || lower.includes("premium") || lower.includes("plus") || lower.includes("pro")) {
    return "Kit Avanzado";
  }

  return kitSize; // Return as-is if no match
}

/**
 * Price table showing averages by kit type, with columns per competitor
 */
export function PriceTable({ data, title, priceType, currency, comparisons }: PriceTableProps) {
  // Get competitors from comparisons (this matches what's shown in the boxplot)
  const competitors = comparisons.map((c) => c.label);
  const isSingleGroup = competitors.length === 1 && competitors[0] === "Todos";

  // Helper to get correct price based on currency mode
  const getPrice = (row: PricingDataRow, field: "recurrenteBase" | "recurrentePromo" | "altaBase" | "altaPromo"): number => {
    if (currency === "EUR") {
      switch (field) {
        case "recurrenteBase": return row.precioRecurrenteBase;
        case "recurrentePromo": return row.precioRecurrentePromocional;
        case "altaBase": return row.precioAltaBase;
        case "altaPromo": return row.precioAltaPromocional;
      }
    } else {
      switch (field) {
        case "recurrenteBase": return row.precioRecurrenteBaseLocal;
        case "recurrentePromo": return row.precioRecurrentePromocionalLocal;
        case "altaBase": return row.precioAltaBaseLocal;
        case "altaPromo": return row.precioAltaPromocionalLocal;
      }
    }
  };

  // Group data by kit type AND competitor
  const kitTypes = ["Kit Estándar", "Kit Avanzado", "Sin especificar"];

  // Build table data: for each kit type, calculate avg per competitor
  const tableData = kitTypes.map((kitType) => {
    const kitRows = data.filter((row) => normalizeKitSize(row.tamanoKit) === kitType);

    const competitorData: Record<string, { avgBase: number; avgPromo: number; count: number }> = {};

    competitors.forEach((comp) => {
      // Filter rows for this competitor (or all if "Todos")
      const compRows = comp === "Todos"
        ? kitRows
        : kitRows.filter((row) => row.competidor === comp);

      const baseValues = priceType === "recurrente"
        ? compRows.map((r) => getPrice(r, "recurrenteBase"))
        : compRows.map((r) => getPrice(r, "altaBase"));

      const promoValues = priceType === "recurrente"
        ? compRows.map((r) => getPrice(r, "recurrentePromo"))
        : compRows.map((r) => getPrice(r, "altaPromo"));

      competitorData[comp] = {
        avgBase: calculateAverage(baseValues),
        avgPromo: calculateAverage(promoValues),
        count: compRows.length,
      };
    });

    return {
      kitType,
      totalCount: kitRows.length,
      competitors: competitorData,
    };
  }).filter((row) => row.totalCount > 0); // Only show kit types that have data

  // Calculate totals per competitor
  const totals: Record<string, { avgBase: number; avgPromo: number; count: number }> = {};
  competitors.forEach((comp) => {
    const compRows = comp === "Todos"
      ? data
      : data.filter((row) => row.competidor === comp);

    const baseValues = priceType === "recurrente"
      ? compRows.map((r) => getPrice(r, "recurrenteBase"))
      : compRows.map((r) => getPrice(r, "altaBase"));

    const promoValues = priceType === "recurrente"
      ? compRows.map((r) => getPrice(r, "recurrentePromo"))
      : compRows.map((r) => getPrice(r, "altaPromo"));

    totals[comp] = {
      avgBase: calculateAverage(baseValues),
      avgPromo: calculateAverage(promoValues),
      count: compRows.length,
    };
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {/* Header row with competitor names */}
            <tr className="bg-slate-50">
              <th className="px-4 py-2 text-left font-semibold text-slate-600 border-b border-slate-200" rowSpan={2}>
                Tipo de Kit
              </th>
              {competitors.map((comp) => {
                const config = getCompetitorConfig(comp);
                return (
                  <th
                    key={comp}
                    colSpan={2}
                    className="px-2 py-2 text-center font-semibold text-slate-700 border-b border-slate-200"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {!isSingleGroup && (
                        <img
                          src={config.logo}
                          alt={comp}
                          className="w-5 h-5 object-contain"
                        />
                      )}
                      <span>{comp}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
            {/* Sub-header row with BASE/PROMO */}
            <tr className="bg-slate-100/50">
              {competitors.map((comp) => (
                <React.Fragment key={`${comp}-headers`}>
                  <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 border-b border-slate-200">
                    BASE
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-emerald-600 border-b border-slate-200">
                    PROMO
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr
                key={row.kitType}
                className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
              >
                <td className="px-4 py-3 text-slate-700 border-b border-slate-100 font-medium">
                  {row.kitType}
                </td>
                {competitors.map((comp) => {
                  const compData = row.competitors[comp];
                  return (
                    <React.Fragment key={`${row.kitType}-${comp}`}>
                      <td className="px-3 py-3 text-right text-slate-800 border-b border-slate-100">
                        {formatCurrency(compData?.avgBase || 0, currency)}
                      </td>
                      <td className="px-3 py-3 text-right text-emerald-600 border-b border-slate-100">
                        {formatCurrency(compData?.avgPromo || 0, currency)}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
            {/* Total row */}
            <tr className="bg-slate-100 font-semibold">
              <td className="px-4 py-3 text-slate-700">
                Total
              </td>
              {competitors.map((comp) => {
                const compTotal = totals[comp];
                return (
                  <React.Fragment key={`total-${comp}`}>
                    <td className="px-3 py-3 text-right text-slate-800">
                      {formatCurrency(compTotal?.avgBase || 0, currency)}
                    </td>
                    <td className="px-3 py-3 text-right text-emerald-600">
                      {formatCurrency(compTotal?.avgPromo || 0, currency)}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
