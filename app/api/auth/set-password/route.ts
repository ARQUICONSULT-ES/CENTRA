import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { validatePasswordSetupToken } from "@/lib/password-setup";

/**
 * POST /api/auth/set-password
 * 
 * Establece la contraseña del usuario y activa la cuenta.
 * 
 * Proceso:
 * 1. Valida el token
 * 2. Valida la contraseña (requisitos mínimos)
 * 3. Hashea la contraseña con bcrypt
 * 4. Actualiza usuario y marca token como usado (transacción)
 * 
 * Validaciones de contraseña:
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // Validar campos requeridos
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Contraseña no proporcionada' },
        { status: 400 }
      );
    }

    // Validar requisitos de contraseña
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Validar el token
    const tokenResult = await validatePasswordSetupToken(token);
    
    if (!tokenResult.valid || !tokenResult.userId) {
      return NextResponse.json(
        { error: 'El enlace de activación no es válido o ha expirado. Contacta con tu administrador.' },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Transacción: actualizar usuario y marcar token como usado
    await prisma.$transaction(async (tx) => {
      // 1. Actualizar usuario con la nueva contraseña y activar
      await tx.user.update({
        where: { id: tokenResult.userId },
        data: {
          password: hashedPassword,
          isActive: true,
        },
      });

      // 2. Marcar el token como usado
      await tx.passwordSetupToken.update({
        where: { token },
        data: { usedAt: new Date() },
      });
    });

    console.log(`[SetPassword] Cuenta activada exitosamente para usuario: ${tokenResult.userEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Contraseña establecida correctamente. Ya puedes iniciar sesión.',
    });

  } catch (error) {
    console.error('[SetPassword] Error:', error);
    
    return NextResponse.json(
      { error: 'Error al establecer la contraseña. Por favor, inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}

/**
 * Valida los requisitos de la contraseña
 */
function validatePassword(password: string): { valid: boolean; error?: string } {
  // Mínimo 8 caracteres
  if (password.length < 8) {
    return { 
      valid: false, 
      error: 'La contraseña debe tener al menos 8 caracteres' 
    };
  }

  // Máximo 128 caracteres (prevención de DoS en bcrypt)
  if (password.length > 128) {
    return { 
      valid: false, 
      error: 'La contraseña no puede tener más de 128 caracteres' 
    };
  }

  // Al menos una mayúscula
  if (!/[A-Z]/.test(password)) {
    return { 
      valid: false, 
      error: 'La contraseña debe contener al menos una letra mayúscula' 
    };
  }

  // Al menos una minúscula
  if (!/[a-z]/.test(password)) {
    return { 
      valid: false, 
      error: 'La contraseña debe contener al menos una letra minúscula' 
    };
  }

  // Al menos un número
  if (!/[0-9]/.test(password)) {
    return { 
      valid: false, 
      error: 'La contraseña debe contener al menos un número' 
    };
  }

  return { valid: true };
}
