"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Application } from "@/modules/applications/types";

// Interfaz para filtros avanzados
export interface ApplicationAdvancedFilters {
  name?: string;
  publisher?: string;
}

export function useApplicationFilter(applications: Application[]) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Inicializar búsqueda desde URL
  const initialSearchQuery = searchParams.get('search') || '';
  const [searchQuery, setSearchQueryState] = useState(initialSearchQuery);

  // Inicializar filtros avanzados desde URL
  const getInitialFilters = useCallback((): ApplicationAdvancedFilters => {
    return {
      name: searchParams.get('filterName') || undefined,
      publisher: searchParams.get('filterPublisher') || undefined,
    };
  }, [searchParams]);

  const [advancedFilters, setAdvancedFiltersState] = useState<ApplicationAdvancedFilters>(getInitialFilters);

  // Sincronizar con URL cuando cambian los filtros
  useEffect(() => {
    const newParams = new URLSearchParams(window.location.search);
    
    // Actualizar búsqueda
    if (searchQuery) {
      newParams.set('search', searchQuery);
    } else {
      newParams.delete('search');
    }

    // Actualizar parámetros de filtros
    if (advancedFilters.name) {
      newParams.set('filterName', advancedFilters.name);
    } else {
      newParams.delete('filterName');
    }

    if (advancedFilters.publisher) {
      newParams.set('filterPublisher', advancedFilters.publisher);
    } else {
      newParams.delete('filterPublisher');
    }

    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    
    // Solo actualizar si la URL realmente cambió
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [searchQuery, advancedFilters, router]);

  // Función para actualizar la búsqueda
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  // Función para actualizar filtros avanzados
  const updateAdvancedFilters = useCallback((filters: ApplicationAdvancedFilters) => {
    setAdvancedFiltersState(filters);
  }, []);

  // Extraer valores únicos para los filtros
  const uniqueNames = useMemo(() => {
    return Array.from(new Set(applications.map(app => app.name).filter(Boolean))).sort();
  }, [applications]);

  const uniquePublishers = useMemo(() => {
    return Array.from(new Set(applications.map(app => app.publisher).filter(Boolean))).sort();
  }, [applications]);

  // Aplicar filtros
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    // Filtro de búsqueda (global)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(app => 
        app.name.toLowerCase().includes(query) ||
        app.publisher.toLowerCase().includes(query) ||
        app.githubRepoName.toLowerCase().includes(query)
      );
    }

    // Filtros avanzados
    if (advancedFilters.name) {
      const names = advancedFilters.name.split(',');
      result = result.filter(app => names.includes(app.name));
    }

    if (advancedFilters.publisher) {
      const publishers = advancedFilters.publisher.split(',');
      result = result.filter(app => publishers.includes(app.publisher));
    }

    return result;
  }, [applications, searchQuery, advancedFilters]);

  // Función para limpiar filtros avanzados
  const clearAdvancedFilters = useCallback(() => {
    setAdvancedFiltersState({});
  }, []);

  // Función para limpiar todo
  const clearAllFilters = useCallback(() => {
    setSearchQueryState('');
    setAdvancedFiltersState({});
    router.replace(window.location.pathname, { scroll: false });
  }, [router]);

  const hasActiveFilters = searchQuery !== '' || 
    advancedFilters.name !== undefined || 
    advancedFilters.publisher !== undefined;

  return {
    filteredApplications,
    searchQuery,
    setSearchQuery,
    advancedFilters,
    updateAdvancedFilters,
    clearAdvancedFilters,
    clearAllFilters,
    hasActiveFilters,
    uniqueNames,
    uniquePublishers,
  };
}
