"use client";

import { useState, useEffect } from "react";
import { ApplicationsList } from "@/modules/customers/components/ApplicationsList";
import { ApplicationListSkeleton } from "@/modules/customers/components/ApplicationCardSkeleton";
import { ApplicationFilterPanel } from "@/modules/customers/components/ApplicationFilterPanel";
import { useAllInstalledApps } from "@/modules/customers/hooks/useAllInstalledApps";
import { useInstalledAppFilter } from "@/modules/customers/hooks/useInstalledAppFilter";
import { syncAllInstalledApps } from "@/modules/customers/services/installedAppService";
import { useToast } from "@/modules/shared/hooks/useToast";
import ToastContainer from "@/modules/shared/components/ToastContainer";
import type { Application } from "@/modules/applications/types";

export function InstalledAppsPage() {
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  const { installedApps, loading, isRefreshing, error, reload } = useAllInstalledApps();
  const [latestVersions, setLatestVersions] = useState<Record<string, string>>({});
  const {
    filteredApps,
    searchQuery,
    setSearchQuery,
    advancedFilters,
    updateAdvancedFilters,
    clearAdvancedFilters,
  } = useInstalledAppFilter(installedApps, latestVersions);
  const [isSyncingApps, setIsSyncingApps] = useState(false);

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

  const handleRefresh = async () => {
    await reload();
  };

  const handleSyncApplications = async () => {
    setIsSyncingApps(true);
    
    try {
      const result = await syncAllInstalledApps();
      
      // Recargar los datos después de la sincronización
      await reload();
      
      // Mostrar notificación de éxito
      if (result.failed === 0) {
        success(`Sincronización completada con éxito: ${result.success}/${result.total} entornos sincronizados`);
      } else {
        const errorMessages = result.errors.map(e => `- ${e.customerName} (${e.environmentName}): ${e.error}`).join('\n');
        warning(`Sincronización completada con errores:\nExitosos: ${result.success}\nFallidos: ${result.failed}\n\nDetalles:\n${errorMessages}`);
      }
    } catch (err) {
      console.error("Error syncing all installed apps:", err);
      showError(`Error al sincronizar las instalaciones: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSyncingApps(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="w-16 h-16 text-red-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Error al cargar instalaciones
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Instalaciones
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-wait rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Actualizar"
          >
            {isRefreshing ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {installedApps.length} instalaciones
        </p>
      </div>

      {/* Barra de búsqueda y botón de sincronización */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar instalaciones..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <button
          onClick={handleSyncApplications}
          disabled={isSyncingApps}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-wait rounded-lg transition-colors whitespace-nowrap"
          title="Sincronizar todas las aplicaciones desde Business Central"
        >
          {isSyncingApps ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          )}
          Sincronizar Todos
        </button>
      </div>

      {/* Panel de filtros avanzados */}
      <ApplicationFilterPanel
        installedApps={installedApps}
        filters={advancedFilters}
        onFilterChange={updateAdvancedFilters}
        onClearFilters={clearAdvancedFilters}
      />

      {/* Contenido */}
      {loading ? (
        <ApplicationListSkeleton count={12} />
      ) : filteredApps.length > 0 ? (
        <ApplicationsList applications={filteredApps} isLoading={loading} latestVersions={latestVersions} />
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? `No se encontraron instalaciones con "${searchQuery}"` : "No hay instalaciones"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Haz clic en "Sincronizar Todos" para obtener las aplicaciones de Business Central
          </p>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
