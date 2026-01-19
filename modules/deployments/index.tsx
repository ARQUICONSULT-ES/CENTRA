"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAllEnvironments } from "@/modules/customers/hooks/useAllEnvironments";
import { useApplications } from "@/modules/applications/hooks/useApplications";
import { useDeployment } from "./hooks/useDeployment";
import { EnvironmentSelector } from "./components/EnvironmentSelector";
import { ApplicationList } from "./components/ApplicationList";
import { ApplicationSelectorModal } from "./components/ApplicationSelectorModal";
import { DeploymentProgressModal, type DeploymentProgress } from "./components/DeploymentProgressModal";
import type { Application } from "@/modules/applications/types";
import type { VersionType } from "./types";

export function DeploymentsPage() {
  const { environments, loading: loadingEnvs } = useAllEnvironments();
  const { applications, isLoading: loadingApps } = useApplications();
  const searchParams = useSearchParams();
  const {
    selectedEnvironment,
    setSelectedEnvironment,
    applications: selectedApplications,
    addApplication,
    addApplications,
    removeApplication,
    moveApplicationUp,
    moveApplicationDown,
    reorderApplications,
    isInitialized,
    setIsInitialized,
  } = useDeployment();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [progressData, setProgressData] = useState<DeploymentProgress[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  // Initialize state from URL params
  useEffect(() => {
    if (!loadingEnvs && !loadingApps && environments.length > 0 && applications.length > 0 && !isInitialized) {
      const tenantId = searchParams.get('tenantId');
      const environmentName = searchParams.get('environmentName');
      const appsParam = searchParams.get('apps');

      // Restore selected environment
      if (tenantId && environmentName) {
        const env = environments.find(
          e => e.tenantId === tenantId && e.name === environmentName
        );
        if (env) {
          setSelectedEnvironment({ ...env, selected: true });
        }
      }

      // Restore selected applications
      if (appsParam) {
        try {
          const appsData: Array<{ id: string; versionType: VersionType }> = JSON.parse(appsParam);
          const appsToAdd = appsData
            .map(({ id, versionType }) => {
              const app = applications.find(a => a.id === id);
              return app ? { app, versionType } : null;
            })
            .filter(Boolean) as Array<{ app: Application; versionType: VersionType }>;
          
          if (appsToAdd.length > 0) {
            addApplications(appsToAdd);
          }
        } catch (e) {
          console.error('Error parsing apps from URL:', e);
        }
      }

      setIsInitialized(true);
    }
  }, [loadingEnvs, loadingApps, environments, applications, searchParams, isInitialized, setSelectedEnvironment, addApplications, setIsInitialized]);

  // Filter active environments
  const activeEnvironments = environments.filter(
    env => env.status?.toLowerCase() !== 'softdeleted'
  );

  const selectedAppIds = selectedApplications.map((app: Application) => app.id);

  const handleDeploy = async () => {
    if (!selectedEnvironment) {
      alert('Por favor selecciona un entorno primero');
      return;
    }
    if (selectedApplications.length === 0) {
      alert('Por favor agrega al menos una aplicación');
      return;
    }

    // Solicitar AuthContext al usuario
    const authContextInput = prompt(
      '🔐 Ingresa el AuthContext de Business Central:\n\n' +
      'El AuthContext es un objeto JSON que contiene la información de autenticación.\n' +
      'Puedes obtenerlo de varias formas:\n' +
      '• Desde la página de Business Central (sessionStorage["authContext"])\n' +
      '• Desde el parámetro ?authContext= en la URL\n\n' +
      'Formato esperado (JSON):\n' +
      '{"TenantID":"...","RefreshToken":"...","ClientID":"...","Scopes":"..."}'
    );

    if (!authContextInput || authContextInput.trim() === '') {
      alert('❌ El AuthContext es obligatorio para realizar el despliegue.');
      return;
    }

    // Limpiar el AuthContext si viene con el prefijo ?authContext=
    let cleanAuthContextStr = authContextInput.replace(/^\?authContext=/, '').trim();
    
    // Validar que sea un JSON válido
    let authContextObj;
    try {
      // Si ya es un objeto JSON parseado (string JSON), parsearlo
      authContextObj = JSON.parse(cleanAuthContextStr);
      
      // Validar que tenga los campos requeridos
      if (!authContextObj.TenantID || !authContextObj.RefreshToken || !authContextObj.ClientID) {
        throw new Error('El AuthContext debe contener: TenantID, RefreshToken, ClientID');
      }
    } catch (e) {
      alert(
        '❌ El AuthContext no es válido.\n\n' +
        'Debe ser un objeto JSON con los campos: TenantID, RefreshToken, ClientID, Scopes\n\n' +
        'Error: ' + (e instanceof Error ? e.message : 'Formato JSON inválido')
      );
      return;
    }
    
    // Convertir de vuelta a string para enviarlo
    const cleanAuthContext = JSON.stringify(authContextObj);

    // Construir la URL del entorno automáticamente
    // Usar el TenantID del AuthContext (más confiable) o el del entorno
    const tenantId = authContextObj.TenantID || selectedEnvironment.tenantId;
    const environmentUrl = `https://api.businesscentral.dynamics.com/v2.0/${tenantId}/${selectedEnvironment.name}`;

    console.log('Environment URL construida:', environmentUrl);

    const confirmed = confirm(
      `¿Deseas desplegar ${selectedApplications.length} aplicaciones en ${selectedEnvironment.name}?\n\n` +
      `Entorno: ${environmentUrl}\n\n` +
      `Esto puede tardar varios minutos. El proceso se detendrá si encuentra algún error.`
    );

    if (!confirmed) return;

    setIsDeploying(true);
    setProgressData([]);
    setIsProgressModalOpen(true);

    try {
      // Extraer repoOwner de githubUrl para cada aplicación
      const appsWithRepoInfo = selectedApplications.map(app => {
        let repoOwner = '';
        let repoName = app.githubRepoName;

        if (app.githubUrl) {
          // Extraer owner de URL como: https://github.com/owner/repo
          const match = app.githubUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
          if (match) {
            repoOwner = match[1];
            repoName = match[2].replace(/\.git$/, ''); // Remover .git si existe
          }
        }

        // Si githubRepoName ya incluye el owner (formato owner/repo), usarlo directamente
        const finalRepoName = repoOwner 
          ? `${repoOwner}/${repoName}` 
          : app.githubRepoName;

        console.log('App deployment info:', {
          appName: app.name,
          githubUrl: app.githubUrl,
          githubRepoName: app.githubRepoName,
          extracted: { repoOwner, repoName },
          finalRepoName,
        });

        return {
          id: app.id,
          name: app.name,
          publisher: app.publisher,
          githubRepoName: finalRepoName,
          versionType: app.versionType,
        };
      });

      // Validar que todos tengan formato owner/repo
      const appsWithoutOwner = appsWithRepoInfo.filter(app => {
        const parts = app.githubRepoName.split('/');
        return parts.length !== 2 || !parts[0] || !parts[1];
      });
      
      if (appsWithoutOwner.length > 0) {
        console.error('Apps sin owner/repo válido:', appsWithoutOwner);
        alert(`Las siguientes aplicaciones no tienen repositorio GitHub válido:\n${appsWithoutOwner.map(a => `${a.name} (${a.githubRepoName})`).join('\n')}`);
        setIsProgressModalOpen(false);
        setIsDeploying(false);
        return;
      }

      // Inicializar todas las apps como pendientes
      const initialProgress: DeploymentProgress[] = appsWithRepoInfo.map(app => ({
        applicationId: app.id,
        applicationName: app.name,
        status: 'pending',
      }));
      setProgressData(initialProgress);

      const response = await fetch('/api/deployments/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          environmentUrl,
          authContext: cleanAuthContext, // Ya es un string JSON válido
          environmentName: selectedEnvironment.name,
          applications: appsWithRepoInfo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al iniciar despliegue');
      }

      if (!response.body) {
        throw new Error('No se recibió stream de respuesta');
      }

      // Leer el stream de eventos
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                // Actualizar progreso
                setProgressData(prev => {
                  const existing = prev.find(p => p.applicationId === data.progress.applicationId);
                  if (existing) {
                    return prev.map(p => 
                      p.applicationId === data.progress.applicationId ? data.progress : p
                    );
                  }
                  return [...prev, data.progress];
                });
              } else if (data.type === 'complete' || data.type === 'error') {
                // Despliegue completado
                break;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error al desplegar:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido al desplegar');
      setIsProgressModalOpen(false);
    } finally {
      setIsDeploying(false);
    }
  };

  if (loadingEnvs || loadingApps) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="Volver atrás"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Despliegues
        </h1>
      </div>

      {/* Main Content - Two Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Environments */}
        <EnvironmentSelector
          environments={activeEnvironments}
          selectedEnvironment={selectedEnvironment}
          onSelectEnvironment={setSelectedEnvironment}
        />

        {/* Right Panel - Applications */}
        <ApplicationList
          applications={selectedApplications}
          selectedEnvironmentName={selectedEnvironment?.name || null}
          onRemove={removeApplication}
          onMoveUp={moveApplicationUp}
          onMoveDown={moveApplicationDown}
          onAddClick={() => setIsModalOpen(true)}
          onDeploy={handleDeploy}
          onReorder={reorderApplications}
        />
      </div>

      {/* Application Selector Modal */}
      <ApplicationSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applications={applications}
        onSelectApplications={addApplications}
        selectedApplicationIds={selectedAppIds}
      />

      {/* Deployment Progress Modal */}
      <DeploymentProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => {
          setIsProgressModalOpen(false);
          setProgressData([]);
        }}
        totalApps={selectedApplications.length}
        progressData={progressData}
      />
    </div>
  );
}
