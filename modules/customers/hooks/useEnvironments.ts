import { useState, useCallback } from "react";
import { fetchEnvironments, syncEnvironments } from "../services/environmentService";
import type { Environment } from "../types";

export function useEnvironments(tenantId: string) {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEnvironments = useCallback(async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchEnvironments(tenantId);
      setEnvironments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar environments");
      console.error("Error loading environments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  const syncEnvironmentsData = useCallback(async () => {
    if (!tenantId) return;
    
    setIsSyncing(true);
    setError(null);
    try {
      const data = await syncEnvironments(tenantId);
      setEnvironments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al sincronizar environments");
      console.error("Error syncing environments:", err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [tenantId]);

  return {
    environments,
    isLoading,
    isSyncing,
    error,
    loadEnvironments,
    syncEnvironmentsData,
  };
}
