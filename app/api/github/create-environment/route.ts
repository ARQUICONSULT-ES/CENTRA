import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sodium from "libsodium-wrappers";
import { getUserPermissions } from "@/lib/auth-permissions";

/**
 * POST /api/github/create-environment
 * 
 * Crea un GitHub Environment en un repositorio y configura el secret AUTHCONTEXT
 * Documentación: https://docs.github.com/en/rest/deployments/environments?apiVersion=2022-11-28
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner, repo, environmentName, tenantId } = body;

    if (!owner || !repo || !environmentName || !tenantId) {
      return NextResponse.json(
        { error: "Faltan parámetros: owner, repo, environmentName, tenantId" },
        { status: 400 }
      );
    }

    // Verificar permisos del usuario
    const permissions = await getUserPermissions();
    if (!permissions.isAuthenticated || !permissions.userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener el token de GitHub del usuario
    const user = await prisma.user.findUnique({
      where: { id: permissions.userId },
      select: { githubToken: true }
    });

    if (!user?.githubToken) {
      return NextResponse.json(
        { error: "No se encontró token de GitHub. Por favor, vincula tu cuenta de GitHub en la configuración." },
        { status: 401 }
      );
    }

    const token = user.githubToken;

    // Crear el entorno en GitHub (sin protection rules)
    const githubResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/environments/${encodeURIComponent(environmentName)}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!githubResponse.ok) {
      const errorData = await githubResponse.json();
      console.error("Error al crear entorno en GitHub:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Error al crear el entorno en GitHub" },
        { status: githubResponse.status }
      );
    }

    const data = await githubResponse.json();

    // Obtener el authContext del tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { authContext: true },
    });

    if (!tenant?.authContext) {
      console.warn(`Tenant ${tenantId} no tiene authContext configurado`);
      return NextResponse.json({
        ...data,
        warning: "Entorno creado pero sin AUTHCONTEXT configurado en el tenant"
      });
    }

    // Crear el secret AUTHCONTEXT en el environment
    // Documentación: https://docs.github.com/en/rest/actions/secrets?apiVersion=2022-11-28#create-or-update-an-environment-secret
    try {
      // Paso 1: Obtener la public key del repositorio
      const publicKeyResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/environments/${encodeURIComponent(environmentName)}/secrets/public-key`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      if (!publicKeyResponse.ok) {
        const errorData = await publicKeyResponse.json();
        console.error("Error al obtener public key:", errorData);
        return NextResponse.json({
          ...data,
          warning: "Entorno creado pero no se pudo obtener la public key para crear el secret"
        });
      }

      const { key, key_id } = await publicKeyResponse.json();

      // Paso 2: Encriptar el valor del secret usando libsodium
      await sodium.ready;
      const binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
      const binsec = sodium.from_string(tenant.authContext);
      const encBytes = sodium.crypto_box_seal(binsec, binkey);
      const encrypted_value = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);

      // Paso 3: Crear el secret
      const secretResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/environments/${encodeURIComponent(environmentName)}/secrets/AUTHCONTEXT`,
        {
          method: "PUT",
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            encrypted_value,
            key_id,
          }),
        }
      );

      if (!secretResponse.ok) {
        const errorData = await secretResponse.json();
        console.error("Error al crear secret AUTHCONTEXT:", errorData);
        return NextResponse.json({
          ...data,
          warning: "Entorno creado pero no se pudo crear el secret AUTHCONTEXT"
        });
      }

      console.log(`Secret AUTHCONTEXT creado exitosamente para ${environmentName}`);
    } catch (secretError) {
      console.error("Error al crear el secret:", secretError);
      return NextResponse.json({
        ...data,
        warning: "Entorno creado pero hubo un error al crear el secret AUTHCONTEXT"
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en POST /api/github/create-environment:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
