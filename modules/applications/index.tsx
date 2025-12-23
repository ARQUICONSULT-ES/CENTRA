"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApplications } from "@/modules/applications/hooks/useApplications";
import { useApplicationFilter } from "@/modules/applications/hooks/useApplicationFilter";
import { useSyncFromGitHub } from "@/modules/applications/hooks/useSyncFromGitHub";
import ApplicationList from "@/modules/applications/components/ApplicationList";
import { ApplicationFilterPanel } from "@/modules/applications/components/ApplicationFilterPanel";
import type { Application } from "@/modules/applications/types";

export function ApplicationsPage() {
  const router = useRouter();
  const { applications, isLoading, isRefreshing, refreshApplications } = useApplications();
  const {
    filteredApplications,
    searchQuery,
    setSearchQuery,
    advancedFilters,
    updateAdvancedFilters,
    clearAdvancedFilters,
  } = useApplicationFilter(applications);
  const { syncFromGitHub, isSyncing, syncResults, error: syncError } = useSyncFromGitHub(refreshApplications);
  const [showSyncResults, setShowSyncResults] = useState(false);

  const handleApplicationClick = (application: Application) => {
    router.push(`/applications/${application.id}`);
  };

  const handleRefresh = async () => {
    await refreshApplications();
  };

  const handleSyncFromGitHub = async () => {
    await syncFromGitHub();
    setShowSyncResults(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Aplicaciones
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
          {applications.length} aplicaciones en catálogo
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
            placeholder="Buscar aplicaciones por nombre, publisher o repositorio..."
            autoComplete="off"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <button
          onClick={handleSyncFromGitHub}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-wait rounded-lg transition-colors whitespace-nowrap"
          title="Sincronizar desde GitHub"
        >
          {isSyncing ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sincronizando...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Sincronizar desde GitHub
            </>
          )}
        </button>
      </div>

      {/* Panel de filtros avanzados */}
      <ApplicationFilterPanel
        applications={applications}
        filters={advancedFilters}
        onFilterChange={updateAdvancedFilters}
        onClearFilters={clearAdvancedFilters}
      />

      {/* Resultados de sincronización */}
      {showSyncResults && syncResults && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Sincronización completada
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">{syncResults.total}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Procesados:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">{syncResults.processed}</span>
                </div>
                <div>
                  <span className="text-green-600 dark:text-green-400">Creadas:</span>
                  <span className="ml-1 font-medium text-green-700 dark:text-green-300">{syncResults.created}</span>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400">Actualizadas:</span>
                  <span className="ml-1 font-medium text-blue-700 dark:text-blue-300">{syncResults.updated}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Omitidas:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">{syncResults.skipped}</span>
                </div>
              </div>
              {syncResults.errors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                    Errores ({syncResults.errors.length}):
                  </p>
                  <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 max-h-32 overflow-y-auto">
                    {syncResults.errors.map((err, idx) => (
                      <li key={idx}>• {err.repo}: {err.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowSyncResults(false)}
              className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error de sincronización */}
      {syncError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
                  Error en la sincronización
                </h3>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">{syncError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido */}
      {isLoading ? (
        <ApplicationList applications={[]} isLoading={true} onApplicationClick={handleApplicationClick} />
      ) : filteredApplications.length > 0 ? (
        <ApplicationList applications={filteredApplications} isLoading={false} onApplicationClick={handleApplicationClick} />
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery || advancedFilters.name || advancedFilters.publisher
              ? "No se encontraron aplicaciones con los filtros aplicados"
              : "No hay aplicaciones en el catálogo"}
          </p>
        </div>
      )}
    </div>
  );
}
