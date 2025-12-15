import type { Tenant } from "../types";

const API_BASE = "/api/customers";

/**
 * Obtiene todos los tenants
 */
export async function fetchTenants(): Promise<Tenant[]> {
  try {
    const response = await fetch(`${API_BASE}/tenants`);
    
    if (!response.ok) {
      throw new Error('Error al cargar tenants');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching tenants:", error);
    throw error;
  }
}

/**
 * Obtiene un tenant por ID
 */
export async function fetchTenantById(id: string): Promise<Tenant | null> {
  try {
    const response = await fetch(`${API_BASE}/tenants/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Error al cargar tenant');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching tenant:", error);
    throw error;
  }
}

/**
 * Crea un nuevo tenant
 */
export async function createTenant(customerName: string): Promise<Tenant> {
  try {
    const response = await fetch(`${API_BASE}/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerName }),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear tenant');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating tenant:", error);
    throw error;
  }
}

/**
 * Actualiza un tenant existente
 */
export async function updateTenant(
  id: number,
  customerName: string
): Promise<Tenant> {
  try {
    const response = await fetch(`${API_BASE}/tenants/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerName }),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar tenant');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating tenant:", error);
    throw error;
  }
}

/**
 * Elimina un tenant
 */
export async function deleteTenant(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/tenants/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar tenant');
    }
  } catch (error) {
    console.error("Error deleting tenant:", error);
    throw error;
  }
}
