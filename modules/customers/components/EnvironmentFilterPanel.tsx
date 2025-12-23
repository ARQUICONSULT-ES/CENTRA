"use client";

import type { EnvironmentWithCustomer } from "@/modules/customers/types";
import { FilterDropdown } from "@/modules/shared/components/FilterDropdown";

interface EnvironmentFilters {
  status?: string;
  type?: string;
  customer?: string;
  platformVersion?: string;
  applicationVersion?: string;
}

interface EnvironmentFilterPanelProps {
  environments: EnvironmentWithCustomer[];
  filters: EnvironmentFilters;
  onFilterChange: (filters: EnvironmentFilters) => void;
  onClearFilters: () => void;
}

export function EnvironmentFilterPanel({
  environments,
  filters,
  onFilterChange,
  onClearFilters,
}: EnvironmentFilterPanelProps) {
  // Extraer valores únicos para las opciones de filtro
  const uniqueTypes = Array.from(
    new Set(environments.map((env) => env.type).filter((v): v is string => !!v))
  ).sort();

  const uniqueStatuses = Array.from(
    new Set(environments.map((env) => env.status).filter((v): v is string => !!v))
  ).sort();

  const uniqueCustomers = Array.from(
    new Set(environments.map((env) => env.customerName).filter((v): v is string => !!v))
  ).sort();

  const uniquePlatformVersions = Array.from(
    new Set(environments.map((env) => env.platformVersion).filter((v): v is string => !!v))
  ).sort();

  const uniqueApplicationVersions = Array.from(
    new Set(environments.map((env) => env.applicationVersion).filter((v): v is string => !!v))
  ).sort();

  const hasActiveFilters =
    filters.status !== 'Active' ||
    filters.type ||
    filters.customer ||
    filters.platformVersion ||
    filters.applicationVersion;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Filtro de Tipo */}
      <FilterDropdown
        label="Tipo"
        value={filters.type || ""}
        onChange={(value) => onFilterChange({ ...filters, type: value || undefined })}
        options={uniqueTypes}
        placeholder="Todos"
      />

      {/* Filtro de Estado */}
      <FilterDropdown
        label="Estado"
        value={filters.status || ""}
        onChange={(value) => onFilterChange({ ...filters, status: value || undefined })}
        options={uniqueStatuses}
        placeholder="Todos"
      />

      {/* Filtro de Cliente */}
      <FilterDropdown
        label="Cliente"
        value={filters.customer || ""}
        onChange={(value) => onFilterChange({ ...filters, customer: value || undefined })}
        options={uniqueCustomers}
        placeholder="Todos"
      />

      {/* Filtro de Platform Version */}
      <FilterDropdown
        label="Platform Version"
        value={filters.platformVersion || ""}
        onChange={(value) => onFilterChange({ ...filters, platformVersion: value || undefined })}
        options={uniquePlatformVersions}
        placeholder="Todas"
      />

      {/* Filtro de App Version */}
      <FilterDropdown
        label="App Version"
        value={filters.applicationVersion || ""}
        onChange={(value) => onFilterChange({ ...filters, applicationVersion: value || undefined })}
        options={uniqueApplicationVersions}
        placeholder="Todas"
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
