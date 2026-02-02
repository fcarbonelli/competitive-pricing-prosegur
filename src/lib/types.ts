/**
 * Raw data row from the Excel file
 */
export interface PricingDataRow {
  id: number;
  pais: string;
  competidor: string;
  segmento: string;
  tamanoKit: string | null;
  precioRecurrenteBase: number;
  precioRecurrentePromocional: number;
  montoPromo: number | null;
  porcentajePromocionRecurrente: number | null;
  precioRecurrenteEfectivo: number;
  precioAltaBase: number;
  precioAltaPromocional: number;
  porcentajePromocionAlta: number | null;
  precioAltaEfectivo: number;
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
