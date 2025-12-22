import { useMemo, useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { EnvironmentWithCustomer } from '@/modules/customers/types';
import type { FilterConfig } from '@/modules/customers/types/filters';
import { useGenericFilter } from './useGenericFilter';

type SortBy = 'name' | 'customer' | 'type';

// Interfaz para filtros avanzados
export interface EnvironmentAdvancedFilters {
  status?: string;
  type?: string;
  customer?: string;
  platformVersion?: string;
  applicationVersion?: string;
}

// Configuración de filtros para entornos
export const environmentFilterConfig: FilterConfig<EnvironmentWithCustomer> = {
  fields: [
    {
      key: "name",
      label: "Nombre del Entorno",
      type: "text",
      operator: "contains",
      placeholder: "Filtrar por nombre...",
      getValue: (env) => env.name,
    },
    {
      key: "customerName",
      label: "Cliente",
      type: "text",
      operator: "contains",
      placeholder: "Filtrar por cliente...",
      getValue: (env) => env.customerName,
    },
    {
      key: "type",
      label: "Tipo",
      type: "text",
      operator: "contains",
      placeholder: "Filtrar por tipo...",
      getValue: (env) => env.type || '',
    },
  ],
};

export function useEnvironmentFilter(environments: EnvironmentWithCustomer[]) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Inicializar filtros avanzados desde URL con valores por defecto
  const getInitialFilters = useCallback((): EnvironmentAdvancedFilters => {
    return {
      type: searchParams.get('filterType') || undefined,
      status: searchParams.get('filterStatus') || 'Active',
      customer: searchParams.get('filterCustomer') || undefined,
      platformVersion: searchParams.get('filterPlatformVersion') || undefined,
      applicationVersion: searchParams.get('filterApplicationVersion') || undefined,
    };
  }, [searchParams]);

  const [advancedFilters, setAdvancedFiltersState] = useState<EnvironmentAdvancedFilters>(getInitialFilters);

  // Sincronizar con URL cuando cambian los filtros
  useEffect(() => {
    const newParams = new URLSearchParams(window.location.search);
    
    // Actualizar parámetros de filtros - siempre setear si hay valor, eliminar si no hay
    if (advancedFilters.type) {
      newParams.set('filterType', advancedFilters.type);
    } else {
      newParams.delete('filterType');
    }

    if (advancedFilters.status) {
      newParams.set('filterStatus', advancedFilters.status);
    } else {
      newParams.delete('filterStatus');
    }

    if (advancedFilters.customer) {
      newParams.set('filterCustomer', advancedFilters.customer);
    } else {
      newParams.delete('filterCustomer');
    }

    if (advancedFilters.platformVersion) {
      newParams.set('filterPlatformVersion', advancedFilters.platformVersion);
    } else {
      newParams.delete('filterPlatformVersion');
    }

    if (advancedFilters.applicationVersion) {
      newParams.set('filterApplicationVersion', advancedFilters.applicationVersion);
    } else {
      newParams.delete('filterApplicationVersion');
    }

    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    
    // Solo actualizar si la URL realmente cambió
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [advancedFilters, router]);

  // Aplicar filtros avanzados
  const filteredByAdvancedFilters = useMemo(() => {
    let result = [...environments];

    // Si hay un filtro de estado específico, aplicarlo
    if (advancedFilters.status) {
      result = result.filter(env => env.status === advancedFilters.status);
    } else {
      // Si no hay filtro de estado, excluir softdeleted por defecto
      result = result.filter(env => env.status?.toLowerCase() !== 'softdeleted');
    }

    if (advancedFilters.type) {
      result = result.filter(env => env.type === advancedFilters.type);
    }

    if (advancedFilters.customer) {
      result = result.filter(env => env.customerName === advancedFilters.customer);
    }

    if (advancedFilters.platformVersion) {
      result = result.filter(env => env.platformVersion === advancedFilters.platformVersion);
    }

    if (advancedFilters.applicationVersion) {
      result = result.filter(env => env.applicationVersion === advancedFilters.applicationVersion);
    }

    return result;
  }, [environments, advancedFilters]);

  // Ordenar: Production primero, luego el resto
  const sortedByType = useMemo(() => {
    return [...filteredByAdvancedFilters].sort((a, b) => {
      const aIsProduction = a.type?.toLowerCase() === 'production';
      const bIsProduction = b.type?.toLowerCase() === 'production';
      
      if (aIsProduction && !bIsProduction) return -1;
      if (!aIsProduction && bIsProduction) return 1;
      return 0;
    });
  }, [filteredByAdvancedFilters]);

  // Usar el hook genérico para búsqueda y ordenación
  const {
    filteredItems: filteredEnvironments,
    searchQuery,
    setSearchQuery: setSearchQueryBase,
    sortBy,
    setSortBy: setSortByBase,
  } = useGenericFilter(sortedByType, environmentFilterConfig, 'customer', { syncWithUrl: true });

  // Función para limpiar filtros avanzados (volver a valores por defecto)
  const clearAdvancedFilters = useCallback(() => {
    setAdvancedFiltersState({
      status: 'Active',
    });
  }, []);

  // Función para actualizar filtros avanzados
  const updateAdvancedFilters = useCallback((newFilters: EnvironmentAdvancedFilters) => {
    setAdvancedFiltersState(newFilters);
  }, []);

  return {
    filteredEnvironments,
    searchQuery,
    setSearchQuery: setSearchQueryBase,
    sortBy: sortBy as SortBy,
    setSortBy: setSortByBase as (value: SortBy) => void,
    advancedFilters,
    updateAdvancedFilters,
    clearAdvancedFilters,
  };
}
