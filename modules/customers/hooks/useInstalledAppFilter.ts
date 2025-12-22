import { useMemo, useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { InstalledAppWithEnvironment } from '@/modules/customers/types';
import type { FilterConfig } from '@/modules/customers/types/filters';
import { useGenericFilter } from './useGenericFilter';

// Interfaz para filtros avanzados
export interface InstalledAppAdvancedFilters {
  publisher?: string;
  customerName?: string;
  environmentName?: string;
  environmentType?: string;
  publishedAs?: string;
  hideMicrosoftApps?: boolean;
}

// Configuración de filtros para aplicaciones instaladas
export const installedAppFilterConfig: FilterConfig<InstalledAppWithEnvironment> = {
  fields: [
    {
      key: "name",
      label: "Nombre de la Aplicación",
      type: "text",
      operator: "contains",
      placeholder: "Filtrar por nombre...",
      getValue: (app) => app.name,
    },
    {
      key: "publisher",
      label: "Publisher",
      type: "text",
      operator: "contains",
      placeholder: "Filtrar por publisher...",
      getValue: (app) => app.publisher,
    },
    {
      key: "customerName",
      label: "Cliente",
      type: "text",
      operator: "contains",
      placeholder: "Filtrar por cliente...",
      getValue: (app) => app.customerName,
    },
    {
      key: "environmentName",
      label: "Entorno",
      type: "text",
      operator: "contains",
      placeholder: "Filtrar por entorno...",
      getValue: (app) => app.environmentName,
    },
  ],
};

export function useInstalledAppFilter(installedApps: InstalledAppWithEnvironment[]) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Inicializar filtros avanzados desde URL con valores por defecto
  const getInitialFilters = useCallback((): InstalledAppAdvancedFilters => {
    const hideMicrosoft = searchParams.get('hideMicrosoft');
    return {
      publisher: searchParams.get('filterPublisher') || undefined,
      customerName: searchParams.get('filterCustomer') || undefined,
      environmentName: searchParams.get('filterEnvironment') || undefined,
      environmentType: searchParams.get('filterEnvType') || undefined,
      publishedAs: searchParams.get('filterPublishedAs') || undefined,
      hideMicrosoftApps: hideMicrosoft === null ? true : hideMicrosoft === 'true', // true por defecto
    };
  }, [searchParams]);

  const [advancedFilters, setAdvancedFiltersState] = useState<InstalledAppAdvancedFilters>(getInitialFilters);

  // Sincronizar con URL cuando cambian los filtros
  useEffect(() => {
    const newParams = new URLSearchParams(window.location.search);
    
    // Actualizar parámetros de filtros
    if (advancedFilters.publisher) {
      newParams.set('filterPublisher', advancedFilters.publisher);
    } else {
      newParams.delete('filterPublisher');
    }

    if (advancedFilters.customerName) {
      newParams.set('filterCustomer', advancedFilters.customerName);
    } else {
      newParams.delete('filterCustomer');
    }

    if (advancedFilters.environmentName) {
      newParams.set('filterEnvironment', advancedFilters.environmentName);
    } else {
      newParams.delete('filterEnvironment');
    }

    if (advancedFilters.environmentType) {
      newParams.set('filterEnvType', advancedFilters.environmentType);
    } else {
      newParams.delete('filterEnvType');
    }

    if (advancedFilters.publishedAs) {
      newParams.set('filterPublishedAs', advancedFilters.publishedAs);
    } else {
      newParams.delete('filterPublishedAs');
    }

    // Siempre guardar el estado de hideMicrosoftApps
    newParams.set('hideMicrosoft', String(advancedFilters.hideMicrosoftApps ?? true));

    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    
    // Solo actualizar si la URL realmente cambió
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [advancedFilters, router]);

  // Aplicar filtros avanzados
  const filteredByAdvancedFilters = useMemo(() => {
    let result = [...installedApps];

    // Filtrar apps de Microsoft si está activado
    if (advancedFilters.hideMicrosoftApps) {
      result = result.filter(app => app.publisher.toLowerCase() !== "microsoft");
    }

    if (advancedFilters.publisher) {
      const publishers = advancedFilters.publisher.split(',');
      result = result.filter(app => publishers.includes(app.publisher));
    }

    if (advancedFilters.customerName) {
      const customers = advancedFilters.customerName.split(',');
      result = result.filter(app => customers.includes(app.customerName));
    }

    if (advancedFilters.environmentName) {
      const environments = advancedFilters.environmentName.split(',');
      result = result.filter(app => environments.includes(app.environmentName));
    }

    if (advancedFilters.environmentType) {
      const types = advancedFilters.environmentType.split(',');
      result = result.filter(app => app.environmentType && types.includes(app.environmentType));
    }

    if (advancedFilters.publishedAs) {
      result = result.filter(app => app.publishedAs === advancedFilters.publishedAs);
    }

    return result;
  }, [installedApps, advancedFilters]);

  // Usar el hook genérico para búsqueda
  const {
    filteredItems: filteredApps,
    searchQuery,
    setSearchQuery: setSearchQueryBase,
  } = useGenericFilter(filteredByAdvancedFilters, installedAppFilterConfig, undefined, { syncWithUrl: true });

  // Función para limpiar filtros avanzados (mantiene hideMicrosoftApps)
  const clearAdvancedFilters = useCallback(() => {
    setAdvancedFiltersState({
      hideMicrosoftApps: true,
    });
  }, []);

  // Función para actualizar filtros avanzados
  const updateAdvancedFilters = useCallback((newFilters: InstalledAppAdvancedFilters) => {
    setAdvancedFiltersState(newFilters);
  }, []);

  return {
    filteredApps,
    searchQuery,
    setSearchQuery: setSearchQueryBase,
    advancedFilters,
    updateAdvancedFilters,
    clearAdvancedFilters,
  };
}
