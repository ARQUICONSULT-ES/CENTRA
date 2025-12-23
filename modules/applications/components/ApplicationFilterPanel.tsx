"use client";

import type { Application } from "@/modules/applications/types";
import { FilterDropdown } from "@/modules/shared/components/FilterDropdown";

interface ApplicationFilters {
  name?: string;
  publisher?: string;
}

interface ApplicationFilterPanelProps {
  applications: Application[];
  filters: ApplicationFilters;
  onFilterChange: (filters: ApplicationFilters) => void;
  onClearFilters: () => void;
}

export function ApplicationFilterPanel({
  applications,
  filters,
  onFilterChange,
  onClearFilters,
}: ApplicationFilterPanelProps) {
  // Extraer valores únicos para las opciones de filtro
  const uniqueNames = Array.from(
    new Set(applications.map((app) => app.name).filter((v): v is string => !!v))
  ).sort();

  const uniquePublishers = Array.from(
    new Set(applications.map((app) => app.publisher).filter((v): v is string => !!v))
  ).sort();

  const hasActiveFilters = filters.name || filters.publisher;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Filtro de Nombre */}
      <FilterDropdown
        label="Nombre"
        value={filters.name || ""}
        onChange={(value) => onFilterChange({ ...filters, name: value || undefined })}
        options={uniqueNames}
        placeholder="Todos"
      />

      {/* Filtro de Publisher */}
      <FilterDropdown
        label="Publisher"
        value={filters.publisher || ""}
        onChange={(value) => onFilterChange({ ...filters, publisher: value || undefined })}
        options={uniquePublishers}
        placeholder="Todos"
      />

      {/* Botón de restablecer filtros */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Restablecer
        </button>
      )}
    </div>
  );
}


