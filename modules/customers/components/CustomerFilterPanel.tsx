"use client";

import type { FilterConfig, FiltersState } from "@/modules/customers/types/filters";

interface GenericFilterPanelProps<T> {
  config: FilterConfig<T>;
  filters: FiltersState;
  onFilterChange: (key: string, value: any, secondValue?: any) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export function GenericFilterPanel<T>({
  config,
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  isOpen,
  onToggle,
}: GenericFilterPanelProps<T>) {
  /**
   * Renderiza un campo de filtro según su tipo
   */
  const renderFilterField = (field: typeof config.fields[0]) => {
    const filterValue = filters[field.key];
    const currentValue = filterValue?.value ?? "";
    const secondValue = filterValue?.secondValue ?? "";

    switch (field.type) {
      case "text":
        return (
          <div key={field.key}>
            <label
              htmlFor={`filter-${field.key}`}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {field.label}
            </label>
            <input
              id={`filter-${field.key}`}
              type="text"
              value={currentValue}
              onChange={(e) => onFilterChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        );

      case "number":
        return (
          <div key={field.key}>
            <label
              htmlFor={`filter-${field.key}`}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {field.label}
            </label>
            <input
              id={`filter-${field.key}`}
              type="number"
              min={field.min}
              max={field.max}
              step={field.step}
              value={currentValue}
              onChange={(e) => onFilterChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        );

      case "range":
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={currentValue}
                onChange={(e) => onFilterChange(field.key, e.target.value, secondValue)}
                placeholder={field.placeholder || "Mínimo"}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              />
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={secondValue}
                onChange={(e) => onFilterChange(field.key, currentValue, e.target.value)}
                placeholder="Máximo"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
        );

      case "select":
        return (
          <div key={field.key}>
            <label
              htmlFor={`filter-${field.key}`}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {field.label}
            </label>
            <select
              id={`filter-${field.key}`}
              value={currentValue}
              onChange={(e) => onFilterChange(field.key, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Todos</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "boolean":
        return (
          <div key={field.key}>
            <label
              htmlFor={`filter-${field.key}`}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {field.label}
            </label>
            <select
              id={`filter-${field.key}`}
              value={currentValue === "" ? "" : currentValue ? "true" : "false"}
              onChange={(e) => {
                const value = e.target.value === "" ? "" : e.target.value === "true";
                onFilterChange(field.key, value);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
        );

      case "date":
        return (
          <div key={field.key}>
            <label
              htmlFor={`filter-${field.key}`}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {field.label}
            </label>
            <input
              id={`filter-${field.key}`}
              type="date"
              value={currentValue}
              onChange={(e) => onFilterChange(field.key, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        );

      case "dateRange":
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={currentValue}
                onChange={(e) => onFilterChange(field.key, e.target.value, secondValue)}
                placeholder="Desde"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <input
                type="date"
                value={secondValue}
                onChange={(e) => onFilterChange(field.key, currentValue, e.target.value)}
                placeholder="Hasta"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Header del panel */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-t-lg cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="font-semibold text-gray-900 dark:text-white">
            Filtros avanzados
          </span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              Activos
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Contenido del panel (colapsable) */}
      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.fields.map((field) => renderFilterField(field))}
          </div>

          {/* Botón para limpiar filtros */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
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
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

