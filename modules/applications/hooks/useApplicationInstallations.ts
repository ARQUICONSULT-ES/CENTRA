"use client";

import { useState, useEffect } from "react";
import type { InstalledAppWithEnvironment } from "@/modules/customers/types";

interface UseApplicationInstallationsReturn {
  installations: InstalledAppWithEnvironment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Carga las imágenes de clientes por separado
 */
async function fetchCustomerImages(): Promise<Map<string, string | null>> {
  try {
    const response = await fetch("/api/customers");
    if (!response.ok) {
      console.warn('No se pudieron cargar las imágenes de clientes');
      return new Map();
    }
    
    const customers = await response.json();
    const imageMap = new Map<string, string | null>();
    
    customers.forEach((customer: any) => {
      imageMap.set(customer.id, customer.imageBase64 || null);
    });
    
    return imageMap;
  } catch (error) {
    console.error("Error fetching customer images:", error);
    return new Map();
  }
}

export function useApplicationInstallations(
  applicationId?: string
): UseApplicationInstallationsReturn {
  const [installations, setInstallations] = useState<InstalledAppWithEnvironment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstallations = async () => {
    if (!applicationId) {
      setInstallations([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Cargar instalaciones e imágenes en paralelo
      const [installationsResponse, customerImages] = await Promise.all([
        fetch(`/api/applications/${applicationId}/installations`),
        fetchCustomerImages()
      ]);

      if (!installationsResponse.ok) {
        throw new Error("Error al cargar las instalaciones");
      }

      const data: InstalledAppWithEnvironment[] = await installationsResponse.json();
      
      // Agregar las imágenes a las instalaciones
      const dataWithImages = data.map(inst => ({
        ...inst,
        customerImage: customerImages.get(inst.customerId) || null
      }));
      
      setInstallations(dataWithImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setInstallations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstallations();
  }, [applicationId]);

  return {
    installations,
    loading,
    error,
    refetch: fetchInstallations,
  };
}
