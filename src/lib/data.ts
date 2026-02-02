import { PricingDataRow, FilterState, BoxplotStats, BoxplotComparison } from "./types";

// Import the JSON data directly
import rawData from "@/data/pricing-data.json";

/**
 * Exchange rates to convert local currency to EUR
 * TC / Budget rates from the provided table
 */
const EXCHANGE_RATES: Record<string, number> = {
  "ARG": 1676,      // Argentine Peso to EUR
  "AR": 1676,       // Alternative code
  "ARGENTINA": 1676,
  "CO": 4900,       // Colombian Peso to EUR
  "COLOMBIA": 4900,
  "PE": 4.24,       // Peruvian Sol to EUR
  "PERU": 4.24,
  "UY": 49.5,       // Uruguayan Peso to EUR
  "URUGUAY": 49.5,
  "PY": 9268,       // Paraguayan Guarani to EUR
  "PARAGUAY": 9268,
  "CH": 1081,       // Chilean Peso to EUR
  "CHILE": 1081,
  "PT": 1,          // Portugal (already EUR)
  "PORTUGAL": 1,
};

/**
 * Convert price from local currency to EUR
 */
function convertToEUR(price: number, country: string): number {
  const rate = EXCHANGE_RATES[country.toUpperCase()] || 1;
  return price / rate;
}

/**
 * Normalize country names (handle variations like "PARAGUAY\n")
 */
function normalizeCountry(country: string): string {
  return country.trim().toUpperCase();
}

/**
 * Normalize segment names (handle variations like "HOGAR" vs "Hogares")
 */
function normalizeSegment(segment: string): string {
  const lower = segment.toLowerCase().trim();
  if (lower === "hogar" || lower === "hogares") return "Hogares";
  if (lower === "negocio" || lower === "negocios") return "Negocios";
  return segment;
}

/**
 * Parse raw JSON data into typed PricingDataRow array
 * All prices are converted to EUR using exchange rates
 */
export function parseData(): PricingDataRow[] {
  return (rawData as Record<string, unknown>[]).map((row) => {
    const pais = normalizeCountry(row["País"] as string);

    return {
      id: row["ID "] as number,
      pais,
      competidor: row["Competidor"] as string,
      segmento: normalizeSegment(row["Segmento"] as string),
      tamanoKit: (row["Tamaño del Kit"] as string | null) || null,
      // Convert all prices to EUR
      precioRecurrenteBase: convertToEUR(row["PRECIO RECURRENTE - BASE "] as number, pais),
      precioRecurrentePromocional: convertToEUR(row["PRECIO RECURRENTE - PROMOCIONAL"] as number, pais),
      montoPromo: row["MONTO DE LA PROMO"] ? convertToEUR(row["MONTO DE LA PROMO"] as number, pais) : null,
      porcentajePromocionRecurrente: row["PORCENTAJE DE PROMOCION RECURRENTE"] as number | null,
      precioRecurrenteEfectivo: convertToEUR(row["PRECIO RECURRENTE - EFECTIVO"] as number, pais),
      precioAltaBase: convertToEUR(row["PRECIO ALTA - BASE"] as number, pais),
      precioAltaPromocional: convertToEUR(row["PRECIO ALTA - PROMOCIONAL"] as number, pais),
      porcentajePromocionAlta: row["PORCENTAJE DE PROMOCION DE ALTA"] as number | null,
      precioAltaEfectivo: convertToEUR(row["PRECIO DE ALTA - EFECTIVO"] as number, pais),
      presenciaPromociones: row["PRESENCIA DE PROMOCIONES "] as string,
      duracionPromos: row["Duración promos"] as string,
    };
  });
}

/**
 * Get unique values for filter options
 */
export function getFilterOptions(data: PricingDataRow[]) {
  const paises = [...new Set(data.map((d) => d.pais))].sort();
  const competidores = [...new Set(data.map((d) => d.competidor))].sort();
  const segmentos = [...new Set(data.map((d) => d.segmento))].sort();
  const tamanos = [...new Set(data.map((d) => d.tamanoKit).filter(Boolean))].sort() as string[];

  return { paises, competidores, segmentos, tamanos };
}

/**
 * Filter data based on current filter state
 */
export function filterData(data: PricingDataRow[], filters: FilterState): PricingDataRow[] {
  return data.filter((row) => {
    if (filters.pais && row.pais !== filters.pais) return false;
    if (filters.competidor && row.competidor !== filters.competidor) return false;
    if (filters.segmento && row.segmento !== filters.segmento) return false;
    if (filters.tamanoKit && row.tamanoKit !== filters.tamanoKit) return false;
    return true;
  });
}

/**
 * Calculate boxplot statistics for an array of values
 */
export function calculateBoxplotStats(values: number[]): BoxplotStats {
  if (values.length === 0) {
    return { min: 0, q1: 0, median: 0, q3: 0, max: 0, mean: 0, values: [] };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const min = sorted[0];
  const max = sorted[n - 1];
  const mean = values.reduce((a, b) => a + b, 0) / n;

  // Calculate quartiles
  const q1Index = Math.floor(n * 0.25);
  const medianIndex = Math.floor(n * 0.5);
  const q3Index = Math.floor(n * 0.75);

  const q1 = sorted[q1Index];
  const median = sorted[medianIndex];
  const q3 = sorted[q3Index];

  return { min, q1, median, q3, max, mean, values: sorted };
}

/**
 * Calculate percentage difference between base and promo means
 */
function calculatePercentageDiff(baseMean: number, promoMean: number): number {
  if (baseMean === 0) return 0;
  return ((promoMean - baseMean) / baseMean) * 100;
}

/**
 * Generate boxplot comparison data grouped by competidor
 */
export function generateBoxplotComparisons(
  data: PricingDataRow[],
  filters: FilterState,
  priceType: "recurrente" | "alta"
): BoxplotComparison[] {
  const filteredData = filterData(data, filters);

  if (filteredData.length === 0) {
    return [];
  }

  // If a country is selected, group by competidor
  // Otherwise, show all data as a single group
  const groupBy = filters.pais ? "competidor" : "all";

  if (groupBy === "all") {
    const baseValues =
      priceType === "recurrente"
        ? filteredData.map((d) => d.precioRecurrenteBase)
        : filteredData.map((d) => d.precioAltaBase);

    const promoValues =
      priceType === "recurrente"
        ? filteredData.map((d) => d.precioRecurrentePromocional)
        : filteredData.map((d) => d.precioAltaPromocional);

    // Filter out zero values for alta prices (many are 0)
    const filteredBaseValues = priceType === "alta"
      ? baseValues.filter(v => v > 0)
      : baseValues;
    const filteredPromoValues = priceType === "alta"
      ? promoValues.filter(v => v > 0)
      : promoValues;

    if (filteredBaseValues.length === 0) return [];

    const baseStats = calculateBoxplotStats(filteredBaseValues);
    const promoStats = calculateBoxplotStats(filteredPromoValues);

    return [
      {
        label: "Todos",
        base: baseStats,
        promo: promoStats,
        percentageDiff: calculatePercentageDiff(baseStats.mean, promoStats.mean),
      },
    ];
  }

  // Group by competidor
  const groups: Map<string, PricingDataRow[]> = new Map();
  filteredData.forEach((row) => {
    const key = row.competidor;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  });

  const comparisons: BoxplotComparison[] = [];

  groups.forEach((rows, competidor) => {
    const baseValues =
      priceType === "recurrente"
        ? rows.map((d) => d.precioRecurrenteBase)
        : rows.map((d) => d.precioAltaBase);

    const promoValues =
      priceType === "recurrente"
        ? rows.map((d) => d.precioRecurrentePromocional)
        : rows.map((d) => d.precioAltaPromocional);

    // Filter out zero values for alta prices
    const filteredBaseValues = priceType === "alta"
      ? baseValues.filter(v => v > 0)
      : baseValues;
    const filteredPromoValues = priceType === "alta"
      ? promoValues.filter(v => v > 0)
      : promoValues;

    if (filteredBaseValues.length === 0) return;

    const baseStats = calculateBoxplotStats(filteredBaseValues);
    const promoStats = calculateBoxplotStats(filteredPromoValues);

    comparisons.push({
      label: competidor,
      base: baseStats,
      promo: promoStats,
      percentageDiff: calculatePercentageDiff(baseStats.mean, promoStats.mean),
    });
  });

  return comparisons.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Get available filter options based on current selections
 * This enables cascading filters
 */
export function getAvailableFilterOptions(data: PricingDataRow[], currentFilters: FilterState) {
  // Start with all data
  let filtered = data;

  // Apply filters progressively
  if (currentFilters.pais) {
    filtered = filtered.filter((d) => d.pais === currentFilters.pais);
  }

  // Get available options from filtered data
  const competidores = [...new Set(filtered.map((d) => d.competidor))].sort();

  if (currentFilters.competidor) {
    filtered = filtered.filter((d) => d.competidor === currentFilters.competidor);
  }

  const segmentos = [...new Set(filtered.map((d) => d.segmento))].sort();

  if (currentFilters.segmento) {
    filtered = filtered.filter((d) => d.segmento === currentFilters.segmento);
  }

  const tamanos = [...new Set(filtered.map((d) => d.tamanoKit).filter(Boolean))].sort() as string[];

  // Paises are always all available
  const paises = [...new Set(data.map((d) => d.pais))].sort();

  return { paises, competidores, segmentos, tamanos };
}
