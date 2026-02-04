"use client";

import { PricingDataRow, CurrencyMode } from "@/lib/types";

interface PriceTableProps {
  data: PricingDataRow[];
  title: string;
  priceType: "recurrente" | "alta";
  currency: CurrencyMode;
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
 * Simple price table showing averages by kit type
 */
export function PriceTable({ data, title, priceType, currency }: PriceTableProps) {
  // Group data by normalized kit size
  const kitGroups: Record<string, PricingDataRow[]> = {};

  data.forEach((row) => {
    const kitKey = normalizeKitSize(row.tamanoKit);
    if (!kitGroups[kitKey]) {
      kitGroups[kitKey] = [];
    }
    kitGroups[kitKey].push(row);
  });

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

  // Calculate averages for each kit type
  const tableData = Object.entries(kitGroups).map(([kitType, rows]) => {
    const baseValues = priceType === "recurrente"
      ? rows.map((r) => getPrice(r, "recurrenteBase"))
      : rows.map((r) => getPrice(r, "altaBase"));

    const promoValues = priceType === "recurrente"
      ? rows.map((r) => getPrice(r, "recurrentePromo"))
      : rows.map((r) => getPrice(r, "altaPromo"));

    return {
      kitType,
      avgBase: calculateAverage(baseValues),
      avgPromo: calculateAverage(promoValues),
      count: rows.length,
    };
  });

  // Sort to show Kit Estándar first, then Kit Avanzado, then others
  const sortOrder = ["Kit Estándar", "Kit Avanzado", "Sin especificar"];
  tableData.sort((a, b) => {
    const aIndex = sortOrder.indexOf(a.kitType);
    const bIndex = sortOrder.indexOf(b.kitType);
    if (aIndex === -1 && bIndex === -1) return a.kitType.localeCompare(b.kitType);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Calculate totals
  const allBaseValues = priceType === "recurrente"
    ? data.map((r) => getPrice(r, "recurrenteBase"))
    : data.map((r) => getPrice(r, "altaBase"));

  const allPromoValues = priceType === "recurrente"
    ? data.map((r) => getPrice(r, "recurrentePromo"))
    : data.map((r) => getPrice(r, "altaPromo"));

  const totalAvgBase = calculateAverage(allBaseValues);
  const totalAvgPromo = calculateAverage(allPromoValues);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-600 border-b border-slate-200">
                Tipo de Kit
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600 border-b border-slate-200">
                Valor promedio BASE
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600 border-b border-slate-200">
                Valor promedio PROMO
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr
                key={row.kitType}
                className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
              >
                <td className="px-4 py-3 text-slate-700 border-b border-slate-100">
                  {row.kitType}
                  <span className="text-xs text-slate-400 ml-2">({row.count})</span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-800 border-b border-slate-100">
                  {formatCurrency(row.avgBase, currency)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-emerald-600 border-b border-slate-100">
                  {formatCurrency(row.avgPromo, currency)}
                </td>
              </tr>
            ))}
            {/* Total row */}
            <tr className="bg-slate-100 font-semibold">
              <td className="px-4 py-3 text-slate-700">
                Total
                <span className="text-xs text-slate-400 ml-2">({data.length})</span>
              </td>
              <td className="px-4 py-3 text-right text-slate-800">
                {formatCurrency(totalAvgBase, currency)}
              </td>
              <td className="px-4 py-3 text-right text-emerald-600">
                {formatCurrency(totalAvgPromo, currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
