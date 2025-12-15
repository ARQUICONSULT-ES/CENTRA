"use client";

import { useState, useEffect } from "react";
import type { Tenant } from "../types";
import { fetchTenants } from "../services/tenantService";

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenantsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchTenants();
      setTenants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tenants");
      console.error("Error fetching tenants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantsData();
  }, []);

  return {
    tenants,
    isLoading,
    error,
    fetchTenants: fetchTenantsData,
  };
}
