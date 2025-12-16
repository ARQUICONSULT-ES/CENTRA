import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Obtener el tenant de la base de datos
    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant no encontrado" },
        { status: 404 }
      );
    }

    // Validar que el tenant tenga la configuración necesaria
    if (!tenant.grantType || !tenant.clientId || !tenant.clientSecret || !tenant.scope) {
      return NextResponse.json(
        { error: "El tenant no tiene configuración de autenticación completa" },
        { status: 400 }
      );
    }

    // Construir la URL de autenticación usando el ID del tenant como Tenant ID de Azure
    const authUrl = `https://login.microsoftonline.com/${tenant.id}/oauth2/v2.0/token`;

    // Realizar la petición de autenticación
    const authRes = await fetch(authUrl, {
      method: "POST",
      body: new URLSearchParams({
        grant_type: tenant.grantType,
        client_id: tenant.clientId,
        client_secret: tenant.clientSecret,
        scope: tenant.scope,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!authRes.ok) {
      const errorData = await authRes.json();
      console.error("Error en autenticación:", errorData);
      return NextResponse.json(
        { error: "Error al obtener el token de Business Central", details: errorData },
        { status: authRes.status }
      );
    }

    // Parsear la respuesta
    const authData = await authRes.json();
    const accessToken = authData.access_token;
    const expiresIn = authData.expires_in; // segundos

    if (!accessToken) {
      return NextResponse.json(
        { error: "No se recibió token de acceso" },
        { status: 500 }
      );
    }

    // Calcular la fecha de expiración
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // Actualizar el tenant con el nuevo token
    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: {
        token: accessToken,
        tokenExpiresAt: tokenExpiresAt,
      },
    });

    return NextResponse.json({
      message: "Token refrescado exitosamente",
      tokenExpiresAt: updatedTenant.tokenExpiresAt,
    });
  } catch (error) {
    console.error("Error al refrescar token:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
