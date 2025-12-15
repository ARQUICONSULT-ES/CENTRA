"use client";

import { useState, useEffect } from "react";
import type { Tenant } from "../types";

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/customers/tenants');
      
      if (!response.ok) {
        throw new Error('Error al cargar tenants');
      }
      
      const data = await response.json();
      setTenants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tenants");
      console.error("Error fetching tenants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return {
    tenants,
    isLoading,
    error,
    fetchTenants,
  };
}
