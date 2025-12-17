import { useState, useEffect, useCallback } from "react";
import type { Customer } from "@/modules/customers/types";
import { fetchCustomers } from "@/modules/customers/services/customerService";
import { dataCache, CACHE_KEYS } from "@/modules/shared/utils/cache";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    // Intentar cargar desde cache al inicializar
    return dataCache.get<Customer[]>(CACHE_KEYS.CUSTOMERS) || [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    // Si hay datos en cache, no mostrar loading
    return !dataCache.has(CACHE_KEYS.CUSTOMERS);
  });
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
      // Guardar en cache
      dataCache.set(CACHE_KEYS.CUSTOMERS, data);
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
    // Solo cargar si no hay datos en cache
    if (!dataCache.has(CACHE_KEYS.CUSTOMERS)) {
      loadCustomers();
    }
  }, [loadCustomers]);

  return {
    customers,
    isLoading,
    isRefreshing,
    error,
    refreshCustomers,
  };
}
