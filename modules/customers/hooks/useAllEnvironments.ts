import { useState, useEffect, useCallback } from 'react';
import { fetchAllEnvironments } from '@/modules/customers/services/environmentService';
import type { EnvironmentWithCustomer } from '@/modules/customers/types';
import { dataCache, CACHE_KEYS } from '@/modules/shared/utils/cache';

export function useAllEnvironments() {
  const [environments, setEnvironments] = useState<EnvironmentWithCustomer[]>(() => {
    // Intentar cargar desde cache al inicializar
    return dataCache.get<EnvironmentWithCustomer[]>(CACHE_KEYS.ENVIRONMENTS) || [];
  });
  const [loading, setLoading] = useState(() => {
    // Si hay datos en cache, no mostrar loading
    return !dataCache.has(CACHE_KEYS.ENVIRONMENTS);
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEnvironments = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await fetchAllEnvironments();
      setEnvironments(data);
      // Guardar en cache
      dataCache.set(CACHE_KEYS.ENVIRONMENTS, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar environments');
      console.error('Error loading environments:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const reload = useCallback(async () => {
    await loadEnvironments(true);
  }, [loadEnvironments]);

  useEffect(() => {
    // Solo cargar si no hay datos en cache
    if (!dataCache.has(CACHE_KEYS.ENVIRONMENTS)) {
      loadEnvironments();
    }
  }, [loadEnvironments]);

  return {
    environments,
    loading,
    isRefreshing,
    error,
    reload,
  };
}
