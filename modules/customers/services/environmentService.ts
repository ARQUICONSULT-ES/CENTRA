import type { Environment } from "../types";

const API_BASE = "/api/customers";

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
      throw new Error('Error al sincronizar environments');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error syncing environments:", error);
    throw error;
  }
}
