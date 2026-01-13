import { NextResponse } from "next/server";
import { getUserPermissions } from "@/lib/auth-permissions";

/**
 * GET /api/cron/status
 * Endpoint para verificar la configuración del cron job
 * Solo accesible por administradores
 */
export async function GET() {
  try {
    const permissions = await getUserPermissions();

    if (!permissions.isAuthenticated) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    if (!permissions.canAccessAdmin) {
      return NextResponse.json(
        { error: "Solo administradores pueden acceder a esta información" },
        { status: 403 }
      );
    }

    const status = {
      cronSecretConfigured: !!process.env.CRON_SECRET,
      githubAdminTokenConfigured: !!process.env.GITHUB_ADMIN_TOKEN,
      bcAdminApiUrlConfigured: !!process.env.BC_ADMIN_API_URL,
      databaseUrlConfigured: !!process.env.DATABASE_URL,
      nextAuthSecretConfigured: !!process.env.NEXTAUTH_SECRET,
      vercelEnv: process.env.VERCEL_ENV || 'development',
      nodeEnv: process.env.NODE_ENV || 'development',
      cronJobSchedule: "0 7 * * *",
      cronJobScheduleDescription: "Diariamente a las 7:00 AM UTC",
      cronEndpoint: "/api/cron/sync-all",
      ready: false,
    };

    // Determinar si el cron job está listo para ejecutarse
    status.ready = 
      status.cronSecretConfigured && 
      status.githubAdminTokenConfigured && 
      status.databaseUrlConfigured;

    return NextResponse.json({
      success: true,
      status,
      warnings: getWarnings(status),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking cron status:", error);
    return NextResponse.json(
      {
        error: "Error al verificar el estado del cron job",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

function getWarnings(status: Record<string, any>): string[] {
  const warnings: string[] = [];

  if (!status.cronSecretConfigured) {
    warnings.push("CRON_SECRET no está configurado. El endpoint de cron no podrá ejecutarse.");
  }

  if (!status.githubAdminTokenConfigured) {
    warnings.push("GITHUB_ADMIN_TOKEN no está configurado. No se podrán sincronizar aplicaciones desde GitHub.");
  }

  if (!status.bcAdminApiUrlConfigured) {
    warnings.push("BC_ADMIN_API_URL no está configurado. No se podrán sincronizar datos de Business Central.");
  }

  if (!status.databaseUrlConfigured) {
    warnings.push("DATABASE_URL no está configurado. La aplicación no podrá conectarse a la base de datos.");
  }

  if (!status.nextAuthSecretConfigured) {
    warnings.push("NEXTAUTH_SECRET no está configurado. La autenticación no funcionará correctamente.");
  }

  if (!status.ready) {
    warnings.push("El cron job NO está listo para ejecutarse. Configura las variables de entorno faltantes.");
  }

  return warnings;
}
