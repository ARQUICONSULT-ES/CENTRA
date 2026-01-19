"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Application } from "@/modules/applications/types";
import { useApplicationInstallations } from "@/modules/applications/hooks/useApplicationInstallations";
import { InstallationsByCustomer } from "@/modules/applications/components/InstallationsByCustomer";
import { countOutdatedInstallations, isVersionOutdated } from "@/modules/applications/utils/versionComparison";

interface ApplicationDetailPageProps {
  applicationId: string;
}

export function ApplicationDetailPage({ applicationId }: ApplicationDetailPageProps) {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyOutdated, setShowOnlyOutdated] = useState(false);

  const {
    installations,
    loading: installationsLoading,
    error: installationsError,
    refetch: refetchInstallations,
  } = useApplicationInstallations(applicationId);

  // Cargar datos de la aplicación
  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/applications/${applicationId}`);

        if (!response.ok) {
          throw new Error("Error al cargar la aplicación");
        }

        const data = await response.json();
        setApplication(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  // Filtrar instalaciones desactualizadas
  const filteredInstallations = useMemo(() => {
    if (!showOnlyOutdated || !application?.latestReleaseVersion) {
      return installations;
    }
    return installations.filter(inst => 
      isVersionOutdated(inst.version, application.latestReleaseVersion!)
    );
  }, [installations, showOnlyOutdated, application?.latestReleaseVersion]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 h-64"></div>
            </div>
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 h-48"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Volver"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Error al cargar aplicación</h1>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg">
          <p>{error || "No se encontró la aplicación"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            title="Volver"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
            {application.logoBase64 && (
              <img
                src={application.logoBase64}
                alt={application.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{application.name}</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Detalle de la aplicación
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Columna 1: Información de la Aplicación */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Información de la Aplicación
              </h2>
            </div>
            <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
              {/* App ID */}
              <div className="flex items-start gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">ID de la aplicación</p>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-mono break-all">{application.id}</p>
                </div>
              </div>

              {/* Publisher */}
              <div className="flex items-start gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Publisher</p>
                  <p className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">{application.publisher}</p>
                </div>
              </div>

              {/* Latest Release */}
              {application.latestReleaseVersion && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Última versión (Release)</p>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium font-mono">{application.latestReleaseVersion}</p>
                    {application.latestReleaseDate && (
                      <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {new Date(application.latestReleaseDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Latest Prerelease */}
              {application.latestPrereleaseVersion && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Última versión (Prerelease)</p>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium font-mono">{application.latestPrereleaseVersion}</p>
                    {application.latestPrereleaseDate && (
                      <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {new Date(application.latestPrereleaseDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* GitHub Repository */}
              {application.githubUrl && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Repositorio GitHub</p>
                    <a
                      href={application.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-mono flex items-center gap-1 break-all"
                    >
                      {application.githubRepoName}
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna 2: Estadísticas */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Estadísticas
              </h2>
            </div>
            <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Total instalaciones</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{installations.length}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Clientes</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {new Set(installations.map(i => i.customerId)).size}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Entornos activos</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {installations.filter(i => i.environmentStatus === "Active").length}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Instalaciones desactualizadas</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {countOutdatedInstallations(application.latestReleaseVersion, installations)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Instalaciones */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap w-full sm:w-auto">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <span className="hidden sm:inline">Instalaciones por Cliente</span>
              <span className="sm:hidden">Instalaciones</span>
              <span className="ml-0.5 sm:ml-1 px-1.5 py-0.5 text-[10px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                {filteredInstallations.length}
              </span>
            </h2>
            
            {/* Filtro de solo desactualizadas */}
            <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showOnlyOutdated}
                onChange={(e) => setShowOnlyOutdated(e.target.checked)}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 bg-gray-100 dark:bg-gray-700 border-orange-300 dark:border-orange-600 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
              />
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Solo desactualizadas
              </span>
            </label>
          </div>
          
          <button
            type="button"
            onClick={refetchInstallations}
            disabled={installationsLoading}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-center"
          >
            {installationsLoading ? (
              <>
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Actualizando...
              </>
            ) : (
              <>
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </>
            )}
          </button>
        </div>
        <div className="p-3 sm:p-4 md:p-5">
          <InstallationsByCustomer 
            installations={filteredInstallations}
            isLoading={installationsLoading}
            latestVersion={application.latestReleaseVersion || undefined}
          />
        </div>
      </div>
    </div>
  );
}
