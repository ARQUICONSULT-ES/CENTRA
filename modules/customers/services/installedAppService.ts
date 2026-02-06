import type { InstalledAppWithEnvironment } from "@/modules/customers/types";
import { dataCache, CACHE_KEYS } from "@/modules/shared/utils/cache";

/**
 * Obtiene las imágenes de todos los clientes
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

/**
 * Obtiene todas las aplicaciones instaladas de todos los entornos desde la base de datos
 * Carga las imágenes de clientes por separado para optimizar el tamaño de la respuesta
 */
export async function fetchAllInstalledApps(): Promise<InstalledAppWithEnvironment[]> {
  try {
    // Cargar apps e imágenes en paralelo
    const [appsResponse, customerImages] = await Promise.all([
      fetch("/api/installedapps"),
      fetchCustomerImages()
    ]);
    
    if (!appsResponse.ok) {
      throw new Error('Error al cargar instalaciones');
    }
    
    const apps: InstalledAppWithEnvironment[] = await appsResponse.json();
    
    // Agregar las imágenes a las apps
    const appsWithImages = apps.map(app => ({
      ...app,
      customerImage: customerImages.get(app.customerId) || null
    }));
    
    return appsWithImages;
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

/**
 * Sincroniza las aplicaciones instaladas de un entorno específico con Business Central
 */
export async function syncEnvironmentInstalledApps(
  tenantId: string,
  environmentName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/installedapps/sync-environment", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tenantId, environmentName }),
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
    console.error("Error syncing environment installed apps:", error);
    throw error;
  }
}
