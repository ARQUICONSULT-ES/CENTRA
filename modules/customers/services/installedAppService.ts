import type { InstalledAppWithEnvironment } from "@/modules/customers/types";
import { dataCache, CACHE_KEYS } from "@/modules/shared/utils/cache";

/**
 * Obtiene todas las aplicaciones instaladas de todos los entornos desde la base de datos
 */
export async function fetchAllInstalledApps(): Promise<InstalledAppWithEnvironment[]> {
  try {
    const response = await fetch("/api/installedapps");
    
    if (!response.ok) {
      throw new Error('Error al cargar aplicaciones instaladas');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all installed apps:", error);
    throw error;
  }
}

/**
 * Sincroniza las aplicaciones instaladas de todos los entornos con Business Central
 */
export async function syncAllInstalledApps(): Promise<{
  success: number;
  failed: number;
  total: number;
  errors: Array<{ 
    tenantId: string; 
    environmentName: string;
    customerName: string; 
    error: string 
  }>;
}> {
  try {
    const response = await fetch("/api/installedapps/sync-all", {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // Invalidar cache después de sincronizar
    dataCache.invalidate(CACHE_KEYS.INSTALLED_APPS);
    
    return data;
  } catch (error) {
    console.error("Error syncing all installed apps:", error);
    throw error;
  }
}
