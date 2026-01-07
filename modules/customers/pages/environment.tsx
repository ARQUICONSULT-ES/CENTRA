"use client";

import { useRef, useState } from "react";
import EnvironmentList from "@/modules/customers/components/EnvironmentList";
import { EnvironmentListSkeleton } from "@/modules/customers/components/EnvironmentCardSkeleton";
import { EnvironmentFilterPanel } from "@/modules/customers/components/EnvironmentFilterPanel";
import type { EnvironmentListRef } from "@/modules/customers/components/EnvironmentList";
import { useAllEnvironments } from "@/modules/customers/hooks/useAllEnvironments";
import { useEnvironmentFilter } from "@/modules/customers/hooks/useEnvironmentFilter";
import { useTenants } from "@/modules/customers/hooks/useTenants";
import { useToast } from "@/modules/shared/hooks/useToast";
import ToastContainer from "@/modules/shared/components/ToastContainer";

export function EnvironmentsPage() {
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  const { tenants, fetchTenants } = useTenants();
  const { environments, loading, isRefreshing, error, reload } = useAllEnvironments();
  const {
    filteredEnvironments,
    searchQuery,
    setSearchQuery,
    advancedFilters,
    updateAdvancedFilters,
    clearAdvancedFilters,
  } = useEnvironmentFilter(environments);

  const environmentListRef = useRef<EnvironmentListRef>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const handleRefresh = async () => {
    await reload();
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    
    try {
      const { syncAllEnvironments } = await import("../services/environmentService");
      const result = await syncAllEnvironments();
      
      await reload();
      await fetchTenants();
      
      if (result.failed === 0) {
        success(`Sincronización completada con éxito: ${result.success}/${result.total} tenants sincronizados`);
      } else {
        const errorMessages = result.errors.map(e => `- ${e.customerName}: ${e.error}`).join('\n');
        warning(`Sincronización completada con errores:\nExitosos: ${result.success}\nFallidos: ${result.failed}\n\nDetalles:\n${errorMessages}`);
      }
    } catch (err) {
      console.error("Error syncing all environments:", err);
      showError(`Error al sincronizar los entornos: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSyncingAll(false);
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
          Error al cargar entornos
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

  const activeEnvironments = environments.filter(env => env.status?.toLowerCase() !== 'softdeleted').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Entornos
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
          {activeEnvironments} entornos activos • {tenants.length} tenants
        </p>
      </div>

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
            placeholder="Buscar entornos..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <button
          onClick={handleSyncAll}
          disabled={isSyncingAll}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-wait rounded-lg transition-colors whitespace-nowrap"
          title="Sincronizar todos los entornos desde Business Central"
        >
          {isSyncingAll ? (
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

      <EnvironmentFilterPanel
        environments={environments}
        filters={advancedFilters}
        onFilterChange={updateAdvancedFilters}
        onClearFilters={clearAdvancedFilters}
      />

      {loading ? (
        <EnvironmentListSkeleton count={9} />
      ) : filteredEnvironments.length > 0 ? (
        <EnvironmentList ref={environmentListRef} environments={filteredEnvironments} />
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? `No se encontraron entornos con "${searchQuery}"` : "No hay entornos"}
          </p>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}