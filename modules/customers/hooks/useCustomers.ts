import { useState, useEffect, useCallback } from "react";
import type { Customer } from "../types";
import { fetchCustomers } from "../services/customerService";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Error loading customers:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refreshCustomers = useCallback(async () => {
    await loadCustomers(true);
  }, [loadCustomers]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return {
    customers,
    isLoading,
    isRefreshing,
    error,
    refreshCustomers,
  };
}
