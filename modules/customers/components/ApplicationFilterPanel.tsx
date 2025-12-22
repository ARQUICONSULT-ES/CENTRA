"use client";

import { useState, useRef, useEffect } from "react";
import type { InstalledAppWithEnvironment } from "@/modules/customers/types";

interface InstalledAppFilters {
  publisher?: string;
  customerName?: string;
  environmentName?: string;
  environmentType?: string;
  publishedAs?: string;
  hideMicrosoftApps?: boolean;
}

interface ApplicationFilterPanelProps {
  installedApps: InstalledAppWithEnvironment[];
  filters: InstalledAppFilters;
  onFilterChange: (filters: InstalledAppFilters) => void;
  onClearFilters: () => void;
}

export function ApplicationFilterPanel({
  installedApps,
  filters,
  onFilterChange,
  onClearFilters,
}: ApplicationFilterPanelProps) {
  // Extraer valores únicos para las opciones de filtro
  const uniquePublishers = Array.from(
    new Set(installedApps.map((app) => app.publisher).filter((v): v is string => !!v))
  ).sort();

  const uniqueCustomers = Array.from(
    new Set(installedApps.map((app) => app.customerName).filter((v): v is string => !!v))
  ).sort();

  const uniqueEnvironments = Array.from(
    new Set(installedApps.map((app) => app.environmentName).filter((v): v is string => !!v))
  ).sort();

  const uniqueEnvironmentTypes = Array.from(
    new Set(installedApps.map((app) => app.environmentType).filter((v): v is string => !!v))
  ).sort();

  const uniquePublishedAs = Array.from(
    new Set(installedApps.map((app) => app.publishedAs).filter((v): v is string => !!v))
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

// Componente de dropdown con selección múltiple
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

  // Parsear valores seleccionados (separados por coma)
  const selectedValues = value ? value.split(',') : [];
  const hasValue = selectedValues.length > 0;

  // Función para toggle un valor
  const toggleValue = (optionValue: string) => {
    let newValues: string[];
    
    if (selectedValues.includes(optionValue)) {
      // Remover si ya está seleccionado
      newValues = selectedValues.filter(v => v !== optionValue);
    } else {
      // Añadir si no está seleccionado
      newValues = [...selectedValues, optionValue];
    }
    
    onChange(newValues.join(','));
  };

  // Seleccionar todos
  const selectAll = () => {
    onChange('');
  };

  // Generar texto de display
  const getDisplayText = () => {
    if (!hasValue) return placeholder;
    
    if (selectedValues.length <= 3) {
      return selectedValues.join(', ');
    }
    
    return `${selectedValues.slice(0, 3).join(', ')}...`;
  };

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
        <span className={`text-xs ${hasValue ? 'font-medium' : ''} max-w-[200px] truncate`}>
          {getDisplayText()}
        </span>
        <svg
          className={`w-3.5 h-3.5 transition-transform flex-shrink-0 ${
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
        <div className="absolute z-50 mt-1 w-full min-w-[200px] max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
          {/* Opción "Todos" */}
          <button
            onClick={() => {
              selectAll();
            }}
            className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center gap-2 ${
              !hasValue
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
              !hasValue
                ? "bg-blue-600 border-blue-600"
                : "border-gray-300 dark:border-gray-600"
            }`}>
              {!hasValue && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            {placeholder}
          </button>
          
          {/* Opciones individuales */}
          {options.map((option) => {
            const isSelected = selectedValues.includes(option);
            return (
              <button
                key={option}
                onClick={() => toggleValue(option)}
                className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center gap-2 ${
                  isSelected
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  isSelected
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
