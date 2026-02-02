// Automation API requiere Access Token de OAuth, no authContext en query string

/**
 * Obtiene un Access Token usando el Refresh Token del AuthContext
 */
async function getAccessTokenFromRefreshToken(
  tenantId: string,
  clientId: string,
  refreshToken: string,
  scopes: string
): Promise<{ accessToken: string; error?: string } | null> {
  try {
    const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    
    const body = new URLSearchParams({
      client_id: clientId,
      scope: scopes,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    console.log(`Obteniendo Access Token de Azure AD...`);
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error obteniendo token: ${response.status}`, errorText);
      return null;
    }

    const tokenData = await response.json();
    return { accessToken: tokenData.access_token };
  } catch (error) {
    console.error('Error en getAccessTokenFromRefreshToken:', error);
    return null;
  }
}

/**
 * Instala una aplicación en Business Central mediante la Automation API
 * Basado en BcContainerHelper: Publish-PerTenantExtensionApps
 * Flujo:
 * 1. GET /companies - obtener ID de company
 * 2. GET /extensions - ver extensiones instaladas
 * 3. POST/PATCH /extensionUpload - crear/actualizar upload entity
 * 4. PATCH extensionContent@odata.mediaEditLink - subir archivo .app
 * 5. POST /extensionUpload({id})/Microsoft.NAV.upload - triggear instalación
 * 6. GET /extensionDeploymentStatus - poll hasta completar
 */
async function installAppInBC(
  environmentUrl: string,
  authContext: string,
  appInfo: {
    id: string;
    name: string;
    publisher: string;
    version: string;
  },
  appBuffer: Buffer,
  installMode: 'Add' | 'ForceSync' = 'Add'
): Promise<{ success: boolean; error?: string; operationId?: string }> {
  try {
    console.log(`Instalando app: ${appInfo.publisher}_${appInfo.name}_${appInfo.version}`);
    console.log(`Entorno URL: ${environmentUrl}`);
    
    // Parsear el authContext para obtener los datos de OAuth
    let authContextObj;
    try {
      authContextObj = typeof authContext === 'string' ? JSON.parse(authContext) : authContext;
    } catch (e) {
      return {
        success: false,
        error: 'AuthContext inválido: no es un JSON válido'
      };
    }

    // Validar que tenga los campos necesarios
    if (!authContextObj.TenantID || !authContextObj.ClientID || !authContextObj.RefreshToken) {
      return {
        success: false,
        error: 'AuthContext incompleto: falta TenantID, ClientID o RefreshToken'
      };
    }

    // Obtener Access Token usando el Refresh Token
    let scopes = authContextObj.Scopes || 'https://api.businesscentral.dynamics.com/.default';
    
    // Corregir el scope si no termina con /.default
    if (scopes.endsWith('/') && !scopes.endsWith('/.default')) {
      scopes = scopes + '.default';
    } else if (!scopes.includes('/.default')) {
      scopes = scopes + '/.default';
    }
    
    const tokenResult = await getAccessTokenFromRefreshToken(
      authContextObj.TenantID,
      authContextObj.ClientID,
      authContextObj.RefreshToken,
      scopes
    );

    if (!tokenResult || !tokenResult.accessToken) {
      return {
        success: false,
        error: 'No se pudo obtener Access Token de Azure AD. Verifica que el RefreshToken sea válido.'
      };
    }

    console.log('✓ Access Token obtenido exitosamente');
    
    // Extraer el nombre del entorno de la URL
    const environmentNameMatch = environmentUrl.match(/\/([^\/]+)$/);
    const environmentName = environmentNameMatch ? environmentNameMatch[1] : 'Production';
    
    console.log(`Nombre del entorno: ${environmentName}`);
    
    // Automation API URL (igual que BcContainerHelper)
    const automationApiUrl = `https://api.businesscentral.dynamics.com/v2.0/${environmentName}/api/microsoft/automation/v2.0`;
    
    const authHeaders = {
      'Authorization': `Bearer ${tokenResult.accessToken}`
    };
    
    // Paso 1: Obtener Company ID
    console.log('Paso 1: Obteniendo Company...');
    const companiesRes = await fetch(`${automationApiUrl}/companies`, {
      method: 'GET',
      headers: authHeaders
    });
    
    if (!companiesRes.ok) {
      const errorText = await companiesRes.text();
      return {
        success: false,
        error: `Error obteniendo companies: ${companiesRes.status} ${errorText}`
      };
    }
    
    const companiesData = await companiesRes.json();
    const company = companiesData.value?.[0];
    
    if (!company || !company.id) {
      return {
        success: false,
        error: 'No se encontró una company en el entorno'
      };
    }
    
    const companyId = company.id;
    console.log(`✓ Company: ${company.name} (${companyId})`);
    
    // Paso 2: Obtener extensiones actuales
    console.log('Paso 2: Obteniendo extensiones instaladas...');
    const extensionsRes = await fetch(`${automationApiUrl}/companies(${companyId})/extensions`, {
      method: 'GET',
      headers: authHeaders
    });
    
    if (!extensionsRes.ok) {
      const errorText = await extensionsRes.text();
      return {
        success: false,
        error: `Error obteniendo extensiones: ${extensionsRes.status} ${errorText}`
      };
    }
    
    const extensionsData = await extensionsRes.json();
    console.log(`✓ Extensiones actuales: ${extensionsData.value?.length || 0}`);
    
    // Paso 3: Crear/Actualizar extensionUpload entity
    console.log('Paso 3: Creando extensionUpload entity...');
    
    // Primero intentar obtener si ya existe
    const getUploadRes = await fetch(`${automationApiUrl}/companies(${companyId})/extensionUpload`, {
      method: 'GET',
      headers: authHeaders
    });
    
    let extensionUpload;
    const uploadBody = {
      schedule: 'Current Version',
      SchemaSyncMode: installMode === 'ForceSync' ? 'Force_x0020_Sync' : 'Add'
    };
    
    if (getUploadRes.ok) {
      const existingUpload = await getUploadRes.json();
      if (existingUpload.value && existingUpload.value.length > 0 && existingUpload.value[0].systemId) {
        // Ya existe, hacer PATCH
        const systemId = existingUpload.value[0].systemId;
        const patchRes = await fetch(`${automationApiUrl}/companies(${companyId})/extensionUpload(${systemId})`, {
          method: 'PATCH',
          headers: {
            ...authHeaders,
            'Content-Type': 'application/json',
            'If-Match': '*'
          },
          body: JSON.stringify(uploadBody)
        });
        
        if (!patchRes.ok) {
          const errorText = await patchRes.text();
          return {
            success: false,
            error: `Error actualizando extensionUpload: ${patchRes.status} ${errorText}`
          };
        }
        
        extensionUpload = await patchRes.json();
      }
    }
    
    if (!extensionUpload) {
      // Crear nuevo
      const postRes = await fetch(`${automationApiUrl}/companies(${companyId})/extensionUpload`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(uploadBody)
      });
      
      if (!postRes.ok) {
        const errorText = await postRes.text();
        return {
          success: false,
          error: `Error creando extensionUpload: ${postRes.status} ${errorText}`
        };
      }
      
      extensionUpload = await postRes.json();
    }
    
    if (!extensionUpload.systemId) {
      return {
        success: false,
        error: 'No se pudo obtener systemId de extensionUpload'
      };
    }
    
    console.log(`✓ ExtensionUpload entity creada: ${extensionUpload.systemId}`);
    
    // Paso 4: Subir contenido del archivo .app
    console.log('Paso 4: Subiendo archivo .app...');
    const mediaEditLink = extensionUpload['extensionContent@odata.mediaEditLink'];
    
    if (!mediaEditLink) {
      return {
        success: false,
        error: 'No se encontró extensionContent@odata.mediaEditLink en la respuesta'
      };
    }
    
    const uploadContentRes = await fetch(mediaEditLink, {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/octet-stream',
        'If-Match': '*'
      },
      body: new Uint8Array(appBuffer)
    });
    
    if (!uploadContentRes.ok) {
      const errorText = await uploadContentRes.text();
      return {
        success: false,
        error: `Error subiendo contenido: ${uploadContentRes.status} ${errorText}`
      };
    }
    
    console.log(`✓ Archivo subido (${appBuffer.length} bytes)`);
    
    // Paso 5: Triggear la instalación
    console.log('Paso 5: Triggerando instalación...');
    const uploadActionUrl = `${automationApiUrl}/companies(${companyId})/extensionUpload(${extensionUpload.systemId})/Microsoft.NAV.upload`;
    const triggerRes = await fetch(uploadActionUrl, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'If-Match': '*'
      }
    });
    
    if (!triggerRes.ok) {
      const errorText = await triggerRes.text();
      return {
        success: false,
        error: `Error triggerando instalación: ${triggerRes.status} ${errorText}`
      };
    }
    
    console.log('✓ Instalación triggerrada');
    
    // Paso 6: Poll deployment status (basado en Publish-PerTenantExtensionApps de BcContainerHelper)
    console.log('Paso 6: Monitoreando progreso de la instalación...');
    console.log('⏳ Esperando a que Business Central complete la instalación...');
    
    // Usar publisher, name y version de la tabla de aplicaciones (pasados como parámetro)
    // Esto es lo que hace BcContainerHelper - busca por estos campos, NO por appId
    const appPublisher = appInfo.publisher;
    const appName = appInfo.name;
    const appVersion = appInfo.version;
    
    console.log(`📋 Buscando deployment status para: Publisher="${appPublisher}", Name="${appName}", Version="${appVersion}"`);
    
    let completed = false;
    let deploymentFailed = false;
    let failureReason = '';
    let attempts = 0;
    const maxAttempts = 180; // 30 minutos máximo (10 segundos * 180)
    let lastStatus = '';
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5; // Fallar después de 5 errores consecutivos de polling
    let sleepSeconds = 30; // Empezar con 30 segundos como BcContainerHelper
    
    while (!completed && !deploymentFailed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, sleepSeconds * 1000));
      attempts++;
      
      try {
        const statusRes = await fetch(`${automationApiUrl}/companies(${companyId})/extensionDeploymentStatus`, {
          method: 'GET',
          headers: authHeaders
        });
        
        if (!statusRes.ok) {
          consecutiveErrors++;
          console.log(`⚠ Error obteniendo status (intento ${attempts}/${maxAttempts}, errores consecutivos: ${consecutiveErrors}/${maxConsecutiveErrors})`);
          
          if (consecutiveErrors >= maxConsecutiveErrors) {
            return {
              success: false,
              error: `No se pudo obtener el estado del deployment después de ${maxConsecutiveErrors} intentos consecutivos. Verifica la conectividad con Business Central.`
            };
          }
          sleepSeconds = Math.min(sleepSeconds + sleepSeconds, 60); // Backoff exponencial, máx 60s
          continue;
        }
        
        // Reset consecutive errors counter on successful response
        consecutiveErrors = 0;
        sleepSeconds = 5; // Después de éxito, poll cada 5 segundos como BcContainerHelper
        
        const statusData = await statusRes.json();
        const deploymentStatuses = statusData.value || [];
        
        // Buscar el status de nuestra app por publisher, name y version (como BcContainerHelper)
        // Este es el método correcto usado por Publish-PerTenantExtensionApps
        let thisExtension = deploymentStatuses.find((ext: any) => {
          // Comparar case-insensitive para mayor robustez
          const matchPublisher = appPublisher && ext.publisher && 
            ext.publisher.toLowerCase() === appPublisher.toLowerCase();
          const matchName = appName && ext.name && 
            ext.name.toLowerCase() === appName.toLowerCase();
          const matchVersion = appVersion && ext.appVersion && 
            ext.appVersion === appVersion;
          
          return matchPublisher && matchName && matchVersion;
        });
        
        // Fallback: si no encontramos por los 3 campos, intentar por publisher + name (versión puede diferir)
        if (!thisExtension && appPublisher && appName) {
          thisExtension = deploymentStatuses.find((ext: any) => {
            const matchPublisher = ext.publisher && 
              ext.publisher.toLowerCase() === appPublisher.toLowerCase();
            const matchName = ext.name && 
              ext.name.toLowerCase() === appName.toLowerCase();
            return matchPublisher && matchName;
          });
        }
        
        if (!thisExtension) {
          console.log(`⚠ No se encontró deployment status para ${appPublisher}/${appName}/${appVersion} (intento ${attempts}/${maxAttempts})`);
          continue;
        }
        
        const status = thisExtension.status || thisExtension.Status;
        if (status !== lastStatus) {
          console.log(`📊 Estado del deployment: ${status} (${attempts}/${maxAttempts})`);
          lastStatus = status;
        } else {
          console.log(`⏳ Esperando... ${status} (${attempts}/${maxAttempts})`);
        }
        
        // Manejo de estados según BcContainerHelper (Publish-PerTenantExtensionApps.ps1 líneas 217-246)
        if (status === 'Completed') {
          completed = true;
          console.log('✅ INSTALACIÓN COMPLETADA EXITOSAMENTE en Business Central');
        } else if (status === 'InProgress') {
          // Continuar esperando - NO marcar como completado aún
          consecutiveErrors = 0;
          sleepSeconds = 5;
          console.log('⏳ Business Central está procesando la instalación...');
        } else if (status === 'Unknown') {
          // En BcContainerHelper esto lanza "Unknown Error"
          deploymentFailed = true;
          // Intentar obtener el mensaje de error de BC
          const errorMsg = thisExtension.errorMessage || thisExtension.ErrorMessage || 
                          thisExtension.message || thisExtension.Message || '';
          console.log('');
          console.log('═'.repeat(80));
          console.log('❌ ERROR DE DEPLOYMENT EN BUSINESS CENTRAL');
          console.log('═'.repeat(80));
          console.log(`   Status: Unknown`);
          if (errorMsg) {
            console.log(`   Mensaje: ${errorMsg}`);
          }
          console.log('═'.repeat(80));
          console.log('');
          failureReason = errorMsg 
            ? `Unknown Error: ${errorMsg}` 
            : 'Unknown Error - La instalación falló con un error desconocido. Revisa Extension Deployment Status Details en Business Central.';
        } else {
          // CRÍTICO: Cualquier otro status (ej: "Failed", "Error", etc.) es un ERROR
          // BcContainerHelper hace: throw $_.status
          // BC puede devolver el mensaje de error en varios campos
          deploymentFailed = true;
          const errorMsg = thisExtension.errorMessage || thisExtension.ErrorMessage || 
                          thisExtension.message || thisExtension.Message ||
                          thisExtension.details || thisExtension.Details || '';
          
          // Mostrar el error de forma prominente como AL-Go
          console.log('');
          console.log('═'.repeat(80));
          console.log('❌ ERROR DE DEPLOYMENT EN BUSINESS CENTRAL');
          console.log('═'.repeat(80));
          console.log(`   App: ${appPublisher}_${appName}_${appVersion}`);
          console.log(`   Status: ${status}`);
          if (errorMsg) {
            console.log(`   Mensaje de Error:`);
            // Dividir el mensaje en líneas si es muy largo
            const errorLines = errorMsg.split(/[\r\n]+/).filter((line: string) => line.trim());
            errorLines.forEach((line: string) => {
              console.log(`      ${line}`);
            });
          }
          // Mostrar información adicional si está disponible
          if (thisExtension.operationId || thisExtension.OperationId) {
            console.log(`   Operation ID: ${thisExtension.operationId || thisExtension.OperationId}`);
          }
          if (thisExtension.startedOn || thisExtension.StartedOn) {
            console.log(`   Iniciado: ${thisExtension.startedOn || thisExtension.StartedOn}`);
          }
          console.log('═'.repeat(80));
          console.log('');
          
          failureReason = errorMsg 
            ? `Deployment falló con status "${status}": ${errorMsg}`
            : `Deployment falló con status: ${status}. Revisa Extension Deployment Status Details en Business Central para más información.`;
        }
      } catch (pollError) {
        consecutiveErrors++;
        const errorMsg = pollError instanceof Error ? pollError.message : 'Error desconocido';
        console.log(`⚠ Excepción obteniendo status (intento ${attempts}/${maxAttempts}, errores consecutivos: ${consecutiveErrors}/${maxConsecutiveErrors}): ${errorMsg}`);
        
        if (consecutiveErrors >= maxConsecutiveErrors) {
          return {
            success: false,
            error: `Fallos repetidos al obtener estado del deployment: ${errorMsg}. Verifica la conectividad con Business Central.`
          };
        }
        // Incrementar tiempo de espera con backoff
        sleepSeconds = Math.min(sleepSeconds + sleepSeconds, 60);
        // Continuar intentando - puede ser temporal
      }
    }
    
    // Verificar si el deployment falló explícitamente
    if (deploymentFailed) {
      console.error(`❌ DEPLOYMENT FALLÓ: ${failureReason}`);
      return {
        success: false,
        error: failureReason
      };
    }
    
    if (!completed) {
      return {
        success: false,
        error: 'Timeout: La instalación no se completó en 30 minutos. Verifica el estado manualmente en Business Central → Extension Management.'
      };
    }
    
    console.log('🎉 Extension instalada y lista para usar en Business Central');
    
    return { 
      success: true,
      operationId: extensionUpload.systemId
    };
  } catch (error) {
    console.error('Error instalando app en BC:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

interface DeploymentResult {
  success: boolean;
  appId: string;
  appName: string;
  error?: string;
  details?: {
    downloadUrl?: string;
    installationStatus?: string;
  };
}

interface DeploymentBatchResult {
  success: number;
  failed: number;
  total: number;
  results: DeploymentResult[];
}

/**
 * Obtiene el artifact de un Pull Request desde GitHub Actions
 */
async function getPullRequestArtifact(
  owner: string,
  repo: string,
  token: string,
  prNumber: number
): Promise<{ downloadUrl: string; version: string; assetId?: number } | null> {
  try {
    console.log(`Obteniendo artifacts del PR #${prNumber}...`);

    // 1. Obtener los workflows runs del PR
    const runsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/runs?event=pull_request&per_page=100`;
    const runsRes = await fetch(runsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!runsRes.ok) {
      console.error(`Error obteniendo workflow runs: ${runsRes.status}`);
      return null;
    }

    const runsData = await runsRes.json();
    
    // Filtrar runs que correspondan al PR
    const prRuns = runsData.workflow_runs.filter((run: any) => {
      return run.pull_requests?.some((pr: any) => pr.number === prNumber);
    });

    if (prRuns.length === 0) {
      console.error(`No se encontraron workflow runs para PR #${prNumber}`);
      return null;
    }

    // Ordenar por fecha y obtener el más reciente exitoso
    const successfulRun = prRuns
      .filter((run: any) => run.status === 'completed' && run.conclusion === 'success')
      .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

    if (!successfulRun) {
      console.error(`No se encontró un workflow run exitoso para PR #${prNumber}`);
      return null;
    }

    console.log(`Workflow run encontrado: ${successfulRun.id} (${successfulRun.name})`);

    // 2. Obtener los artifacts de ese run
    const artifactsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${successfulRun.id}/artifacts`;
    const artifactsRes = await fetch(artifactsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!artifactsRes.ok) {
      console.error(`Error obteniendo artifacts: ${artifactsRes.status}`);
      return null;
    }

    const artifactsData = await artifactsRes.json();

    if (artifactsData.artifacts.length === 0) {
      console.error(`No se encontraron artifacts en el workflow run ${successfulRun.id}`);
      return null;
    }

    // Buscar el artifact .app o .zip
    const artifact = artifactsData.artifacts.find((a: any) => 
      a.name.toLowerCase().includes('app') || 
      a.name.toLowerCase().endsWith('.app') ||
      a.name.toLowerCase().endsWith('.zip')
    );

    if (!artifact) {
      console.error(`No se encontró artifact .app en el workflow run`);
      console.error(`Artifacts disponibles: ${artifactsData.artifacts.map((a: any) => a.name).join(', ')}`);
      return null;
    }

    console.log(`Artifact encontrado: ${artifact.name}`);
    
    return {
      downloadUrl: artifact.archive_download_url,
      version: `PR${prNumber}`,
      assetId: artifact.id,
    };
  } catch (error) {
    console.error('Error obteniendo artifact del PR:', error);
    return null;
  }
}

/**
 * Obtiene la URL de descarga del último release de GitHub
 */
async function getLatestReleaseAsset(
  owner: string,
  repo: string,
  token: string,
  versionType: 'release' | 'prerelease' | 'pullrequest' = 'release',
  prNumber?: number
): Promise<{ downloadUrl: string; version: string; assetId?: number } | null> {
  try {
    // Si es un Pull Request, obtener artifacts
    if (versionType === 'pullrequest' && prNumber) {
      return await getPullRequestArtifact(owner, repo, token, prNumber);
    }

    let url: string;
    let release: any;

    if (versionType === 'prerelease') {
      // Para prereleases, obtener todas las releases y filtrar
      url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=50`;
      console.log(`Fetching prereleases from: ${url}`);
      
      const releaseRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!releaseRes.ok) {
        const errorText = await releaseRes.text();
        console.error(`Error obteniendo releases: ${releaseRes.status} ${releaseRes.statusText}`);
        console.error(`Response body: ${errorText}`);
        return null;
      }

      const releases = await releaseRes.json();
      
      // Buscar la primera prerelease (más reciente)
      release = releases.find((r: any) => r.prerelease === true);
      
      if (!release) {
        console.error('No se encontró ninguna prerelease disponible');
        return null;
      }
      
      console.log(`Prerelease encontrado: ${release.tag_name || release.name}`);
    } else {
      // Para releases normales, usar el endpoint /latest
      url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
      console.log(`Fetching release from: ${url}`);
      
      const releaseRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!releaseRes.ok) {
        const errorText = await releaseRes.text();
        console.error(`Error obteniendo release: ${releaseRes.status} ${releaseRes.statusText}`);
        console.error(`Response body: ${errorText}`);
        return null;
      }

      release = await releaseRes.json();
      console.log(`Release encontrado: ${release.tag_name || release.name}`);
    }
    
    console.log(`Assets disponibles: ${release.assets.map((a: any) => a.name).join(', ')}`);
    
    // Buscar el asset .app (o .zip que contenga .app)
    const asset = release.assets.find((a: any) => 
      a.name.endsWith('.app') || a.name.endsWith('.zip')
    );

    if (!asset) {
      console.error('No se encontró archivo .app o .zip en el release');
      console.error(`Assets disponibles: ${JSON.stringify(release.assets.map((a: any) => a.name))}`);
      return null;
    }

    console.log(`Asset seleccionado: ${asset.name}`);
    console.log(`Asset ID: ${asset.id}`);
    console.log(`Browser download URL: ${asset.browser_download_url}`);
    
    // Usar la URL de la API de GitHub para descargar el asset
    // Esto es más confiable que browser_download_url
    const downloadUrl = asset.url; // URL de la API: /repos/{owner}/{repo}/releases/assets/{asset_id}
    
    console.log(`API download URL: ${downloadUrl}`);
    
    return {
      downloadUrl,
      version: release.tag_name || release.name,
      assetId: asset.id,
    };
  } catch (error) {
    console.error('Error obteniendo release de GitHub:', error);
    return null;
  }
}

/**
 * Descarga y extrae el archivo .app desde GitHub
 */
async function downloadAndExtractApp(
  downloadUrl: string,
  githubToken: string
): Promise<Buffer | null> {
  try {
    // Descargar el archivo usando la API de GitHub
    // Si downloadUrl es una URL de API (contiene /repos/), usar Accept: application/octet-stream
    // Si es una URL directa de GitHub, usarla tal cual
    const headers: HeadersInit = {
      Authorization: `Bearer ${githubToken}`,
    };

    // Si es URL de la API de GitHub (asset.url), necesitamos Accept: application/octet-stream
    if (downloadUrl.includes('api.github.com')) {
      headers.Accept = 'application/octet-stream';
    }

    console.log(`Descargando desde: ${downloadUrl}`);
    const response = await fetch(downloadUrl, { headers });

    if (!response.ok) {
      console.error(`Error descargando asset: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Response: ${errorText.substring(0, 200)}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log(`Archivo descargado: ${(arrayBuffer.byteLength / 1024).toFixed(2)} KB`);

    // Detectar si es ZIP por magic bytes (PK) en lugar de por extensión
    const uint8Array = new Uint8Array(arrayBuffer);
    const isZip = uint8Array[0] === 0x50 && uint8Array[1] === 0x4B; // "PK"

    if (isZip) {
      console.log('Archivo detectado como ZIP, extrayendo...');
      // Para Node.js, usaremos el módulo adm-zip
      const AdmZip = (await import('adm-zip')).default;
      const zip = new AdmZip(Buffer.from(arrayBuffer));
      const zipEntries = zip.getEntries();

      console.log(`Entradas en ZIP: ${zipEntries.map(e => e.entryName).join(', ')}`);

      // Buscar el archivo .app dentro del zip
      const appEntry = zipEntries.find(entry => entry.entryName.endsWith('.app'));
      
      if (!appEntry) {
        console.error('No se encontró archivo .app dentro del .zip');
        return null;
      }

      console.log(`Extrayendo: ${appEntry.entryName}`);
      // Extraer el .app - getData() devuelve Buffer
      const buffer = appEntry.getData();
      return Buffer.from(buffer);
    }

    console.log('Archivo es .app directo');
    // Si ya es un .app, retornar directamente como Buffer
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error descargando o extrayendo app:', error);
    return null;
  }
}

/**
 * Despliega múltiples aplicaciones en un entorno de Business Central
 * Se detiene en el primer error encontrado
 */
export async function deployApplications(
  environmentUrl: string,
  authContext: string,
  environmentName: string,
  applications: Array<{
    id: string;
    name: string;
    publisher: string;
    version: string;
    githubRepoName: string;
    versionType: 'release' | 'prerelease' | 'pullrequest';
    prNumber?: number;
    installMode?: 'Add' | 'ForceSync';
  }>,
  githubToken: string,
  onProgress?: (progress: {
    applicationId: string;
    applicationName: string;
    status: 'pending' | 'downloading' | 'installing' | 'success' | 'error';
    message?: string;
    error?: string;
    steps?: Array<{
      name: string;
      status: 'pending' | 'running' | 'success' | 'error';
      message?: string;
    }>;
  }) => void
): Promise<DeploymentBatchResult> {
  const results: DeploymentResult[] = [];
  let successCount = 0;
  let failedCount = 0;

  // Inicializar todas las apps como pendientes
  console.log(`\n🚀 Iniciando despliegue de ${applications.length} aplicación(es)...`);
  console.log(`📍 Entorno: ${environmentName}`);
  console.log('━'.repeat(80));
  
  // Procesar cada aplicación secuencialmente
  for (let i = 0; i < applications.length; i++) {
    const app = applications[i];
    const appNumber = i + 1;
    
    // Inicializar los 3 pasos
    const steps: Array<{
      name: string;
      status: 'pending' | 'running' | 'success' | 'error';
      message?: string;
    }> = [
      { name: '1. Validación', status: 'pending', message: undefined },
      { name: '2. Descarga', status: 'pending', message: undefined },
      { name: '3. Instalación', status: 'pending', message: undefined },
    ];
    
    try {
      console.log(`\n📦 [${appNumber}/${applications.length}] ${app.name}`);
      console.log(`   ID: ${app.id}`);
      console.log(`   Repo: ${app.githubRepoName}`);
      console.log('─'.repeat(80));

      // === PASO 1: VALIDACIÓN ===
      console.log(`   1️⃣  Validando configuración...`);
      steps[0].status = 'running';
      onProgress?.({
        applicationId: app.id,
        applicationName: app.name,
        status: 'downloading',
        message: 'Validando configuración...',
        steps: [...steps],
      });
      
      const [owner, repo] = app.githubRepoName.split('/');
      
      if (!owner || !repo) {
        const error = `Formato inválido de repositorio GitHub: "${app.githubRepoName}"`;
        console.error(`   ❌ ${error}`);
        steps[0].status = 'error';
        steps[0].message = error;
        onProgress?.({
          applicationId: app.id,
          applicationName: app.name,
          status: 'error',
          error: `Paso 1/3: ${error}`,
          steps: [...steps],
        });
        results.push({
          success: false,
          appId: app.id,
          appName: app.name,
          error,
        });
        failedCount++;
        
        // Marcar las apps restantes como abortadas
        for (let j = i + 1; j < applications.length; j++) {
          const abortedApp = applications[j];
          console.log(`\n⏸️  [${j + 1}/${applications.length}] ${abortedApp.name} - ABORTADO`);
          onProgress?.({
            applicationId: abortedApp.id,
            applicationName: abortedApp.name,
            status: 'error',
            error: 'Despliegue abortado por error anterior',
          });
          results.push({
            success: false,
            appId: abortedApp.id,
            appName: abortedApp.name,
            error: 'Despliegue abortado por error anterior',
          });
          failedCount++;
        }
        break;
      }
      console.log(`   ✅ Configuración válida`);
      steps[0].status = 'success';
      steps[0].message = `Repositorio: ${owner}/${repo}`;

      // === PASO 2: DESCARGA ===
      console.log(`   2️⃣  Obteniendo release desde GitHub...`);
      steps[1].status = 'running';
      onProgress?.({
        applicationId: app.id,
        applicationName: app.name,
        status: 'downloading',
        message: `Buscando última versión en GitHub`,
        steps: [...steps],
      });
      
      const releaseInfo = await getLatestReleaseAsset(owner, repo, githubToken, app.versionType, app.prNumber);
      if (!releaseInfo) {
        const versionLabel = app.versionType === 'pullrequest' 
          ? `Pull Request #${app.prNumber}` 
          : (app.versionType === 'prerelease' ? 'prerelease' : 'release');
        const error = `No se encontró ${versionLabel} disponible en GitHub`;
        console.error(`   ❌ ${error}`);
        steps[1].status = 'error';
        steps[1].message = error;
        onProgress?.({
          applicationId: app.id,
          applicationName: app.name,
          status: 'error',
          error: `Paso 2/3: ${error}`,
          steps: [...steps],
        });
        results.push({
          success: false,
          appId: app.id,
          appName: app.name,
          error,
        });
        failedCount++;
        
        // Abortar apps restantes
        for (let j = i + 1; j < applications.length; j++) {
          const abortedApp = applications[j];
          console.log(`\n⏸️  [${j + 1}/${applications.length}] ${abortedApp.name} - ABORTADO`);
          onProgress?.({
            applicationId: abortedApp.id,
            applicationName: abortedApp.name,
            status: 'error',
            error: 'Despliegue abortado por error anterior',
          });
          results.push({
            success: false,
            appId: abortedApp.id,
            appName: abortedApp.name,
            error: 'Despliegue abortado por error anterior',
          });
          failedCount++;
        }
        break;
      }

      console.log(`   ✅ Release encontrado: ${releaseInfo.version}`);
      console.log(`   📥 Descargando archivo .app...`);
      steps[1].message = `Descargando v${releaseInfo.version}...`;
      
      onProgress?.({
        applicationId: app.id,
        applicationName: app.name,
        status: 'downloading',
        message: `Descargando v${releaseInfo.version}`,
        steps: [...steps],
      });
      
      const appBuffer = await downloadAndExtractApp(releaseInfo.downloadUrl, githubToken);
      if (!appBuffer) {
        const error = 'Error descargando archivo .app desde GitHub';
        console.error(`   ❌ ${error}`);
        steps[1].status = 'error';
        steps[1].message = error;
        onProgress?.({
          applicationId: app.id,
          applicationName: app.name,
          status: 'error',
          error: `Paso 2/3: ${error}`,
          steps: [...steps],
        });
        results.push({
          success: false,
          appId: app.id,
          appName: app.name,
          error,
          details: { downloadUrl: releaseInfo.downloadUrl },
        });
        failedCount++;
        
        // Abortar apps restantes
        for (let j = i + 1; j < applications.length; j++) {
          const abortedApp = applications[j];
          console.log(`\n⏸️  [${j + 1}/${applications.length}] ${abortedApp.name} - ABORTADO`);
          onProgress?.({
            applicationId: abortedApp.id,
            applicationName: abortedApp.name,
            status: 'error',
            error: 'Despliegue abortado por error anterior',
          });
          results.push({
            success: false,
            appId: abortedApp.id,
            appName: abortedApp.name,
            error: 'Despliegue abortado por error anterior',
          });
          failedCount++;
        }
        break;
      }

      console.log(`   ✅ Descargado: ${(appBuffer.byteLength / 1024).toFixed(2)} KB`);
      steps[1].status = 'success';
      steps[1].message = `${(appBuffer.byteLength / 1024).toFixed(2)} KB descargados`;

      // === PASO 3: INSTALACIÓN ===
      console.log(`   3️⃣  Instalando en Business Central...`);
      steps[2].status = 'running';
      onProgress?.({
        applicationId: app.id,
        applicationName: app.name,
        status: 'installing',
        message: `Subiendo a Business Central`,
        steps: [...steps],
      });
      
      const installResult = await installAppInBC(
        environmentUrl,
        authContext,
        {
          id: app.id,
          name: app.name,
          publisher: app.publisher,
          version: app.version,
        },
        appBuffer,
        app.installMode || 'Add'
      );

      // Verificar explícitamente que el resultado sea exitoso
      if (!installResult) {
        const error = 'No se recibió respuesta de la instalación';
        console.error(`   ❌ ERROR EN INSTALACIÓN`);
        console.error(`   💥 ${error}`);
        console.log('━'.repeat(80));
        
        steps[2].status = 'error';
        steps[2].message = error;
        onProgress?.({
          applicationId: app.id,
          applicationName: app.name,
          status: 'error',
          error: `Paso 3/3: ${error}`,
          steps: [...steps],
        });
        results.push({
          success: false,
          appId: app.id,
          appName: app.name,
          error,
          details: { downloadUrl: releaseInfo.downloadUrl },
        });
        failedCount++;
        
        // Abortar apps restantes
        for (let j = i + 1; j < applications.length; j++) {
          const abortedApp = applications[j];
          console.log(`\n⏸️  [${j + 1}/${applications.length}] ${abortedApp.name} - ABORTADO`);
          onProgress?.({
            applicationId: abortedApp.id,
            applicationName: abortedApp.name,
            status: 'error',
            error: 'Despliegue abortado por error anterior',
          });
          results.push({
            success: false,
            appId: abortedApp.id,
            appName: abortedApp.name,
            error: 'Despliegue abortado por error anterior',
          });
          failedCount++;
        }
        break;
      }

      if (installResult.success === true && !installResult.error) {
        console.log(`   ✅ ¡INSTALADO EXITOSAMENTE!`);
        console.log(`   📌 Versión: ${releaseInfo.version}`);
        if (installResult.operationId) {
          console.log(`   🔄 Operation ID: ${installResult.operationId}`);
        }
        console.log('━'.repeat(80));
        
        steps[2].status = 'success';
        steps[2].message = installResult.operationId 
          ? `Instalado (Op: ${installResult.operationId.substring(0, 8)}...)`
          : 'Instalado correctamente';
        
        onProgress?.({
          applicationId: app.id,
          applicationName: app.name,
          status: 'success',
          message: `✓ Instalado: v${releaseInfo.version}`,
          steps: [...steps],
        });
        results.push({
          success: true,
          appId: app.id,
          appName: app.name,
          details: {
            downloadUrl: releaseInfo.downloadUrl,
            installationStatus: installResult.operationId 
              ? `En progreso (ID: ${installResult.operationId})` 
              : 'Completado',
          },
        });
        successCount++;
      } else {
        const error = installResult.error || 'Error desconocido al instalar en BC';
        console.error(`   ❌ ERROR EN INSTALACIÓN`);
        console.error(`   💥 ${error}`);
        console.log('━'.repeat(80));
        
        steps[2].status = 'error';
        steps[2].message = error;
        onProgress?.({
          applicationId: app.id,
          applicationName: app.name,
          status: 'error',
          error: `Paso 3/3: ${error}`,
          steps: [...steps],
        });
        results.push({
          success: false,
          appId: app.id,
          appName: app.name,
          error,
          details: { downloadUrl: releaseInfo.downloadUrl },
        });
        failedCount++;
        
        // Abortar apps restantes
        for (let j = i + 1; j < applications.length; j++) {
          const abortedApp = applications[j];
          console.log(`\n⏸️  [${j + 1}/${applications.length}] ${abortedApp.name} - ABORTADO`);
          onProgress?.({
            applicationId: abortedApp.id,
            applicationName: abortedApp.name,
            status: 'error',
            error: 'Despliegue abortado por error anterior',
          });
          results.push({
            success: false,
            appId: abortedApp.id,
            appName: abortedApp.name,
            error: 'Despliegue abortado por error anterior',
          });
          failedCount++;
        }
        break;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`   ❌ EXCEPCIÓN NO CONTROLADA`);
      console.error(`   💥 ${errorMessage}`);
      console.log('━'.repeat(80));
      
      // Marcar el paso actual como error
      const currentStepIndex = steps.findIndex(s => s.status === 'running');
      if (currentStepIndex >= 0) {
        steps[currentStepIndex].status = 'error';
        steps[currentStepIndex].message = errorMessage;
      }
      
      onProgress?.({
        applicationId: app.id,
        applicationName: app.name,
        status: 'error',
        error: `Error inesperado: ${errorMessage}`,
        steps: [...steps],
      });
      results.push({
        success: false,
        appId: app.id,
        appName: app.name,
        error: errorMessage,
      });
      failedCount++;
      
      // Abortar apps restantes
      for (let j = i + 1; j < applications.length; j++) {
        const abortedApp = applications[j];
        console.log(`\n⏸️  [${j + 1}/${applications.length}] ${abortedApp.name} - ABORTADO`);
        onProgress?.({
          applicationId: abortedApp.id,
          applicationName: abortedApp.name,
          status: 'error',
          error: 'Despliegue abortado por error anterior',
        });
        results.push({
          success: false,
          appId: abortedApp.id,
          appName: abortedApp.name,
          error: 'Despliegue abortado por error anterior',
        });
        failedCount++;
      }
      break;
    }
  }
  
  console.log('\n' + '━'.repeat(80));
  console.log('📊 RESUMEN DEL DESPLIEGUE');
  console.log('━'.repeat(80));
  console.log(`   ✅ Exitosos: ${successCount}`);
  console.log(`   ❌ Fallidos: ${failedCount}`);
  console.log(`   📦 Total: ${applications.length}`);
  console.log('━'.repeat(80) + '\n');

  return {
    success: successCount,
    failed: failedCount,
    total: applications.length,
    results,
  };
}
