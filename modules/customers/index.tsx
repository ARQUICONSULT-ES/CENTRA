"use client";

import { useRef } from "react";
import { TenantList } from "./components/TenantList";
import type { TenantListHandle } from "./types";
import { useTenants } from "./hooks/useTenants";
import { useTenantFilter } from "./hooks/useTenantFilter";

function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
      </div>
      <div className="h-5 bg-gray-700 rounded w-20"></div>
      <div className="flex items-center gap-4">
        <div className="h-4 bg-gray-700 rounded w-24"></div>
        <div className="h-4 bg-gray-700 rounded w-28"></div>
      </div>
      <div className="mt-auto pt-2 border-t border-gray-700">
        <div className="h-3 bg-gray-700 rounded w-32"></div>
      </div>
    </div>
  );
}

export function TenantsPage() {
  const { tenants, isLoading, error, fetchTenants } = useTenants();
  const {
    filteredTenants,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  } = useTenantFilter(tenants);
  const tenantListRef = useRef<TenantListHandle>(null);

  const handleRefresh = async () => {
    if (tenantListRef.current) {
      await tenantListRef.current.refreshTenants();
    }
    await fetchTenants();
  };

  const isRefreshing = tenantListRef.current?.isRefreshing ?? false;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-32"></div>
        </div>

        {/* Search and sort skeleton */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-10 bg-gray-700 rounded-lg w-64 animate-pulse"></div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

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
          Error al cargar tenants
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={fetchTenants}
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tenants
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {searchQuery
            ? `${filteredTenants.length} de ${tenants.length} tenants`
            : `${tenants.length} tenants`}
        </p>
      </div>

      {/* Buscador y ordenación */}
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
            placeholder="Buscar tenants..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Ordenar:
            </span>
            <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setSortBy("updated")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  sortBy === "updated"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Recientes
              </button>
              <button
                onClick={() => setSortBy("name")}
                className={`px-3 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-700 transition-colors ${
                  sortBy === "name"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Nombre
              </button>
              <button
                onClick={() => setSortBy("tenant")}
                className={`px-3 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-700 transition-colors ${
                  sortBy === "tenant"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Tenant
              </button>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-wait rounded-lg transition-colors whitespace-nowrap"
            title="Actualizar lista de tenants"
          >
            {isRefreshing ? (
              <svg
                className="w-3.5 h-3.5 animate-spin"
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
            ) : (
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            Actualizar
          </button>
        </div>
      </div>

      {/* Lista de tenants */}
      {filteredTenants.length > 0 ? (
        <TenantList ref={tenantListRef} tenants={filteredTenants} />
      ) : (
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            No se encontraron tenants con "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}
