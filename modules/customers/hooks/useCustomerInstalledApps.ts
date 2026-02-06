import { useState, useEffect, useCallback } from 'react';
import type { InstalledAppWithEnvironment } from '@/modules/customers/types';

interface SyncResult {
  success: number;
  failed: number;
  total: number;
  errors: Array<{ environmentName: string; error: string }>;
}

/**
 * Carga la imagen de un cliente específico
 */
async function fetchCustomerImage(customerId: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/customers/${customerId}`);
    if (!response.ok) {
      console.warn('No se pudo cargar la imagen del cliente');
      return null;
    }
    
    const customer = await response.json();
    return customer.imageBase64 || null;
  } catch (error) {
    console.error("Error fetching customer image:", error);
    return null;
  }
}

export function useCustomerInstalledApps(customerId?: string) {
  const [installedApps, setInstalledApps] = useState<InstalledAppWithEnvironment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInstalledApps = useCallback(async () => {
    if (!customerId) {
      setInstalledApps([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Cargar apps e imagen en paralelo
      const [appsResponse, customerImage] = await Promise.all([
        fetch(`/api/installedapps?customerId=${customerId}`),
        fetchCustomerImage(customerId)
      ]);
      
      if (!appsResponse.ok) {
        throw new Error('Error al cargar las instalaciones');
      }
      
      const apps: InstalledAppWithEnvironment[] = await appsResponse.json();
      
      // Agregar la imagen del cliente a todas las apps
      const appsWithImage = apps.map(app => ({
        ...app,
        customerImage: customerImage
      }));
      
      setInstalledApps(appsWithImage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar instalaciones');
      console.error('Error loading customer installed apps:', err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const reload = useCallback(async () => {
    await loadInstalledApps();
  }, [loadInstalledApps]);

  const syncInstalledApps = useCallback(async (): Promise<SyncResult | null> => {
    if (!customerId) return null;

    try {
      setIsRefreshing(true);
      setError(null);

      const response = await fetch(`/api/installedapps/sync-customer/${customerId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al sincronizar las instalaciones');
      }

      const result: SyncResult = await response.json();
      
      // Recargar los datos después de la sincronización
      await loadInstalledApps();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error syncing customer installed apps:', err);
      throw err;
    } finally {
      setIsRefreshing(false);
    }
  }, [customerId, loadInstalledApps]);

  useEffect(() => {
    if (customerId) {
      loadInstalledApps();
    }
  }, [customerId, loadInstalledApps]);

  return {
    installedApps,
    loading,
    isRefreshing,
    error,
    reload,
    syncInstalledApps,
  };
}
