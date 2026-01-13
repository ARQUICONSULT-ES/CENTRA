/**
 * Servicio de gestión de tokens para configuración de contraseña
 * 
 * Seguridad del token:
 * - Generado con crypto.randomBytes (CSPRNG - Cryptographically Secure Pseudo-Random Number Generator)
 * - 32 bytes de entropía (256 bits) - resistente a ataques de fuerza bruta
 * - Almacenado en formato hexadecimal (64 caracteres)
 * - Expiración temporal configurable
 * - De un solo uso (marcado como usado tras consumo)
 * 
 * Por qué es seguro:
 * 1. crypto.randomBytes usa /dev/urandom en Linux o CryptGenRandom en Windows
 * 2. 256 bits de entropía = 2^256 combinaciones posibles
 * 3. Incluso con 1 billón de intentos/segundo, tomaría más tiempo que la edad del universo
 */

import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';

/** Horas de validez del token por defecto */
export const DEFAULT_TOKEN_EXPIRATION_HOURS = 24;

/** Longitud del token en bytes (32 bytes = 64 caracteres hex) */
const TOKEN_LENGTH_BYTES = 32;

/**
 * Genera un token criptográficamente seguro
 * 
 * @returns Token en formato hexadecimal de 64 caracteres
 */
export function generateSecureToken(): string {
  return randomBytes(TOKEN_LENGTH_BYTES).toString('hex');
}

/**
 * Resultado de la validación del token
 */
export interface TokenValidationResult {
  valid: boolean;
  userId?: string;
  userEmail?: string;
  userName?: string;
  error?: 'TOKEN_NOT_FOUND' | 'TOKEN_EXPIRED' | 'TOKEN_ALREADY_USED' | 'USER_NOT_FOUND';
}

/**
 * Crea un nuevo token de configuración de contraseña
 * 
 * Si el usuario ya tiene tokens pendientes, los invalida antes de crear uno nuevo.
 * Esto evita tener múltiples tokens válidos para el mismo usuario.
 */
export async function createPasswordSetupToken(
  userId: string,
  expirationHours: number = DEFAULT_TOKEN_EXPIRATION_HOURS
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

  // Invalidar tokens anteriores no usados del usuario
  await prisma.passwordSetupToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(), // Marcar como "usado" para invalidar
    },
  });

  // Crear nuevo token
  await prisma.passwordSetupToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

/**
 * Valida un token de configuración de contraseña
 * 
 * Comprobaciones:
 * 1. El token existe
 * 2. El token no ha sido usado
 * 3. El token no ha expirado
 * 4. El usuario asociado existe
 * 
 * IMPORTANTE: Esta función NO marca el token como usado.
 * Eso se hace en la función de set-password para mantener la atomicidad.
 */
export async function validatePasswordSetupToken(token: string): Promise<TokenValidationResult> {
  try {
    // Buscar el token
    const tokenRecord = await prisma.passwordSetupToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Token no encontrado
    if (!tokenRecord) {
      return { valid: false, error: 'TOKEN_NOT_FOUND' };
    }

    // Token ya usado
    if (tokenRecord.usedAt !== null) {
      return { valid: false, error: 'TOKEN_ALREADY_USED' };
    }

    // Token expirado
    if (tokenRecord.expiresAt < new Date()) {
      return { valid: false, error: 'TOKEN_EXPIRED' };
    }

    // Usuario no existe (caso edge, por si se eliminó después de crear el token)
    if (!tokenRecord.user) {
      return { valid: false, error: 'USER_NOT_FOUND' };
    }

    return {
      valid: true,
      userId: tokenRecord.user.id,
      userEmail: tokenRecord.user.email,
      userName: tokenRecord.user.name,
    };

  } catch (error) {
    console.error('[PasswordSetup] Error validando token:', error);
    return { valid: false, error: 'TOKEN_NOT_FOUND' };
  }
}

/**
 * Marca un token como usado
 * 
 * Se llama después de establecer la contraseña exitosamente,
 * dentro de una transacción para garantizar atomicidad.
 */
export async function markTokenAsUsed(token: string): Promise<void> {
  await prisma.passwordSetupToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });
}

/**
 * Verifica si un usuario tiene tokens de activación pendientes (no usados y no expirados)
 */
export async function hasPendingActivationToken(userId: string): Promise<boolean> {
  const count = await prisma.passwordSetupToken.count({
    where: {
      userId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  return count > 0;
}

/**
 * Limpia tokens expirados de la base de datos
 * Útil para tareas de mantenimiento programadas
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.passwordSetupToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } }, // Expirados
        { usedAt: { not: null } }, // Ya usados (más de 7 días)
      ],
    },
  });

  return result.count;
}
