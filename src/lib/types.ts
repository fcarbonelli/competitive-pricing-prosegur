/**
 * Currency type for display
 */
export type CurrencyMode = "EUR" | "LOCAL";

/**
 * Raw data row from the Excel file
 * Contains both local currency and EUR converted values
 */
export interface PricingDataRow {
  id: number;
  pais: string;
  competidor: string;
  segmento: string;
  tamanoKit: string | null;
  // EUR converted prices
  precioRecurrenteBase: number;
  precioRecurrentePromocional: number;
  montoPromo: number | null;
  precioRecurrenteEfectivo: number;
  precioAltaBase: number;
  precioAltaPromocional: number;
  precioAltaEfectivo: number;
  // Local currency prices (original values)
  precioRecurrenteBaseLocal: number;
  precioRecurrentePromocionalLocal: number;
  montoPromoLocal: number | null;
  precioRecurrenteEfectivoLocal: number;
  precioAltaBaseLocal: number;
  precioAltaPromocionalLocal: number;
  precioAltaEfectivoLocal: number;
  // Percentages and other fields
  porcentajePromocionRecurrente: number | null;
  porcentajePromocionAlta: number | null;
  presenciaPromociones: string;
  duracionPromos: string;
}

/**
 * Filter state for the dashboard
 */
export interface FilterState {
  pais: string | null;
  competidor: string | null;
  segmento: string | null;
  tamanoKit: string | null;
}

/**
 * Boxplot statistics
 */
export interface BoxplotStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  values: number[];
}

/**
 * Boxplot comparison data for a single group
 */
export interface BoxplotComparison {
  label: string;
  base: BoxplotStats;
  promo: BoxplotStats;
  percentageDiff: number;
}

/**
 * Promo analysis statistics
 */
export interface PromoAnalysis {
  // Average promo amount (excluding no-promo)
  avgPromoAmount: number;
  // Average recurring promo percentage (excluding no-promo)
  avgRecurringPromoPercent: number;
  // Average alta promo percentage (excluding no-promo)
  avgAltaPromoPercent: number;
  // Counts for pie chart
  withPromoCount: number;
  withoutPromoCount: number;
  totalCount: number;
}

/**
 * Promo analysis by competitor
 */
export interface PromoAnalysisByCompetitor {
  competidor: string;
  analysis: PromoAnalysis;
}
