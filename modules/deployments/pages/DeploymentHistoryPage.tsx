"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDeploymentHistory } from "../hooks/useDeploymentHistory";
import { DeploymentHistoryCard } from "../components/DeploymentHistoryCard";
import { useCustomers } from "@/modules/customers/hooks/useCustomers";
import { useAllEnvironments } from "@/modules/customers/hooks/useAllEnvironments";
import { useApplications } from "@/modules/applications/hooks/useApplications";
import { FilterDropdown } from "@/modules/shared/components/FilterDropdown";
import type { DeploymentHistoryFilters } from "../types/history";

export function DeploymentHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customers } = useCustomers();
  const { environments } = useAllEnvironments();
  const { applications } = useApplications();

  // Obtener filtros de URL
  const [filters, setFilters] = useState<DeploymentHistoryFilters>({
    customerId: searchParams.get("customerId") || undefined,
    tenantId: searchParams.get("tenantId") || undefined,
    environmentName: searchParams.get("environmentName") || undefined,
    applicationId: searchParams.get("applicationId") || undefined,
  });

  const { deployments, loading, error, reload } = useDeploymentHistory(filters);

  // Actualizar URL cuando cambian los filtros
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.customerId) params.set("customerId", filters.customerId);
    if (filters.tenantId) params.set("tenantId", filters.tenantId);
    if (filters.environmentName) params.set("environmentName", filters.environmentName);
    if (filters.applicationId) params.set("applicationId", filters.applicationId);

    const queryString = params.toString();
    router.push(`/deployments/history${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [filters, router]);

  const handleFilterChange = (key: keyof DeploymentHistoryFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  // Obtener entornos filtrados por cliente y tenant
  const filteredEnvironments = environments.filter((env) => {
    if (filters.customerId && env.customerId !== filters.customerId) return false;
    if (filters.tenantId && env.tenantId !== filters.tenantId) return false;
    return true;
  });

  // Obtener tenants únicos de los entornos filtrados
  const uniqueTenants = Array.from(
    new Set(
      environments
        .filter((env) => !filters.customerId || env.customerId === filters.customerId)
        .map((env) => JSON.stringify({ id: env.tenantId, description: env.tenantDescription }))
    )
  ).map((str) => JSON.parse(str));

  // Crear mapas para conversión de IDs a nombres
  const customerIdToName = new Map(customers.map(c => [c.id, c.customerName]));
  const tenantIdToDescription = new Map(uniqueTenants.map(t => [t.id, t.description || t.id]));
  const appIdToName = new Map(applications.map(a => [a.id, a.name]));

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
          Error al cargar el histórico
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={reload}
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
          <Link
            href="/deployments"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Volver a Deployments"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Histórico de Deployments
          </h1>
          <button
            onClick={reload}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-wait rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Actualizar"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {deployments.length} deployment{deployments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filtro de Cliente */}
        <FilterDropdown
          label="Cliente"
          value={filters.customerId ? customerIdToName.get(filters.customerId) || "" : ""}
          onChange={(value) => {
            const customerId = customers.find(c => c.customerName === value)?.id || "";
            handleFilterChange("customerId", customerId);
            // Reset dependent filters
            setFilters((prev) => ({
              customerId: customerId || undefined,
              tenantId: undefined,
              environmentName: undefined,
              applicationId: prev.applicationId,
            }));
          }}
          options={customers.map(c => c.customerName)}
          placeholder="Todos"
        />

        {/* Filtro de Tenant */}
        {filters.customerId && (
          <FilterDropdown
            label="Tenant"
            value={filters.tenantId ? tenantIdToDescription.get(filters.tenantId) || "" : ""}
            onChange={(value) => {
              const tenantId = uniqueTenants.find(t => (t.description || t.id) === value)?.id || "";
              handleFilterChange("tenantId", tenantId);
              // Reset environment filter
              setFilters((prev) => ({
                ...prev,
                tenantId: tenantId || undefined,
                environmentName: undefined,
              }));
            }}
            options={uniqueTenants.map(t => t.description || t.id)}
            placeholder="Todos"
          />
        )}

        {/* Filtro de Entorno */}
        {filters.tenantId && (
          <FilterDropdown
            label="Entorno"
            value={filters.environmentName || ""}
            onChange={(value) => handleFilterChange("environmentName", value)}
            options={filteredEnvironments.map(e => e.name)}
            placeholder="Todos"
          />
        )}

        {/* Filtro de Aplicación */}
        <FilterDropdown
          label="Aplicación"
          value={filters.applicationId ? appIdToName.get(filters.applicationId) || "" : ""}
          onChange={(value) => {
            const appId = applications.find(a => a.name === value)?.id || "";
            handleFilterChange("applicationId", appId);
          }}
          options={applications.map(a => a.name)}
          placeholder="Todas"
        />

        {/* Botón de restablecer filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Restablecer
          </button>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && deployments.length === 0 ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="flex gap-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : deployments.length > 0 ? (
        <div className="space-y-4">
          {deployments.map((deployment) => (
            <DeploymentHistoryCard key={deployment.id} deployment={deployment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            {hasActiveFilters
              ? "No se encontraron deployments con los filtros seleccionados"
              : "No hay deployments registrados"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
