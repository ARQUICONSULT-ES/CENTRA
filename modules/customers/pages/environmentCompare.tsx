"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/modules/shared/hooks/useToast";
import ToastContainer from "@/modules/shared/components/ToastContainer";
import { isVersionOutdated } from "@/modules/applications/utils/versionComparison";
import type { Application } from "@/modules/applications/types";

interface InstalledApp {
  id: string;
  name: string;
  version: string;
  publisher: string;
  publishedAs: string;
  state?: string | null;
}

interface EnvironmentDetail {
  tenantId: string;
  name: string;
  type?: string | null;
  status?: string | null;
  webClientUrl?: string | null;
  locationName?: string | null;
  applicationVersion?: string | null;
  platformVersion?: string | null;
  customerId: string;
  customerName: string;
  customerImage?: string | null;
  tenantDescription?: string | null;
  installedApps: InstalledApp[];
}

interface EnvironmentComparePageProps {
  environments: Array<{
    tenantId: string;
    environmentName: string;
  }>;
}

interface ComparisonResult {
  allApps: Array<{
    id: string;
    name: string;
    publisher: string;
    publishedAs: string;
    installations: (InstalledApp | undefined)[];
    hasDiff: boolean;
    onlyInEnvironments: number[]; // índices de entornos donde existe
  }>;
}

export function EnvironmentComparePage({ 
  environments: initialEnvironments
}: EnvironmentComparePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, removeToast, error: showError } = useToast();
  const [environments, setEnvironments] = useState<EnvironmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [latestVersions, setLatestVersions] = useState<Record<string, string>>({});
  
  // Inicializar filtros desde URL
  const [hideMicrosoftApps, setHideMicrosoftApps] = useState(() => {
    const param = searchParams.get('hideMicrosoft');
    return param === null ? true : param === 'true';
  });
  const [hideMatching, setHideMatching] = useState(() => {
    const param = searchParams.get('hideMatching');
    return param === 'true';
  });
  
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [changingIndex, setChangingIndex] = useState<number>(-1);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [availableEnvironments, setAvailableEnvironments] = useState<Array<{
    tenantId: string;
    name: string;
    type: string;
    applicationVersion?: string | null;
    platformVersion?: string | null;
    locationName?: string | null;
    nonMicrosoftAppsCount: number;
  }>>([]);
  const [loadingEnvironments, setLoadingEnvironments] = useState(false);

  // Sincronizar filtros con URL
  useEffect(() => {
    const newParams = new URLSearchParams(window.location.search);
    
    // Actualizar parámetro hideMicrosoft (por defecto true, solo guardamos si es diferente)
    if (!hideMicrosoftApps) {
      newParams.set('hideMicrosoft', 'false');
    } else {
      newParams.delete('hideMicrosoft'); // Por defecto es true
    }

    // Actualizar parámetro hideMatching
    if (hideMatching) {
      newParams.set('hideMatching', 'true');
    } else {
      newParams.delete('hideMatching'); // Por defecto es false
    }

    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    
    // Solo actualizar si la URL realmente cambió
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [hideMicrosoftApps, hideMatching, router]);

  useEffect(() => {
    loadEnvironments();
  }, [JSON.stringify(initialEnvironments)]);

  // Cargar aplicaciones del catálogo para obtener las últimas versiones
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/applications');
        if (response.ok) {
          const applications: Application[] = await response.json();
          const versionsMap: Record<string, string> = {};
          applications.forEach(app => {
            if (app.latestReleaseVersion) {
              versionsMap[app.id] = app.latestReleaseVersion;
            }
          });
          setLatestVersions(versionsMap);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    fetchApplications();
  }, []);

  const loadEnvironments = async () => {
    setLoading(true);
    try {
      const requests = initialEnvironments.map(env =>
        fetch(`/api/environments/${encodeURIComponent(env.tenantId)}/${encodeURIComponent(env.environmentName)}`)
      );

      const responses = await Promise.all(requests);

      if (responses.some(r => !r.ok)) {
        throw new Error("Error al cargar los entornos");
      }

      const envData = await Promise.all(responses.map(r => r.json()));

      setEnvironments(envData);

      // Compute comparison
      compareEnvironments(envData);
    } catch (err) {
      console.error("Error loading environments:", err);
      showError("No se pudieron cargar los entornos para comparar");
    } finally {
      setLoading(false);
    }
  };

  const compareEnvironments = (envs: EnvironmentDetail[]) => {
    // Crear mapas de apps para cada entorno
    const envAppsMaps = envs.map(env => new Map(env.installedApps.map(app => [app.id, app])));
    
    // Obtener todos los IDs únicos de aplicaciones
    const allAppIds = new Set<string>();
    envAppsMaps.forEach(map => {
      map.forEach((_, id) => allAppIds.add(id));
    });

    const allApps: ComparisonResult['allApps'] = [];

    allAppIds.forEach(appId => {
      // Obtener la app de cada entorno
      const installations = envAppsMaps.map(map => map.get(appId));
      
      // Usar la primera app encontrada para metadata
      const metadata = installations.find(app => app !== undefined)!;
      
      // Calcular en qué entornos existe
      const onlyInEnvironments = installations
        .map((app, idx) => app ? idx : -1)
        .filter(idx => idx !== -1);
      
      // Verificar si hay diferencias
      let hasDiff = false;
      const firstApp = installations.find(app => app);
      if (firstApp && onlyInEnvironments.length > 1) {
        for (const installation of installations) {
          if (installation && (
            installation.version !== firstApp.version ||
            installation.name !== firstApp.name ||
            installation.publisher !== firstApp.publisher ||
            installation.publishedAs !== firstApp.publishedAs
          )) {
            hasDiff = true;
            break;
          }
        }
      }
      
      allApps.push({
        id: appId,
        name: metadata.name,
        publisher: metadata.publisher,
        publishedAs: metadata.publishedAs,
        installations,
        hasDiff,
        onlyInEnvironments
      });
    });

    // Sort by: 1) matching apps in all, 2) apps with differences, 3) apps in some environments, then by name
    allApps.sort((a, b) => {
      let aCategory: number;
      let bCategory: number;
      
      const aInAll = a.onlyInEnvironments.length === envs.length;
      const bInAll = b.onlyInEnvironments.length === envs.length;
      
      if (a.onlyInEnvironments.length < envs.length) aCategory = 2;
      else if (a.hasDiff) aCategory = 1;
      else aCategory = 0; // matching in all
      
      if (b.onlyInEnvironments.length < envs.length) bCategory = 2;
      else if (b.hasDiff) bCategory = 1;
      else bCategory = 0; // matching in all
      
      if (aCategory !== bCategory) {
        return aCategory - bCategory;
      }
      
      // Then by name within category
      return a.name.localeCompare(b.name);
    });

    setComparison({ allApps });
  };

  const loadAvailableEnvironments = async (customerId: string) => {
    setLoadingEnvironments(true);
    try {
      const response = await fetch(`/api/environments?customerId=${customerId}`);
      if (response.ok) {
        const allEnvironments = await response.json();
        // Filtrar entornos activos y excluir los entornos ya seleccionados
        const activeEnvs = allEnvironments.filter((env: any) => {
          if (env.status?.toLowerCase() !== 'active') return false;
          
          // Excluir todos los entornos ya en la comparación
          return !environments.some(e => e.tenantId === env.tenantId && e.name === env.name);
        });
        setAvailableEnvironments(activeEnvs.map((env: any) => ({
          tenantId: env.tenantId,
          name: env.name,
          type: env.type,
          applicationVersion: env.applicationVersion,
          platformVersion: env.platformVersion,
          locationName: env.locationName,
          nonMicrosoftAppsCount: env.installedApps?.filter((app: any) => app.publisher.toLowerCase() !== 'microsoft').length || 0
        })));
      }
    } catch (error) {
      console.error('Error loading environments:', error);
      showError('No se pudieron cargar los entornos disponibles');
    } finally {
      setLoadingEnvironments(false);
    }
  };

  const handleChangeEnvironment = (index: number) => {
    const customerId = environments[index]?.customerId;
    
    if (customerId) {
      setChangingIndex(index);
      setIsAddingNew(false);
      loadAvailableEnvironments(customerId);
      setShowCompareModal(true);
    }
  };

  const handleSelectEnvironment = (env: { tenantId: string; name: string }) => {
    let newEnvironments: Array<{tenantId: string; environmentName: string}>;
    
    if (isAddingNew) {
      // Añadir nuevo entorno
      newEnvironments = [
        ...initialEnvironments,
        { tenantId: env.tenantId, environmentName: env.name }
      ];
    } else {
      // Reemplazar entorno existente
      newEnvironments = [...initialEnvironments];
      newEnvironments[changingIndex] = { tenantId: env.tenantId, environmentName: env.name };
    }
    
    // Construir URL con query params
    const params = new URLSearchParams();
    newEnvironments.forEach((e, idx) => {
      params.append(`env${idx}`, `${e.tenantId}/${e.environmentName}`);
    });
    
    // Cerrar el modal antes de navegar
    setShowCompareModal(false);
    router.push(`/environments/compare?${params.toString()}`);
  };

  const handleAddEnvironment = () => {
    const customerId = environments[0]?.customerId;
    if (customerId && environments.length < 6) { // Máximo 6 entornos
      setIsAddingNew(true);
      setChangingIndex(-1);
      loadAvailableEnvironments(customerId);
      setShowCompareModal(true);
    }
  };

  const handleRemoveEnvironment = (index: number) => {
    if (environments.length <= 2) return; // Mínimo 2 entornos
    
    const newEnvironments = initialEnvironments.filter((_, idx) => idx !== index);
    
    const params = new URLSearchParams();
    newEnvironments.forEach((e, idx) => {
      params.append(`env${idx}`, `${e.tenantId}/${e.environmentName}`);
    });
    
    router.push(`/environments/compare?${params.toString()}`);
  };

  const getTypeColor = (type?: string | null) => {
    const typeStr = type?.toLowerCase();
    if (typeStr === 'production') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    } else if (typeStr === 'sandbox') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  };

  const getPublishedAsColor = (publishedAs: string) => {
    const type = publishedAs.toLowerCase();
    if (type === "global") {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
    if (type === "tenant") {
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
    if (type === "dev") {
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }
    return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Determinar el número de columnas para el grid
  const gridCols = environments.length === 2 ? 'lg:grid-cols-2' : 
                   environments.length === 3 ? 'lg:grid-cols-3' : 
                   environments.length === 4 ? 'lg:grid-cols-4' :
                   environments.length === 5 ? 'lg:grid-cols-5' :
                   'lg:grid-cols-6';

  const renderAppCard = (app: InstalledApp | undefined, highlightColor?: string, environmentName?: string, hasDiff?: {name?: boolean, publisher?: boolean, publishedAs?: boolean, version?: boolean}) => {
    if (!app) {
      return (
        <div className="h-full p-2 rounded bg-red-50/20 dark:bg-red-900/10 flex items-center justify-center">
          <span className="text-xs text-red-400 dark:text-red-500 font-medium">No instalada en {environmentName}</span>
        </div>
      );
    }

    // Verificar si la instalación está desactualizada
    const isOutdated = isVersionOutdated(app.version, latestVersions[app.id]);

    return (
      <div 
        className={`relative p-2 rounded border ${
          isOutdated 
            ? 'border-orange-300 dark:border-orange-600' 
            : 'border-transparent'
        } ${
          highlightColor || 'bg-white dark:bg-gray-900'
        }`}
      >
        {/* Indicador de obsolescencia */}
        {isOutdated && (
          <div className="absolute -top-2.5 -right-1 flex items-center gap-0.5 px-1 py-0.5 bg-orange-500 text-white text-[8px] font-semibold rounded-full shadow-sm" title="Versión desactualizada">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="hidden sm:inline">Desact.</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
            hasDiff?.publishedAs ? 'bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' : getPublishedAsColor(app.publishedAs)
          }`}>
            {app.publishedAs}
          </span>
          <p className={`font-mono text-sm font-semibold ${
            hasDiff?.version ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded' : 'text-gray-900 dark:text-white'
          }`}>{app.version}</p>
        </div>
      </div>
    );
  };

  // Filter apps based on hideMicrosoftApps and hideMatching
  const filteredApps = comparison?.allApps.filter(app => {
    if (hideMicrosoftApps && app.publisher.toLowerCase() === 'microsoft') {
      return false;
    }
    if (hideMatching && app.onlyInEnvironments.length === environments.length && !app.hasDiff) {
      return false;
    }
    return true;
  }) || [];

  // Calculate statistics
  const stats = {
    inAll: filteredApps.filter(app => app.onlyInEnvironments.length === environments.length).length,
    withDiff: filteredApps.filter(app => app.onlyInEnvironments.length === environments.length && app.hasDiff).length,
    partial: filteredApps.filter(app => app.onlyInEnvironments.length > 0 && app.onlyInEnvironments.length < environments.length).length
  };

  const renderEnvironmentHeader = (env: EnvironmentDetail, index: number, canRemove: boolean) => (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex gap-3 items-start">
        {/* Customer Image */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
          {env.customerImage ? (
            <img 
              src={env.customerImage} 
              alt={env.customerName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{env.customerName.charAt(0).toUpperCase()}</span>
          )}
        </div>

        {/* Environment Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          {/* Fila superior: Nombre + Botones */}
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white break-words flex-1 min-w-0 leading-tight">
              {env.name}
            </h2>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => handleChangeEnvironment(index)}
                className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded transition-colors flex items-center justify-center flex-shrink-0"
                title="Cambiar entorno"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              {canRemove && (
                <button
                  onClick={() => handleRemoveEnvironment(index)}
                  className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded transition-colors flex items-center justify-center flex-shrink-0"
                  title="Eliminar entorno"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Tipo de entorno */}
          {env.type && (
            <div className="mb-1">
              <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(env.type)}`}>
                {env.type}
              </span>
            </div>
          )}

          {/* App Version y Platform - se estiran hacia la izquierda */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 dark:text-gray-400 text-[10px] leading-tight">App Version</p>
                <p className="font-medium text-gray-900 dark:text-white truncate text-xs leading-tight" title={env.applicationVersion || undefined}>
                  {env.applicationVersion || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 dark:text-gray-400 text-[10px] leading-tight">Platform</p>
                <p className="font-medium text-gray-900 dark:text-white truncate text-xs leading-tight" title={env.platformVersion || undefined}>
                  {env.platformVersion || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/environments')}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Comparación de Entornos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comparando aplicaciones instaladas entre {environments.length} entornos
        </p>
      </div>

      {/* Environment Headers */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className={`grid grid-cols-1 ${gridCols} gap-4 flex-1`}>
          {environments.map((env, index) => 
            renderEnvironmentHeader(env, index, environments.length > 2)
          )}
        </div>
        {environments.length < 6 && (
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex items-center justify-center h-full min-h-[150px]">
              <button
                onClick={handleAddEnvironment}
                className="flex flex-col items-center gap-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Añadir entorno</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Summary */}
      {comparison && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-500 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {stats.inAll}
                    </p>
                    {stats.withDiff > 0 && (
                      <p className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
                        ({stats.withDiff} dif.)
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    En todos
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {stats.partial}
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Solo en algunos
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {filteredApps.length}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Total mostradas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border cursor-pointer transition-colors ${
                hideMicrosoftApps
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600"
                  : "border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
              }`}>
                <input
                  type="checkbox"
                  checked={hideMicrosoftApps}
                  onChange={(e) => setHideMicrosoftApps(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white border-blue-500 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className={`text-xs font-medium ${
                  hideMicrosoftApps
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}>
                  Ocultar apps Microsoft
                </span>
              </label>
              <label className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border cursor-pointer transition-colors ${
                hideMatching
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600"
                  : "border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
              }`}>
                <input
                  type="checkbox"
                  checked={hideMatching}
                  onChange={(e) => setHideMatching(e.target.checked)}
                  className="w-4 h-4 text-green-600 bg-white border-green-500 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className={`text-xs font-medium ${
                  hideMatching
                    ? "text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}>
                  Ocultar coincidentes
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {filteredApps.length} aplicaciones
            </p>
          </div>
        </div>
      )}

      {/* Detailed Comparison - Unified List */}
      {comparison && filteredApps.length > 0 && (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid gap-3 px-3 pb-2 border-b border-gray-200 dark:border-gray-700" style={{
            gridTemplateColumns: `2fr repeat(${environments.length}, 1fr)`
          }}>
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Aplicación</div>
            {environments.map((env, idx) => (
              <div key={idx} className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate" title={env.name}>
                {env.name}
              </div>
            ))}
          </div>

          {/* App Rows */}
          <div className="space-y-1">
            {filteredApps.map((app) => {
              let highlightColor = '';
              
              if (app.onlyInEnvironments.length < environments.length) {
                // Apps only in some environments: light red
                highlightColor = 'bg-red-100/70 dark:bg-red-900/20';
              } else if (app.hasDiff) {
                // Apps with differences: orange
                highlightColor = 'bg-orange-100/70 dark:bg-orange-900/20';
              } else {
                // Matching apps: light green
                highlightColor = 'bg-green-100/50 dark:bg-green-900/15';
              }

              return (
                <div 
                  key={app.id}
                  className={`grid gap-3 p-2 rounded ${highlightColor}`}
                  style={{
                    gridTemplateColumns: `2fr repeat(${environments.length}, 1fr)`
                  }}
                >
                  {/* App Name Column */}
                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className="font-semibold text-sm truncate mb-0.5 text-gray-900 dark:text-white">
                      {app.name}
                    </h4>
                    <p className="text-xs truncate text-gray-600 dark:text-gray-400">{app.publisher}</p>
                  </div>

                  {/* Environment Columns */}
                  {app.installations.map((installation, idx) => (
                    <div key={idx}>
                      {renderAppCard(
                        installation, 
                        app.hasDiff ? 'border-orange-300 dark:border-orange-600 bg-orange-50/30 dark:bg-orange-900/10' : undefined,
                        environments[idx].name,
                        { version: app.hasDiff }
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {comparison && filteredApps.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            No hay aplicaciones para mostrar con los filtros actuales
          </p>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && environments.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isAddingNew ? 'Añadir nuevo entorno' : `Cambiar entorno ${changingIndex + 1}`}
              </h3>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingEnvironments ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : availableEnvironments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">
                    No hay otros entornos activos disponibles
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableEnvironments.map((env) => (
                    <button
                      key={`${env.tenantId}-${env.name}`}
                      onClick={() => handleSelectEnvironment(env)}
                      className="w-full p-4 text-left bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 rounded-lg transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                              {env.name}
                            </h4>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(env.type)}`}>
                              {env.type}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="truncate" title={env.applicationVersion || undefined}>
                                {env.applicationVersion || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                              </svg>
                              <span className="truncate" title={env.platformVersion || undefined}>
                                {env.platformVersion || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="truncate" title={env.locationName || undefined}>
                                {env.locationName || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <span>{env.nonMicrosoftAppsCount} apps</span>
                            </div>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
