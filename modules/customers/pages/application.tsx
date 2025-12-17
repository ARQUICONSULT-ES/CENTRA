"use client";

import { useState } from "react";
import { ApplicationsList } from "@/modules/customers/components/ApplicationsList";
import { ApplicationListSkeleton } from "@/modules/customers/components/ApplicationCardSkeleton";
import { useAllApplications } from "@/modules/customers/hooks/useAllApplications";
import { syncAllApplications } from "@/modules/customers/services/applicationService";

export function ApplicationsPage() {
  const { applications, loading, isRefreshing, error, reload } = useAllApplications();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEnvironmentType, setFilterEnvironmentType] = useState<"all" | "Production" | "Sandbox">("all");
  const [hideMicrosoftApps, setHideMicrosoftApps] = useState(true);
  const [isSyncingApps, setIsSyncingApps] = useState(false);

  const handleRefresh = async () => {
    await reload();
  };

  const handleSyncApplications = async () => {
    setIsSyncingApps(true);
    
    try {
      const result = await syncAllApplications();
      
      // Recargar los datos después de la sincronización
      await reload();
      
      // Mostrar notificación de éxito
      if (result.failed === 0) {
        alert(`✅ Sincronización completada con éxito: ${result.success}/${result.total} entornos sincronizados`);
      } else {
        const errorMessages = result.errors.map(e => `- ${e.customerName} (${e.environmentName}): ${e.error}`).join('\n');
        alert(`⚠️ Sincronización completada con errores:\n✅ Exitosos: ${result.success}\n❌ Fallidos: ${result.failed}\n\nDetalles:\n${errorMessages}`);
      }
    } catch (error) {
      console.error("Error syncing all applications:", error);
      alert(`❌ Error al sincronizar las aplicaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
          Error al cargar aplicaciones
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

  // Filtrar aplicaciones
  const filteredApps = applications.filter((app) => {
    // Filtro de búsqueda
    const matchesSearch = searchQuery === "" || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.environmentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de tipo de entorno
    const matchesEnvironmentType = filterEnvironmentType === "all" || 
      app.environmentType === filterEnvironmentType;
    
    // Filtro para ocultar apps de Microsoft
    const matchesMicrosoftFilter = !hideMicrosoftApps || 
      app.publisher.toLowerCase() !== "microsoft";
    
    return matchesSearch && matchesEnvironmentType && matchesMicrosoftFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Aplicaciones
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {applications.length} aplicaciones en total
          </p>
        </div>
      </div>

      {/* Barra de herramientas */}
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
            placeholder="Buscar aplicaciones por nombre, publisher, cliente o entorno..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <select
          value={filterEnvironmentType}
          onChange={(e) => setFilterEnvironmentType(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos los tipos de entorno</option>
          <option value="Production">Production</option>
          <option value="Sandbox">Sandbox</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideMicrosoftApps}
            onChange={(e) => setHideMicrosoftApps(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Ocultar apps Microsoft
          </span>
        </label>

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-wait rounded-lg transition-colors whitespace-nowrap"
            title="Actualizar"
          >
            {isRefreshing ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Actualizar
          </button>

          <button
            onClick={handleSyncApplications}
            disabled={isSyncingApps}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-wait rounded-lg transition-colors whitespace-nowrap"
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
      </div>

      {/* Contenido */}
      {loading ? (
        <ApplicationListSkeleton count={12} />
      ) : filteredApps.length > 0 ? (
        <ApplicationsList applications={filteredApps} isLoading={loading} />
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? `No se encontraron aplicaciones con "${searchQuery}"` : "No hay aplicaciones"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Haz clic en "Sincronizar Todos" para obtener las aplicaciones de Business Central
          </p>
        </div>
      )}
    </div>
  );
}
