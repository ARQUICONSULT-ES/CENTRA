/**
 * Tipos para el módulo de activación de cuenta
 */

export type PageState = 'loading' | 'invalid' | 'form' | 'success';

export interface ActivateAccountProps {
  token: string | null;
}

export interface ValidationResponse {
  valid: boolean;
  userName?: string;
  error?: string;
}

export interface SetPasswordResponse {
  success: boolean;
  error?: string;
}
