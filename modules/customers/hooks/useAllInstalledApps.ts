import { useState, useEffect, useCallback } from 'react';
import { fetchAllInstalledApps } from '@/modules/customers/services/installedAppService';
import type { InstalledAppWithEnvironment } from '@/modules/customers/types';
import { dataCache, CACHE_KEYS } from '@/modules/shared/utils/cache';

export function useAllInstalledApps() {
  const [installedApps, setInstalledApps] = useState<InstalledAppWithEnvironment[]>(() => {
    // Intentar cargar desde cache al inicializar
    return dataCache.get<InstalledAppWithEnvironment[]>(CACHE_KEYS.INSTALLED_APPS) || [];
  });
  const [loading, setLoading] = useState(() => {
    // Si hay datos en cache, no mostrar loading
    return !dataCache.has(CACHE_KEYS.INSTALLED_APPS);
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInstalledApps = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await fetchAllInstalledApps();
      setInstalledApps(data);
      // Guardar en cache
      dataCache.set(CACHE_KEYS.INSTALLED_APPS, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar aplicaciones instaladas');
      console.error('Error loading installed apps:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const reload = useCallback(async () => {
    await loadInstalledApps(true);
  }, [loadInstalledApps]);

  useEffect(() => {
    // Solo cargar si no hay datos en cache
    if (!dataCache.has(CACHE_KEYS.INSTALLED_APPS)) {
      loadInstalledApps();
    }
  }, [loadInstalledApps]);

  return {
    installedApps,
    loading,
    isRefreshing,
    error,
    reload,
  };
}
