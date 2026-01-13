import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { createPasswordSetupToken, DEFAULT_TOKEN_EXPIRATION_HOURS } from "@/lib/password-setup";
import { sendActivationEmail } from "@/lib/email";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/users/[id]/send-activation
 * 
 * Envía (o reenvía) el email de activación de cuenta a un usuario.
 * 
 * Solo disponible para administradores.
 * Crea un nuevo token si el usuario no tiene uno válido, o si se fuerza el reenvío.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id: userId } = await params;

    // Verificar autenticación
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar permisos de admin
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!currentUser || !currentUser.canAccessAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    // Obtener el usuario destino
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        password: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el usuario ya tiene contraseña y está activo
    if (targetUser.isActive && targetUser.password) {
      return NextResponse.json(
        { error: "Este usuario ya tiene una cuenta activa. Usa la función de restablecer contraseña en su lugar." },
        { status: 400 }
      );
    }

    // Crear token de activación
    const { token, expiresAt } = await createPasswordSetupToken(
      targetUser.id,
      DEFAULT_TOKEN_EXPIRATION_HOURS
    );

    // Obtener la URL base del request
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // Enviar email
    const emailResult = await sendActivationEmail({
      to: targetUser.email,
      userName: targetUser.name,
      token,
      expirationHours: DEFAULT_TOKEN_EXPIRATION_HOURS,
      baseUrl, // Pasar la URL base del request
    });

    if (!emailResult.success) {
      console.error(`[SendActivation] Error enviando email a ${targetUser.email}:`, emailResult.error);
      return NextResponse.json(
        { error: "Error al enviar el email de activación. Por favor, inténtalo de nuevo." },
        { status: 500 }
      );
    }

    console.log(`[SendActivation] Email de activación enviado a ${targetUser.email}, expira: ${expiresAt.toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `Email de activación enviado a ${targetUser.email}`,
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('[SendActivation] Error:', error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
