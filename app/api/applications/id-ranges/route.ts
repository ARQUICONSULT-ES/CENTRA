import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserPermissions } from "@/lib/auth-permissions";

interface IdRange {
  from: number;
  to: number;
}

interface ApplicationWithRanges {
  id: string;
  name: string;
  publisher: string;
  idRanges: IdRange[];
}

/**
 * GET /api/applications/id-ranges
 * Obtiene las aplicaciones con sus rangos de IDs para el diagrama Gantt
 * Si se especifican customerIds, solo devuelve las apps instaladas en esos clientes
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

    const { searchParams } = new URL(request.url);
    const customerIdsParam = searchParams.get("customerIds");
    const customerIds = customerIdsParam ? customerIdsParam.split("|").filter(Boolean) : [];

    // Si hay filtro de clientes, obtener solo las apps instaladas en esos clientes
    if (customerIds.length > 0) {
      // Obtener todos los IDs de apps instaladas en los entornos de los clientes seleccionados
      const installedApps = await prisma.installedApp.findMany({
        where: {
          environment: {
            tenant: {
              customerId: { in: customerIds },
            },
          },
        },
        select: {
          id: true,
          name: true,
          publisher: true,
        },
        distinct: ["id"],
      });

      // Obtener los IDs únicos de las apps instaladas
      const installedAppIds = [...new Set(installedApps.map((app) => app.id))];

      if (installedAppIds.length === 0) {
        return NextResponse.json({
          applications: [],
          minId: 50000,
          maxId: 99999,
        });
      }

      // Obtener las aplicaciones del catálogo que coinciden con las instaladas
      const applications = await prisma.application.findMany({
        where: {
          id: { in: installedAppIds },
        },
        select: {
          id: true,
          name: true,
          publisher: true,
          idRanges: true,
        },
        orderBy: [
          { publisher: "asc" },
          { name: "asc" },
        ],
      });

      // Transformar y validar los rangos
      const applicationsWithRanges: ApplicationWithRanges[] = applications
        .map((app) => {
          let ranges: IdRange[] = [];
          
          if (app.idRanges) {
            try {
              const rawRanges = app.idRanges as unknown;
              if (Array.isArray(rawRanges)) {
                ranges = rawRanges
                  .filter((r): r is { from: number; to: number } => 
                    typeof r === 'object' && 
                    r !== null && 
                    typeof r.from === 'number' && 
                    typeof r.to === 'number'
                  )
                  .map(r => ({ from: r.from, to: r.to }));
              }
            } catch {
              // Si hay error parseando, dejamos ranges vacío
            }
          }

          return {
            id: app.id,
            name: app.name,
            publisher: app.publisher,
            idRanges: ranges,
          };
        })
        .filter(app => app.idRanges.length > 0);

      return NextResponse.json({
        applications: applicationsWithRanges,
        minId: 50000,
        maxId: 99999,
      });
    }

    // Sin filtro de clientes: devolver todas las aplicaciones del catálogo
    const applications = await prisma.application.findMany({
      select: {
        id: true,
        name: true,
        publisher: true,
        idRanges: true,
      },
      orderBy: [
        { publisher: "asc" },
        { name: "asc" },
      ],
    });

    // Transformar y validar los rangos
    const applicationsWithRanges: ApplicationWithRanges[] = applications
      .map((app) => {
        let ranges: IdRange[] = [];
        
        if (app.idRanges) {
          try {
            // El campo idRanges ya es un objeto JSON de Prisma
            const rawRanges = app.idRanges as unknown;
            if (Array.isArray(rawRanges)) {
              ranges = rawRanges
                .filter((r): r is { from: number; to: number } => 
                  typeof r === 'object' && 
                  r !== null && 
                  typeof r.from === 'number' && 
                  typeof r.to === 'number'
                )
                .map(r => ({ from: r.from, to: r.to }));
            }
          } catch {
            // Si hay error parseando, dejamos ranges vacío
          }
        }

        return {
          id: app.id,
          name: app.name,
          publisher: app.publisher,
          idRanges: ranges,
        };
      })
      .filter(app => app.idRanges.length > 0);

    return NextResponse.json({
      applications: applicationsWithRanges,
      minId: 50000,
      maxId: 99999,
    });
  } catch (error) {
    console.error("Error fetching application id ranges:", error);
    return NextResponse.json(
      { error: "Error al obtener los rangos de IDs" },
      { status: 500 }
    );
  }
}
