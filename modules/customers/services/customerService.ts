import type { Customer } from "@/modules/customers/types";
import { dataCache, CACHE_KEYS } from "@/modules/shared/utils/cache";

const API_BASE = "/api/customers";

/**
 * Obtiene todos los customers
 */
export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const response = await fetch(`${API_BASE}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar customers');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
}

/**
 * Obtiene un customer por ID
 */
export async function fetchCustomerById(id: string): Promise<Customer | null> {
  try {
    const response = await fetch(`${API_BASE}/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Error al cargar customer');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw error;
  }
}

/**
 * Crea un nuevo customer
 */
export async function createCustomer(customerName: string): Promise<Customer> {
  try {
    const response = await fetch(`${API_BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerName }),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear customer');
    }
    
    const data = await response.json();
    
    // Invalidar cache después de crear
    dataCache.invalidate(CACHE_KEYS.CUSTOMERS);
    
    return data;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
}

/**
 * Actualiza un customer existente
 */
export async function updateCustomer(
  id: string,
  customerName: string
): Promise<Customer> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerName }),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar customer');
    }
    
    const data = await response.json();
    
    // Invalidar cache después de actualizar
    dataCache.invalidate(CACHE_KEYS.CUSTOMERS);
    
    return data;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
}

/**
 * Elimina un customer
 */
export async function deleteCustomer(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar customer');
    }
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
}
