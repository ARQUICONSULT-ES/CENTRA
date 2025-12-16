import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { BCEnvironmentsResponse, BCEnvironment } from "@/modules/customers/types";

/**
 * POST /api/customers/tenants/[id]/environments/sync
 * Sincroniza los environments de Business Central con la base de datos local
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Obtener el tenant de la base de datos
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: {
        id: true,
        token: true,
        tokenExpiresAt: true,
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que existe el token
    if (!tenant.token) {
      return NextResponse.json(
        { error: "El tenant no tiene un token de autenticación configurado" },
        { status: 400 }
      );
    }

    // Verificar si el token ha expirado
    if (tenant.tokenExpiresAt && new Date(tenant.tokenExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: "El token ha expirado. Por favor, renueve la autenticación" },
        { status: 401 }
      );
    }

    // Llamar a la API de Business Central
    const bcApiUrl = process.env.BC_ADMIN_API_URL || "https://api.businesscentral.dynamics.com/admin/v2.28/applications";
    const url = `${bcApiUrl}/environments`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tenant.token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from BC API:", errorText);
      return NextResponse.json(
        { error: `Error al obtener environments: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data: BCEnvironmentsResponse = await response.json();

    // Sincronizar con la base de datos usando transacción
    const syncedEnvironments = await prisma.$transaction(async (tx) => {
      // Eliminar environments existentes del tenant
      await tx.environment.deleteMany({
        where: { tenantId: tenant.id },
      });

      // Crear los nuevos environments
      const environments = await Promise.all(
        data.value.map((bcEnv: BCEnvironment) =>
          tx.environment.create({
            data: {
              tenantId: tenant.id,
              name: bcEnv.name,
              type: bcEnv.type,
              applicationVersion: bcEnv.applicationVersion,
              status: bcEnv.status,
              webClientUrl: bcEnv.webClientLoginUrl,
              locationName: bcEnv.locationName || null,
              platformVersion: bcEnv.platformVersion || null,
            },
          })
        )
      );

      return environments;
    });

    return NextResponse.json(syncedEnvironments);
  } catch (error) {
    console.error("Error syncing environments:", error);
    return NextResponse.json(
      { error: "Error al sincronizar environments" },
      { status: 500 }
    );
  }
}
