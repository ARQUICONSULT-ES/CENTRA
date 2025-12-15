/**
 * Utilidades para el módulo de customers/tenants
 */

/**
 * Formatea una fecha a formato relativo (hace X tiempo)
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return "hace unos segundos";
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)} d`;
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 604800)} sem`;
  if (diffInSeconds < 31536000) return `hace ${Math.floor(diffInSeconds / 2592000)} mes`;
  return `hace ${Math.floor(diffInSeconds / 31536000)} año`;
}

/**
 * Valida el nombre de un tenant/customer
 */
export function validateTenantName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "El nombre no puede estar vacío" };
  }

  if (name.length > 50) {
    return { valid: false, error: "El nombre no puede exceder 50 caracteres" };
  }

  return { valid: true };
}

/**
 * Normaliza el nombre del tenant (trim, capitalización)
 */
export function normalizeTenantName(name: string): string {
  return name.trim();
}
