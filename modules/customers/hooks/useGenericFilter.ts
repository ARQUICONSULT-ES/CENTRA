"use client";

import { useState, useMemo } from "react";
import type { FilterConfig, FiltersState, FilterValue, FilterOperator } from "@/modules/customers/types/filters";

type SortOption = string;

/**
 * Hook genérico para filtrar y ordenar una lista de elementos
 * @param items - Lista de elementos a filtrar
 * @param filterConfig - Configuración de los filtros disponibles
 * @param defaultSortBy - Campo por defecto para ordenar
 */
export function useGenericFilter<T extends Record<string, any>>(
  items: T[],
  filterConfig: FilterConfig<T>,
  defaultSortBy?: string
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>(defaultSortBy || "");
  const [filters, setFilters] = useState<FiltersState>({});

  /**
   * Aplica un filtro individual a un item
   */
  const applyFilter = (item: T, fieldConfig: any, filterValue: FilterValue): boolean => {
    if (!filterValue.value && filterValue.value !== 0 && filterValue.value !== false) {
      return true; // No hay filtro, pasar el item
    }

    // Obtener el valor del campo del item
    const itemValue = fieldConfig.getValue 
      ? fieldConfig.getValue(item)
      : item[fieldConfig.key];

    const operator = filterValue.operator || fieldConfig.operator;

    switch (operator) {
      case "equals":
        return itemValue === filterValue.value;

      case "contains":
        if (typeof itemValue === "string" && typeof filterValue.value === "string") {
          return itemValue.toLowerCase().includes(filterValue.value.toLowerCase());
        }
        return false;

      case "startsWith":
        if (typeof itemValue === "string" && typeof filterValue.value === "string") {
          return itemValue.toLowerCase().startsWith(filterValue.value.toLowerCase());
        }
        return false;

      case "endsWith":
        if (typeof itemValue === "string" && typeof filterValue.value === "string") {
          return itemValue.toLowerCase().endsWith(filterValue.value.toLowerCase());
        }
        return false;

      case "gt":
        return Number(itemValue) > Number(filterValue.value);

      case "gte":
        return Number(itemValue) >= Number(filterValue.value);

      case "lt":
        return Number(itemValue) < Number(filterValue.value);

      case "lte":
        return Number(itemValue) <= Number(filterValue.value);

      case "between":
        if (filterValue.secondValue !== undefined && filterValue.secondValue !== null && filterValue.secondValue !== "") {
          const numValue = Number(itemValue);
          const min = Number(filterValue.value);
          const max = Number(filterValue.secondValue);
          return numValue >= min && numValue <= max;
        }
        // Si solo hay un valor, actuar como gte
        return Number(itemValue) >= Number(filterValue.value);

      case "in":
        if (Array.isArray(filterValue.value)) {
          return filterValue.value.includes(itemValue);
        }
        return itemValue === filterValue.value;

      default:
        // Por defecto, intentar comparación por igualdad o contains para texto
        if (typeof itemValue === "string" && typeof filterValue.value === "string") {
          return itemValue.toLowerCase().includes(filterValue.value.toLowerCase());
        }
        return itemValue === filterValue.value;
    }
  };

  /**
   * Filtra los items según los filtros activos
   */
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Filtrado por búsqueda rápida (barra de búsqueda principal)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => {
        // Buscar en todos los campos de texto configurados
        return filterConfig.fields.some((field) => {
          if (field.type === "text") {
            const value = field.getValue ? field.getValue(item) : item[field.key];
            return value && String(value).toLowerCase().includes(query);
          }
          return false;
        });
      });
    }

    // Aplicar filtros avanzados
    filterConfig.fields.forEach((fieldConfig) => {
      const filterValue = filters[fieldConfig.key];
      if (filterValue) {
        result = result.filter((item) => applyFilter(item, fieldConfig, filterValue));
      }
    });

    // Ordenamiento
    if (sortBy) {
      const sortField = filterConfig.fields.find(f => f.key === sortBy);
      result.sort((a, b) => {
        const aValue = sortField?.getValue ? sortField.getValue(a) : a[sortBy];
        const bValue = sortField?.getValue ? sortField.getValue(b) : b[sortBy];

        // Ordenar según el tipo
        if (typeof aValue === "string" && typeof bValue === "string") {
          return aValue.localeCompare(bValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return aValue - bValue;
        }
        return 0;
      });
    }

    return result;
  }, [items, searchQuery, sortBy, filters, filterConfig]);

  /**
   * Actualiza un filtro específico
   */
  const updateFilter = (key: string, value: any, secondValue?: any, operator?: FilterOperator) => {
    setFilters((prev) => ({
      ...prev,
      [key]: { value, secondValue, operator },
    }));
  };

  /**
   * Limpia todos los filtros
   */
  const clearFilters = () => {
    setFilters({});
  };

  /**
   * Limpia un filtro específico
   */
  const clearFilter = (key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  /**
   * Verifica si hay filtros activos
   */
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (filter) => filter.value !== undefined && filter.value !== null && filter.value !== ""
    );
  }, [filters]);

  return {
    filteredItems,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    clearFilter,
    hasActiveFilters,
  };
}
