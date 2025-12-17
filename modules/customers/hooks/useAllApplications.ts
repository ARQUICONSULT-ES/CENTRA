import { useState, useEffect, useCallback } from 'react';
import { fetchAllApplications } from '../services/applicationService';
import type { ApplicationWithEnvironment } from '../types';

export function useAllApplications() {
  const [applications, setApplications] = useState<ApplicationWithEnvironment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await fetchAllApplications();
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar aplicaciones');
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const reload = useCallback(async () => {
    await loadApplications(true);
  }, [loadApplications]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return {
    applications,
    loading,
    isRefreshing,
    error,
    reload,
  };
}
