"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAllEnvironments } from "@/modules/customers/hooks/useAllEnvironments";
import { useApplications } from "@/modules/applications/hooks/useApplications";
import { useAllInstalledApps } from "@/modules/customers/hooks/useAllInstalledApps";
import { useDeployment } from "./hooks/useDeployment";
import { EnvironmentSelector } from "./components/EnvironmentSelector";
import { ApplicationList } from "./components/ApplicationList";
import { ApplicationSelectorModal } from "./components/ApplicationSelectorModal";
import { DeploymentProgressModal, type DeploymentProgress } from "./components/DeploymentProgressModal";
import { ConfirmModal } from "./components/ConfirmModal";
import TenantFormModal from "@/modules/customers/components/TenantFormModal";
import Toast from "@/modules/shared/components/Toast";
import { useToast } from "./hooks/useToast";
import { syncEnvironmentInstalledApps } from "@/modules/customers/services/installedAppService";
import type { Application } from "@/modules/applications/types";
import type { VersionType } from "./types";
import type { Tenant } from "@/modules/customers/types";

export function DeploymentsPage() {
  const { environments, loading: loadingEnvs } = useAllEnvironments();
  const { applications, isLoading: loadingApps } = useApplications();
  const { installedApps } = useAllInstalledApps();
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
    changeInstallMode,
    isInitialized,
    setIsInitialized,
  } = useDeployment();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [progressData, setProgressData] = useState<DeploymentProgress[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState<Tenant | undefined>();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    isDangerous?: boolean;
  } | null>(null);
  const { toasts, showToast, removeToast } = useToast();

  // Initialize state from URL params
  useEffect(() => {
    if (!loadingEnvs && !loadingApps && environments.length > 0 && applications.length > 0 && !isInitialized) {
      const tenantId = searchParams.get('tenantId');
      const environmentName = searchParams.get('environmentName');
      const appIdsParam = searchParams.get('appIds');
      const appVersionsParam = searchParams.get('appVersions');
      const appModesParam = searchParams.get('appModes');

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
      if (appIdsParam && appVersionsParam) {
        try {
          const appIds = appIdsParam.split(',');
          const versionTypes = appVersionsParam.split(',');
          const installModes = appModesParam ? appModesParam.split(',') : [];
          
          const appsToAdd = appIds
            .map((id, index) => {
              const app = applications.find(a => a.id === id);
              const versionTypeStr = versionTypes[index] || 'release';
              const installMode = (installModes[index] || 'Add') as 'Add' | 'ForceSync';
              
              // Parse version type and PR number
              let versionType: VersionType = 'release';
              let prNumber: number | undefined;
              
              if (versionTypeStr.startsWith('PR')) {
                // Formato: PR64
                versionType = 'pullrequest';
                prNumber = parseInt(versionTypeStr.substring(2), 10);
              } else {
                versionType = versionTypeStr as VersionType;
              }
              
              return app ? { app, versionType, prNumber, installMode } : null;
            })
            .filter(Boolean) as Array<{ app: Application; versionType: VersionType; prNumber?: number; installMode: 'Add' | 'ForceSync' }>;
          
          if (appsToAdd.length > 0) {
            addApplications(appsToAdd);
          }
        } catch (e) {
          console.error('Error parsing app parameters from URL:', e);
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

  // Get installed app IDs for the selected environment
  const installedAppIds = selectedEnvironment
    ? installedApps
        .filter(app => 
          app.tenantId === selectedEnvironment.tenantId && 
          app.environmentName === selectedEnvironment.name
        )
        .map(app => app.id)
    : [];

  const handleConfigureTenant = async (tenantId: string) => {
    try {
      // Cargar todos los datos del tenant desde la API
      const response = await fetch(`/api/customers/tenants/${tenantId}`);
      if (!response.ok) {
        throw new Error('Error al cargar los datos del tenant');
      }
      const tenantData = await response.json();
      setSelectedTenantForEdit(tenantData);
      setIsTenantModalOpen(true);
    } catch (error) {
      console.error('Error loading tenant:', error);
      showToast('Error al cargar los datos del tenant', 'error');
    }
  };

  const handleTenantModalClose = () => {
    setIsTenantModalOpen(false);
    setSelectedTenantForEdit(undefined);
  };

  const handleTenantSaved = async () => {
    setIsTenantModalOpen(false);
    setSelectedTenantForEdit(undefined);
    // Recargar environments para actualizar el authContext
    window.location.reload();
  };

  const handleDeploy = async () => {
    if (!selectedEnvironment) {
      showToast('Por favor selecciona un entorno primero', 'warning');
      return;
    }
    if (selectedApplications.length === 0) {
      showToast('Por favor agrega al menos una aplicación', 'warning');
      return;
    }

    // Obtener el authContext de la base de datos
    let authContextStr: string;
    try {
      const response = await fetch(`/api/customers/tenants/${selectedEnvironment.tenantId}`);
      if (!response.ok) {
        throw new Error('Error al obtener el tenant');
      }
      const tenant = await response.json();
      
      if (!tenant.authContext) {
        showToast('Este tenant no tiene configurado el AuthContext. Por favor configúralo primero.', 'error');
        return;
      }
      
      authContextStr = tenant.authContext;
      
      // Validar que sea un JSON válido
      const authContextObj = JSON.parse(authContextStr);
      if (!authContextObj.TenantID || !authContextObj.RefreshToken || !authContextObj.ClientID) {
        throw new Error('El AuthContext no contiene los campos requeridos');
      }
      
      // Construir la URL del entorno
      const tenantId = authContextObj.TenantID || selectedEnvironment.tenantId;
      const environmentUrl = `https://api.businesscentral.dynamics.com/v2.0/${tenantId}/${selectedEnvironment.name}`;
      
      console.log('Environment URL construida:', environmentUrl);
      
      // Función para iniciar el despliegue
      const startDeployment = async () => {
        setConfirmModalOpen(false);
        await executeDeployment(environmentUrl, authContextStr);
      };
      
      // Si es Production, mostrar doble confirmación
      if (selectedEnvironment.type?.toLowerCase() === 'production') {
        setConfirmModalConfig({
          title: '⚠️ Confirmar Despliegue en PRODUCCIÓN',
          message: `Estás a punto de desplegar ${selectedApplications.length} aplicaciones en un entorno de PRODUCCIÓN.\n\nEntorno: ${selectedEnvironment.name}\nURL: ${environmentUrl}\n\nEsta acción puede afectar a los usuarios finales.\n\n¿Estás seguro de que deseas continuar?`,
          isDangerous: true,
          onConfirm: () => {
            // Segunda confirmación
            setConfirmModalConfig({
              title: '⚠️ ÚLTIMA CONFIRMACIÓN',
              message: `CONFIRMA NUEVAMENTE:\n\nDesplegar ${selectedApplications.length} aplicaciones en PRODUCCIÓN (${selectedEnvironment.name})\n\nEsto puede tardar varios minutos y el proceso se detendrá si encuentra algún error.\n\n¿Proceder con el despliegue?`,
              isDangerous: true,
              onConfirm: startDeployment,
            });
            setConfirmModalOpen(true);
          },
        });
      } else {
        // Para entornos no-production, una sola confirmación
        setConfirmModalConfig({
          title: 'Confirmar Despliegue',
          message: `¿Deseas desplegar ${selectedApplications.length} aplicaciones en ${selectedEnvironment.name}?\n\nEntorno: ${environmentUrl}\n\nEsto puede tardar varios minutos. El proceso se detendrá si encuentra algún error.`,
          onConfirm: startDeployment,
        });
      }
      
      setConfirmModalOpen(true);
      
    } catch (error) {
      console.error('Error al preparar el despliegue:', error);
      showToast(
        error instanceof Error ? error.message : 'Error al preparar el despliegue',
        'error'
      );
      return;
    }
  };

  const executeDeployment = async (environmentUrl: string, authContext: string) => {

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

        // Seleccionar la versión según el versionType
        const version = app.versionType === 'prerelease' 
          ? (app.latestPrereleaseVersion || app.latestReleaseVersion || '0.0.0.0')
          : (app.latestReleaseVersion || '0.0.0.0');

        return {
          id: app.id,
          name: app.name,
          publisher: app.publisher,
          version: version,
          githubRepoName: finalRepoName,
          versionType: app.versionType,
          installMode: app.installMode || 'Add', // Default a 'Add' si no existe
        };
      });

      // Validar que todos tengan formato owner/repo
      const appsWithoutOwner = appsWithRepoInfo.filter(app => {
        const parts = app.githubRepoName.split('/');
        return parts.length !== 2 || !parts[0] || !parts[1];
      });
      
      if (appsWithoutOwner.length > 0) {
        console.error('Apps sin owner/repo válido:', appsWithoutOwner);
        showToast(
          `Las siguientes aplicaciones no tienen repositorio GitHub válido:\n${appsWithoutOwner.map(a => `${a.name} (${a.githubRepoName})`).join('\n')}`,
          'error'
        );
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
          authContext, // Ya es un string JSON válido
          environmentName: selectedEnvironment?.name || '',
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

      // Sincronizar siempre las instalaciones del entorno después del despliegue
      // Esto actualiza el estado real, incluso si algunas instalaciones fallaron
      if (selectedEnvironment) {
        showToast('Despliegue completado, sincronizando instalaciones del entorno...', 'info');
        try {
          await syncEnvironmentInstalledApps(selectedEnvironment.tenantId, selectedEnvironment.name);
          showToast('Instalaciones sincronizadas correctamente', 'success');
        } catch (syncError) {
          console.error('Error al sincronizar instalaciones:', syncError);
          showToast('Despliegue completado, pero hubo un error al sincronizar las instalaciones', 'warning');
        }
      }

    } catch (error) {
      console.error('Error al desplegar:', error);
      showToast(
        error instanceof Error ? error.message : 'Error desconocido al desplegar',
        'error'
      );
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
          onConfigureTenant={handleConfigureTenant}
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
          onInstallModeChange={changeInstallMode}
        />
      </div>

      {/* Application Selector Modal */}
      <ApplicationSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applications={applications}
        onSelectApplications={addApplications}
        selectedApplicationIds={selectedAppIds}
        installedAppIds={installedAppIds}
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
        environmentName={selectedEnvironment?.name}
      />

      {/* Tenant Configuration Modal */}
      <TenantFormModal
        isOpen={isTenantModalOpen}
        onClose={handleTenantModalClose}
        tenant={selectedTenantForEdit}
        onSave={handleTenantSaved}
      />

      {/* Confirm Modal */}
      {confirmModalConfig && (
        <ConfirmModal
          isOpen={confirmModalOpen}
          title={confirmModalConfig.title}
          message={confirmModalConfig.message}
          onConfirm={confirmModalConfig.onConfirm}
          onCancel={() => setConfirmModalOpen(false)}
          isDangerous={confirmModalConfig.isDangerous}
        />
      )}

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
