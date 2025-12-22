"use client";

import { useState, useRef, useEffect } from "react";
import type { ApplicationWithEnvironment } from "@/modules/customers/types";

interface ApplicationFilters {
  publisher?: string;
  customerName?: string;
  environmentName?: string;
  environmentType?: string;
  publishedAs?: string;
  hideMicrosoftApps?: boolean;
}

interface ApplicationFilterPanelProps {
  applications: ApplicationWithEnvironment[];
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
  const uniquePublishers = Array.from(
    new Set(applications.map((app) => app.publisher).filter((v): v is string => !!v))
  ).sort();

  const uniqueCustomers = Array.from(
    new Set(applications.map((app) => app.customerName).filter((v): v is string => !!v))
  ).sort();

  const uniqueEnvironments = Array.from(
    new Set(applications.map((app) => app.environmentName).filter((v): v is string => !!v))
  ).sort();

  const uniqueEnvironmentTypes = Array.from(
    new Set(applications.map((app) => app.environmentType).filter((v): v is string => !!v))
  ).sort();

  const uniquePublishedAs = Array.from(
    new Set(applications.map((app) => app.publishedAs).filter((v): v is string => !!v))
  ).sort();

  const hasActiveFilters =
    filters.publisher ||
    filters.customerName ||
    filters.environmentName ||
    filters.environmentType ||
    filters.publishedAs;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Toggle para ocultar/mostrar apps de Microsoft */}
      <label className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border cursor-pointer transition-colors ${
        filters.hideMicrosoftApps
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600"
          : "border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
      }`}>
        <input
          type="checkbox"
          checked={filters.hideMicrosoftApps ?? true}
          onChange={(e) => onFilterChange({ ...filters, hideMicrosoftApps: e.target.checked })}
          className="w-4 h-4 text-blue-600 bg-white border-blue-500 rounded focus:ring-blue-500 focus:ring-2 checked:bg-blue-600 checked:border-blue-600 dark:bg-gray-700 dark:border-blue-500 dark:checked:bg-blue-600 dark:checked:border-blue-600"
        />
        <span className={`text-xs font-medium ${
          filters.hideMicrosoftApps
            ? "text-blue-700 dark:text-blue-300"
            : "text-gray-700 dark:text-gray-300"
        }`}>
          Ocultar apps Microsoft
        </span>
      </label>

      {/* Filtro de Publisher */}
      <FilterDropdown
        label="Publisher"
        value={filters.publisher || ""}
        onChange={(value) => onFilterChange({ ...filters, publisher: value || undefined })}
        options={uniquePublishers}
        placeholder="Todos"
      />

      {/* Filtro de Cliente */}
      <FilterDropdown
        label="Cliente"
        value={filters.customerName || ""}
        onChange={(value) => onFilterChange({ ...filters, customerName: value || undefined })}
        options={uniqueCustomers}
        placeholder="Todos"
      />

      {/* Filtro de Tipo de Entorno */}
      <FilterDropdown
        label="Tipo Entorno"
        value={filters.environmentType || ""}
        onChange={(value) => onFilterChange({ ...filters, environmentType: value || undefined })}
        options={uniqueEnvironmentTypes}
        placeholder="Todos"
      />

      {/* Filtro de Publicación */}
      <FilterDropdown
        label="Publicado como"
        value={filters.publishedAs || ""}
        onChange={(value) => onFilterChange({ ...filters, publishedAs: value || undefined })}
        options={uniquePublishedAs}
        placeholder="Todos"
      />

      {/* Filtro de Entorno */}
      <FilterDropdown
        label="Entorno"
        value={filters.environmentName || ""}
        onChange={(value) => onFilterChange({ ...filters, environmentName: value || undefined })}
        options={uniqueEnvironments}
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

// Componente de dropdown minimalista
interface FilterDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}

function FilterDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const displayValue = value || placeholder;
  const hasValue = !!value;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
          hasValue
            ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        }`}
      >
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}:
        </span>
        <span className={`text-xs ${hasValue ? 'font-medium' : ''}`}>
          {displayValue}
        </span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${
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

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[180px] max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
          <button
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {placeholder}
          </button>
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                value === option
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
