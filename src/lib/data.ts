import { PricingDataRow, FilterState, BoxplotStats, BoxplotComparison, PromoAnalysis, PromoAnalysisByCompetitor, CurrencyMode } from "./types";

// Import the JSON data directly
import rawData from "@/data/pricing-data.json";

/**
 * Exchange rates to convert local currency to EUR
 * TC / Budget rates from the provided table
 */
const EXCHANGE_RATES: Record<string, number> = {
  // Argentina
  "ARG": 1676,
  "AR": 1676,
  "ARGENTINA": 1676,
  // Colombia
  "CO": 4900,
  "COL": 4900,
  "COLOMBIA": 4900,
  // Peru
  "PE": 4.24,
  "PER": 4.24,
  "PERU": 4.24,
  // Uruguay
  "UY": 49.5,
  "URU": 49.5,
  "URUGUAY": 49.5,
  // Paraguay
  "PY": 9268,
  "PAR": 9268,
  "PARAGUAY": 9268,
  // Chile
  "CH": 1081,
  "CHL": 1081,
  "CHI": 1081,
  "CHILE": 1081,
  // Portugal
  "PT": 1,
  "POR": 1,
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
 * Map country codes to full names
 */
const COUNTRY_NAMES: Record<string, string> = {
  "ARG": "Argentina",
  "AR": "Argentina",
  "ARGENTINA": "Argentina",
  "COL": "Colombia",
  "CO": "Colombia",
  "COLOMBIA": "Colombia",
  "PER": "Perú",
  "PE": "Perú",
  "PERU": "Perú",
  "URU": "Uruguay",
  "UY": "Uruguay",
  "URUGUAY": "Uruguay",
  "PAR": "Paraguay",
  "PY": "Paraguay",
  "PARAGUAY": "Paraguay",
  "CHL": "Chile",
  "CHI": "Chile",
  "CH": "Chile",
  "CHILE": "Chile",
  "POR": "Portugal",
  "PT": "Portugal",
  "PORTUGAL": "Portugal",
};

/**
 * Normalize country names - converts codes to full names
 */
function normalizeCountry(country: string | null | undefined): string {
  if (!country) return "Desconocido";
  const cleaned = country.trim().toUpperCase();
  return COUNTRY_NAMES[cleaned] || cleaned;
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
 * Stores both local currency and EUR converted values
 */
export function parseData(): PricingDataRow[] {
  return (rawData as Record<string, unknown>[]).map((row) => {
    const pais = normalizeCountry(row["País"] as string);

    // Get raw local currency values
    const precioRecurrenteBaseLocal = row["PRECIO RECURRENTE - BASE "] as number;
    const precioRecurrentePromocionalLocal = row["PRECIO RECURRENTE - PROMOCIONAL"] as number;
    const montoPromoLocal = row["MONTO DE LA PROMO"] as number | null;
    const precioRecurrenteEfectivoLocal = row["PRECIO RECURRENTE - EFECTIVO"] as number;
    const precioAltaBaseLocal = row["PRECIO ALTA - BASE"] as number;
    const precioAltaPromocionalLocal = row["PRECIO ALTA - PROMOCIONAL"] as number;
    const precioAltaEfectivoLocal = row["PRECIO DE ALTA - EFECTIVO"] as number;

    return {
      id: row["ID "] as number,
      pais,
      competidor: row["Competidor"] as string,
      segmento: normalizeSegment(row["Segmento"] as string),
      tamanoKit: (row["Tamaño del Kit"] as string | null) || null,
      // EUR converted prices
      precioRecurrenteBase: convertToEUR(precioRecurrenteBaseLocal, pais),
      precioRecurrentePromocional: convertToEUR(precioRecurrentePromocionalLocal, pais),
      montoPromo: montoPromoLocal ? convertToEUR(montoPromoLocal, pais) : null,
      precioRecurrenteEfectivo: convertToEUR(precioRecurrenteEfectivoLocal, pais),
      precioAltaBase: convertToEUR(precioAltaBaseLocal, pais),
      precioAltaPromocional: convertToEUR(precioAltaPromocionalLocal, pais),
      precioAltaEfectivo: convertToEUR(precioAltaEfectivoLocal, pais),
      // Local currency prices (original values)
      precioRecurrenteBaseLocal,
      precioRecurrentePromocionalLocal,
      montoPromoLocal,
      precioRecurrenteEfectivoLocal,
      precioAltaBaseLocal,
      precioAltaPromocionalLocal,
      precioAltaEfectivoLocal,
      // Percentages and other fields
      porcentajePromocionRecurrente: row["PORCENTAJE DE PROMOCION RECURRENTE"] as number | null,
      porcentajePromocionAlta: row["PORCENTAJE DE PROMOCION DE ALTA"] as number | null,
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
  priceType: "recurrente" | "alta",
  currency: CurrencyMode = "EUR"
): BoxplotComparison[] {
  const filteredData = filterData(data, filters);

  if (filteredData.length === 0) {
    return [];
  }

  // Helper to get price based on currency mode
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

  // If a country is selected, group by competidor
  // Otherwise, show all data as a single group
  const groupBy = filters.pais ? "competidor" : "all";

  if (groupBy === "all") {
    const baseValues =
      priceType === "recurrente"
        ? filteredData.map((d) => getPrice(d, "recurrenteBase"))
        : filteredData.map((d) => getPrice(d, "altaBase"));

    const promoValues =
      priceType === "recurrente"
        ? filteredData.map((d) => getPrice(d, "recurrentePromo"))
        : filteredData.map((d) => getPrice(d, "altaPromo"));

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
        ? rows.map((d) => getPrice(d, "recurrenteBase"))
        : rows.map((d) => getPrice(d, "altaBase"));

    const promoValues =
      priceType === "recurrente"
        ? rows.map((d) => getPrice(d, "recurrentePromo"))
        : rows.map((d) => getPrice(d, "altaPromo"));

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

/**
 * Check if a row has a promo (based on presenciaPromociones field)
 */
function hasPromo(row: PricingDataRow): boolean {
  const value = row.presenciaPromociones?.toLowerCase().trim();
  return value === "si" || value === "sí" || value === "yes";
}

/**
 * Calculate promo analysis for a set of data rows
 */
function calculatePromoAnalysis(rows: PricingDataRow[]): PromoAnalysis {
  const withPromo = rows.filter(hasPromo);
  const withoutPromo = rows.filter(r => !hasPromo(r));

  // Average promo amount (only for rows with promo and non-null montoPromo > 0)
  const promoAmounts = withPromo
    .map(r => r.montoPromo)
    .filter((v): v is number => v !== null && v > 0);
  const avgPromoAmount = promoAmounts.length > 0
    ? promoAmounts.reduce((a, b) => a + b, 0) / promoAmounts.length
    : 0;

  // Average recurring promo percentage (only for rows with actual promo discount)
  const recurringPercents = withPromo
    .map(r => r.porcentajePromocionRecurrente)
    .filter((v): v is number => v !== null && v < 0); // Negative means discount
  const avgRecurringPromoPercent = recurringPercents.length > 0
    ? Math.abs(recurringPercents.reduce((a, b) => a + b, 0) / recurringPercents.length) * 100
    : 0;

  // Average alta promo percentage (only for rows with actual promo discount)
  const altaPercents = rows
    .map(r => r.porcentajePromocionAlta)
    .filter((v): v is number => v !== null && v !== 0);
  const avgAltaPromoPercent = altaPercents.length > 0
    ? Math.abs(altaPercents.reduce((a, b) => a + b, 0) / altaPercents.length) * 100
    : 0;

  return {
    avgPromoAmount,
    avgRecurringPromoPercent,
    avgAltaPromoPercent,
    withPromoCount: withPromo.length,
    withoutPromoCount: withoutPromo.length,
    totalCount: rows.length,
  };
}

/**
 * Generate promo analysis for filtered data
 */
export function generatePromoAnalysis(
  data: PricingDataRow[],
  filters: FilterState
): PromoAnalysis {
  const filteredData = filterData(data, filters);
  return calculatePromoAnalysis(filteredData);
}

/**
 * Generate promo analysis grouped by competitor
 */
export function generatePromoAnalysisByCompetitor(
  data: PricingDataRow[],
  filters: FilterState
): PromoAnalysisByCompetitor[] {
  const filteredData = filterData(data, filters);

  // Group by competidor
  const groups: Map<string, PricingDataRow[]> = new Map();
  filteredData.forEach((row) => {
    const key = row.competidor;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  });

  const results: PromoAnalysisByCompetitor[] = [];

  groups.forEach((rows, competidor) => {
    results.push({
      competidor,
      analysis: calculatePromoAnalysis(rows),
    });
  });

  return results.sort((a, b) => a.competidor.localeCompare(b.competidor));
}
