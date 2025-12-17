import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/environments
 * Obtiene todos los environments de la base de datos con información del cliente
 */
export async function GET(request: NextRequest) {
  try {
    const environments = await prisma.environment.findMany({
      include: {
        tenant: {
          include: {
            customer: {
              select: {
                id: true,
                customerName: true,
                imageBase64: true,
              },
            },
          },
        },
        extensions: {
          where: {
            publisher: {
              not: 'Microsoft',
            },
          },
        },
      },
      orderBy: [
        { tenant: { customer: { customerName: "asc" } } },
        { name: "asc" },
      ],
    });

    // Transformar los datos para incluir información del cliente de forma más accesible
    const transformedEnvironments = environments.map((env) => ({
      tenantId: env.tenantId,
      name: env.name,
      type: env.type,
      status: env.status,
      webClientUrl: env.webClientUrl,
      locationName: env.locationName,
      applicationVersion: env.applicationVersion,
      platformVersion: env.platformVersion,
      customerId: env.tenant.customer.id,
      customerName: env.tenant.customer.customerName,
      customerImage: env.tenant.customer.imageBase64,
      appsCount: env.extensions.length,
    }));

    return NextResponse.json(transformedEnvironments);
  } catch (error) {
    console.error("Error fetching environments:", error);
    return NextResponse.json(
      { error: "Error al obtener los environments" },
      { status: 500 }
    );
  }
}
