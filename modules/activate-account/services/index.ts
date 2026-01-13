/**
 * Servicios API para el módulo de activación de cuenta
 */

import type { ValidationResponse, SetPasswordResponse } from '../types';

/**
 * Valida el token de activación
 */
export async function validateActivationToken(token: string): Promise<ValidationResponse> {
  const response = await fetch('/api/auth/validate-setup-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (!response.ok || !data.valid) {
    return {
      valid: false,
      error: data.error || 'El enlace de activación no es válido o ha expirado.',
    };
  }

  return {
    valid: true,
    userName: data.userName || 'Usuario',
  };
}

/**
 * Establece la contraseña para activar la cuenta
 */
export async function setPassword(token: string, password: string): Promise<SetPasswordResponse> {
  const response = await fetch('/api/auth/set-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || 'Error al establecer la contraseña',
    };
  }

  return { success: true };
}
