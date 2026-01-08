import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserPermissions } from "@/lib/auth-permissions";
import { countOutdatedInstallations } from "@/modules/applications/utils/versionComparison";

/**
 * GET /api/applications
 * Obtiene todas las aplicaciones del catálogo (tabla Application)
 * Enriquece con contadores de instalaciones totales y obsoletas
 */
export async function GET(request: NextRequest) {
  try {
    const permissions = await getUserPermissions();

    if (!permissions.isAuthenticated) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener aplicaciones
    const applications = await prisma.application.findMany({
      orderBy: [
        { publisher: "asc" },
        { name: "asc" },
      ],
    });

    // Enriquecer con contadores de instalaciones
    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        // Obtener todas las instalaciones de esta aplicación
        const installations = await prisma.installedApp.findMany({
          where: { id: app.id },
          select: { 
            version: true,
            environment: {
              select: {
                tenant: {
                  select: {
                    customerId: true
                  }
                }
              }
            }
          },
        });

        const totalInstallations = installations.length;
        const outdatedInstallations = countOutdatedInstallations(
          app.latestReleaseVersion,
          installations
        );

        // Contar clientes únicos
        const uniqueCustomerIds = new Set(
          installations.map(inst => inst.environment.tenant.customerId)
        );
        const totalCustomers = uniqueCustomerIds.size;

        return {
          ...app,
          totalInstallations,
          outdatedInstallations,
          totalCustomers,
        };
      })
    );

    return NextResponse.json(enrichedApplications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Error al obtener las aplicaciones" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications
 * Crea una nueva aplicación en el catálogo
 */
export async function POST(request: NextRequest) {
  try {
    const permissions = await getUserPermissions();

    if (!permissions.isAuthenticated) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, publisher, githubRepoName } = body;

    if (!name || !publisher || !githubRepoName) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: name, publisher, githubRepoName" },
        { status: 400 }
      );
    }

    // Generar un ID UUID para la nueva aplicación
    const newApplication = await prisma.application.create({
      data: {
        id: crypto.randomUUID(),
        name,
        publisher,
        githubRepoName,
      },
    });

    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Error al crear la aplicación" },
      { status: 500 }
    );
  }
}
