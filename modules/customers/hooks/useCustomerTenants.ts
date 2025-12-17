"use client";

import { useState, useEffect } from "react";
import type { Tenant } from "@/modules/customers/types";

export function useCustomerTenants(customerId?: string) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerTenants = async () => {
    if (!customerId) {
      setTenants([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      
      if (!response.ok) {
        throw new Error("Error al cargar los tenants del cliente");
      }
      
      const data = await response.json();
      setTenants(data.tenants || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tenants");
      console.error("Error fetching customer tenants:", err);
      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerTenants();
  }, [customerId]);

  return {
    tenants,
    isLoading,
    error,
    refetch: fetchCustomerTenants,
  };
}
