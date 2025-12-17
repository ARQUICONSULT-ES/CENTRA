"use client";

import { useState, useEffect } from "react";
import type { Tenant } from "@/modules/customers/types";
import { fetchTenants } from "@/modules/customers/services/tenantService";
import { dataCache, CACHE_KEYS } from "@/modules/shared/utils/cache";

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    // Intentar cargar desde cache al inicializar
    return dataCache.get<Tenant[]>(CACHE_KEYS.TENANTS) || [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    // Si hay datos en cache, no mostrar loading
    return !dataCache.has(CACHE_KEYS.TENANTS);
  });
  const [error, setError] = useState<string | null>(null);

  const fetchTenantsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchTenants();
      setTenants(data);
      // Guardar en cache
      dataCache.set(CACHE_KEYS.TENANTS, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tenants");
      console.error("Error fetching tenants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Solo cargar si no hay datos en cache
    if (!dataCache.has(CACHE_KEYS.TENANTS)) {
      fetchTenantsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    tenants,
    isLoading,
    error,
    fetchTenants: fetchTenantsData,
  };
}
