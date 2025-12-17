import type { Tenant } from "@/modules/customers/types";

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
  id: string,
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
export async function deleteTenant(id: string): Promise<void> {
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

/**
 * Refresca el token de autenticación de un tenant
 */
export async function refreshTenantToken(id: string): Promise<{
  success?: boolean;
  token?: string;
  tokenExpiresAt: string | Date;
  expiresIn?: number;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/tenants/${id}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Error de red o respuesta inválida" }));
      
      // Construir mensaje de error más detallado
      let errorMessage = "Error al refrescar el token";
      
      if (errorData.details) {
        if (typeof errorData.details === 'string') {
          errorMessage = errorData.details;
        } else if (errorData.details.error_description) {
          errorMessage = errorData.details.error_description;
        } else if (errorData.details.error) {
          errorMessage = errorData.details.error;
        }
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
      
      if (errorData.missingFields) {
        errorMessage += `. Faltan campos: ${errorData.missingFields.join(', ')}`;
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
}
