import { useState, useEffect, useCallback } from "react";
import type { DeploymentHistoryItem, DeploymentHistoryFilters } from "../types/history";

export function useDeploymentHistory(filters?: DeploymentHistoryFilters) {
  const [deployments, setDeployments] = useState<DeploymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.customerId) params.append("customerId", filters.customerId);
      if (filters?.tenantId) params.append("tenantId", filters.tenantId);
      if (filters?.environmentName) params.append("environmentName", filters.environmentName);
      if (filters?.applicationId) params.append("applicationId", filters.applicationId);

      const response = await fetch(`/api/deployments/history?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Error al obtener el histórico de deployments");
      }

      const data = await response.json();
      setDeployments(data.deployments);
    } catch (err) {
      console.error("Error fetching deployment history:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDeployments();
  }, [fetchDeployments]);

  return {
    deployments,
    loading,
    error,
    reload: fetchDeployments,
  };
}
