/**
 * Competitor brand colors and configuration
 */
export const COMPETITOR_CONFIG: Record<string, { color: string; colorLight: string; logo: string }> = {
  "ADT": {
    color: "#0066CC",        // Blue
    colorLight: "rgba(0, 102, 204, 0.6)",
    logo: "/logos/adt.png",
  },
  "Verisure": {
    color: "#E31937",        // Red
    colorLight: "rgba(227, 25, 55, 0.6)",
    logo: "/logos/verisure.png",
  },
  "Protek": {
    color: "#00A651",        // Green
    colorLight: "rgba(0, 166, 81, 0.6)",
    logo: "/logos/protek.png",
  },
  "Telesentinel": {
    color: "#FF6B00",        // Orange
    colorLight: "rgba(255, 107, 0, 0.6)",
    logo: "/logos/telesentinel.png",
  },
  "Alarmar": {
    color: "#2ECC71",        // Emerald green
    colorLight: "rgba(46, 204, 113, 0.6)",
    logo: "/logos/alarmar.png",
  },
  "Atlas": {
    color: "#1E3A8A",        // Dark blue
    colorLight: "rgba(30, 58, 138, 0.6)",
    logo: "/logos/atlas.png",
  },
  "Maxima Seguridad": {
    color: "#7C3AED",        // Purple
    colorLight: "rgba(124, 58, 237, 0.6)",
    logo: "/logos/maxima-seguridad.png",
  },
  "Securitas": {
    color: "#DC2626",        // Red
    colorLight: "rgba(220, 38, 38, 0.6)",
    logo: "/logos/securitas.png",
  },
  "Prosegur": {
    color: "#000000",        // Black
    colorLight: "rgba(0, 0, 0, 0.6)",
    logo: "/logos/prosegur.png",
  },
  // Default for unknown competitors
  "default": {
    color: "#6B7280",        // Gray
    colorLight: "rgba(107, 114, 128, 0.6)",
    logo: "/logos/prosegur.png",  // Use Prosegur as default
  },
};

/**
 * Get competitor configuration with fallback to default
 */
export function getCompetitorConfig(competidor: string) {
  return COMPETITOR_CONFIG[competidor] || COMPETITOR_CONFIG["default"];
}

/**
 * Colors for pie charts
 */
export const PIE_COLORS = {
  withPromo: "#10B981",    // Green - has promo
  withoutPromo: "#EF4444", // Red - no promo
};
