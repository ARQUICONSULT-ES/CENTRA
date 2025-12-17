import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/applications
 * Obtiene todas las aplicaciones (extensions) de la base de datos con información del cliente y entorno
 */
export async function GET(request: NextRequest) {
  try {
    const applications = await prisma.extension.findMany({
      include: {
        environment: {
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
          },
        },
      },
      orderBy: [
        { environment: { tenant: { customer: { customerName: "asc" } } } },
        { environmentName: "asc" },
        { name: "asc" },
      ],
    });

    // Transformar los datos para incluir información del cliente y entorno de forma más accesible
    const transformedApplications = applications.map((app) => ({
      tenantId: app.tenantId,
      environmentName: app.environmentName,
      id: app.id,
      name: app.name,
      version: app.version,
      publisher: app.publisher,
      publishedAs: app.publishedAs,
      state: app.state,
      customerId: app.environment.tenant.customer.id,
      customerName: app.environment.tenant.customer.customerName,
      customerImage: app.environment.tenant.customer.imageBase64,
      environmentType: app.environment.type,
      environmentStatus: app.environment.status,
    }));

    return NextResponse.json(transformedApplications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Error al obtener las aplicaciones" },
      { status: 500 }
    );
  }
}
