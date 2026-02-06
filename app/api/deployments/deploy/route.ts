import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { deployApplications } from "@/lib/deployment";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutos máximo para despliegues

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener token administrativo de GitHub desde variables de entorno
    const githubToken = process.env.GITHUB_ADMIN_TOKEN;

    if (!githubToken) {
      return NextResponse.json(
        { error: "No se configuró el token administrativo de GitHub (GITHUB_ADMIN_TOKEN)." },
        { status: 500 }
      );
    }

    // Parsear el body
    const body = await request.json();
    const { environmentUrl, authContext, environmentName, applications } = body;

    // Validar parámetros
    if (!environmentUrl || !authContext || !environmentName || !applications || !Array.isArray(applications)) {
      return NextResponse.json(
        { error: "Parámetros inválidos. Se requiere: environmentUrl, authContext, environmentName, applications[]" },
        { status: 400 }
      );
    }

    if (applications.length === 0) {
      return NextResponse.json(
        { error: "Debe proporcionar al menos una aplicación para desplegar" },
        { status: 400 }
      );
    }

    console.log(`\n🚀 Iniciando despliegue de ${applications.length} aplicaciones`);
    console.log(`   Entorno: ${environmentName}`);
    console.log(`   URL: ${environmentUrl}`);

    // Crear un stream para enviar eventos de progreso
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Función callback para enviar progreso
          const sendProgress = (progress: any) => {
            const data = `data: ${JSON.stringify({ type: 'progress', progress })}\n\n`;
            controller.enqueue(encoder.encode(data));
          };

          // Ejecutar el despliegue con callback de progreso
          const result = await deployApplications(
            environmentUrl,
            authContext,
            environmentName,
            applications,
            githubToken,
            sendProgress
          );

          console.log(`\n✅ Despliegue completado: ${result.success}/${result.total} exitosos`);

          // Enviar resultado final
          const finalData = `data: ${JSON.stringify({
            type: 'complete',
            success: result.failed === 0,
            data: result,
          })}\n\n`;
          controller.enqueue(encoder.encode(finalData));

          controller.close();
        } catch (error) {
          console.error("Error en despliegue:", error);
          const errorData = `data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Error desconocido',
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Error en endpoint de despliegue:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
