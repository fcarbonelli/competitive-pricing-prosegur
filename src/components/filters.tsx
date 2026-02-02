"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterState } from "@/lib/types";

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableOptions: {
    paises: string[];
    competidores: string[];
    segmentos: string[];
    tamanos: string[];
  };
}

/**
 * Filter controls for the dashboard
 * Allows filtering by País, Competidor, Segmento, and Tamaño del Kit
 */
export function Filters({
  filters,
  onFiltersChange,
  availableOptions,
}: FiltersProps) {
  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    const newFilters = { ...filters, [key]: value };

    // Reset dependent filters when parent filter changes
    if (key === "pais") {
      newFilters.competidor = null;
      newFilters.segmento = null;
      newFilters.tamanoKit = null;
    } else if (key === "competidor") {
      newFilters.segmento = null;
      newFilters.tamanoKit = null;
    } else if (key === "segmento") {
      newFilters.tamanoKit = null;
    }

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      pais: null,
      competidor: null,
      segmento: null,
      tamanoKit: null,
    });
  };

  const hasActiveFilters =
    filters.pais || filters.competidor || filters.segmento || filters.tamanoKit;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-sm font-semibold text-slate-700">Filtros</span>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        {/* País Filter */}
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            País
          </label>
          <Select
            value={filters.pais || "all"}
            onValueChange={(value) =>
              handleFilterChange("pais", value === "all" ? null : value)
            }
          >
            <SelectTrigger className="bg-slate-50 border-slate-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500/20">
              <SelectValue placeholder="Todos los países" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los países</SelectItem>
              {availableOptions.paises.map((pais) => (
                <SelectItem key={pais} value={pais}>
                  {pais}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Competidor Filter */}
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Competidor
          </label>
          <Select
            value={filters.competidor || "all"}
            onValueChange={(value) =>
              handleFilterChange("competidor", value === "all" ? null : value)
            }
          >
            <SelectTrigger className="bg-slate-50 border-slate-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500/20">
              <SelectValue placeholder="Todos los competidores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los competidores</SelectItem>
              {availableOptions.competidores.map((comp) => (
                <SelectItem key={comp} value={comp}>
                  {comp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Segmento Filter */}
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Segmento
          </label>
          <Select
            value={filters.segmento || "all"}
            onValueChange={(value) =>
              handleFilterChange("segmento", value === "all" ? null : value)
            }
          >
            <SelectTrigger className="bg-slate-50 border-slate-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500/20">
              <SelectValue placeholder="Todos los segmentos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los segmentos</SelectItem>
              {availableOptions.segmentos.map((seg) => (
                <SelectItem key={seg} value={seg}>
                  {seg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tamaño del Kit Filter */}
        {availableOptions.tamanos.length > 0 && (
          <div className="flex flex-col gap-1.5 min-w-[180px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Tamaño del Kit
            </label>
            <Select
              value={filters.tamanoKit || "all"}
              onValueChange={(value) =>
                handleFilterChange("tamanoKit", value === "all" ? null : value)
              }
            >
              <SelectTrigger className="bg-slate-50 border-slate-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500/20">
                <SelectValue placeholder="Todos los tamaños" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tamaños</SelectItem>
                {availableOptions.tamanos.map((tam) => (
                  <SelectItem key={tam} value={tam}>
                    {tam}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-lg transition-all shadow-sm hover:shadow"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
