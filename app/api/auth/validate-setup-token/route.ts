import { NextResponse } from "next/server";
import { validatePasswordSetupToken } from "@/lib/password-setup";

/**
 * POST /api/auth/validate-setup-token
 * 
 * Valida un token de configuración de contraseña.
 * 
 * Seguridad:
 * - NO filtra información específica sobre el estado del token
 * - Devuelve un error genérico para evitar enumeración
 * - Solo devuelve el nombre del usuario para personalizar el formulario
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    // Validar que se proporcionó un token
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'El enlace de activación no es válido o ha expirado.' 
        },
        { status: 400 }
      );
    }

    // Validar el token
    const result = await validatePasswordSetupToken(token);

    if (!result.valid) {
      // Error genérico para no filtrar información
      // No revelamos si el token existe, está usado o expirado
      console.log(`[ValidateToken] Token inválido: ${result.error}`);
      
      return NextResponse.json(
        { 
          valid: false, 
          error: 'El enlace de activación no es válido o ha expirado. Contacta con tu administrador para solicitar uno nuevo.' 
        },
        { status: 400 }
      );
    }

    // Token válido - devolver info mínima para el frontend
    return NextResponse.json({
      valid: true,
      userName: result.userName,
    });

  } catch (error) {
    console.error('[ValidateToken] Error:', error);
    
    return NextResponse.json(
      { 
        valid: false, 
        error: 'Error al validar el enlace. Por favor, inténtalo de nuevo.' 
      },
      { status: 500 }
    );
  }
}
