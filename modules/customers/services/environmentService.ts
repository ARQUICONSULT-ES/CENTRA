import type { Environment, EnvironmentWithCustomer } from "@/modules/customers/types";
import { dataCache, CACHE_KEYS } from "@/modules/shared/utils/cache";

const API_BASE = "/api/customers";

/**
 * Obtiene todos los environments de la base de datos
 */
export async function fetchAllEnvironments(): Promise<EnvironmentWithCustomer[]> {
  try {
    const response = await fetch("/api/environments");
    
    if (!response.ok) {
      throw new Error('Error al cargar environments');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all environments:", error);
    throw error;
  }
}

/**
 * Obtiene todos los environments de un tenant desde Business Central
 */
export async function fetchEnvironments(tenantId: string): Promise<Environment[]> {
  try {
    const response = await fetch(`${API_BASE}/tenants/${tenantId}/environments`);
    
    if (!response.ok) {
      throw new Error('Error al cargar environments');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching environments:", error);
    throw error;
  }
}

/**
 * Sincroniza los environments de un tenant con la base de datos local
 */
export async function syncEnvironments(tenantId: string): Promise<Environment[]> {
  try {
    const response = await fetch(`${API_BASE}/tenants/${tenantId}/environments/sync`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      // Intentar obtener el mensaje de error del servidor
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error syncing environments:", error);
    throw error;
  }
}

/**
 * Sincroniza los environments de todos los tenants con Business Central
 */
export async function syncAllEnvironments(): Promise<{
  success: number;
  failed: number;
  total: number;
  errors: Array<{ tenantId: string; customerName: string; error: string }>;
}> {
  try {
    const response = await fetch("/api/environments/sync-all", {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // Invalidar cache después de sincronizar
    dataCache.invalidate(CACHE_KEYS.ENVIRONMENTS);
    dataCache.invalidate(CACHE_KEYS.TENANTS);
    
    return data;
  } catch (error) {
    console.error("Error syncing all environments:", error);
    throw error;
  }
}
