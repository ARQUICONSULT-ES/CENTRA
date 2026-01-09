"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/modules/shared/hooks/useToast";
import ToastContainer from "@/modules/shared/components/ToastContainer";
import { FilterDropdown } from "@/modules/shared/components/FilterDropdown";
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

interface EnvironmentDetailPageProps {
  tenantId: string;
  environmentName: string;
}

interface AppFilters {
  hideMicrosoftApps: boolean;
  showOnlyOutdated: boolean;
  publisher?: string;
  publishedAs?: string;
}

export function EnvironmentDetailPage({ tenantId, environmentName }: EnvironmentDetailPageProps) {
  const router = useRouter();
  const { toasts, removeToast, error: showError } = useToast();
  const [environment, setEnvironment] = useState<EnvironmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [latestVersions, setLatestVersions] = useState<Record<string, string>>({});
  const [showCompareModal, setShowCompareModal] = useState(false);
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
  const [filters, setFilters] = useState<AppFilters>({
    hideMicrosoftApps: true,
    showOnlyOutdated: false,
  });

  useEffect(() => {
    loadEnvironment();
    loadLatestVersions();
  }, [tenantId, environmentName]);

  const loadEnvironment = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/environments/${encodeURIComponent(tenantId)}/${encodeURIComponent(environmentName)}`
      );
      
      if (!response.ok) {
        throw new Error("Error al cargar el entorno");
      }

      const data = await response.json();
      setEnvironment(data);
    } catch (err) {
      console.error("Error loading environment:", err);
      showError("No se pudo cargar la información del entorno");
    } finally {
      setLoading(false);
    }
  };

  const loadLatestVersions = async () => {
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

  const loadAvailableEnvironments = async (customerId: string) => {
    setLoadingEnvironments(true);
    try {
      const response = await fetch(`/api/environments?customerId=${customerId}`);
      if (response.ok) {
        const environments = await response.json();
        // Filtrar entornos activos y excluir el entorno actual
        const activeEnvs = environments.filter((env: any) => 
          env.status?.toLowerCase() === 'active' && 
          !(env.tenantId === tenantId && env.name === environmentName)
        );
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

  const handleCompareClick = () => {
    if (environment) {
      loadAvailableEnvironments(environment.customerId);
      setShowCompareModal(true);
    }
  };

  const handleSelectEnvironment = (compareEnv: {tenantId: string, name: string}) => {
    router.push(`/environments/${tenantId}/${environmentName}/compare/${compareEnv.tenantId}/${compareEnv.name}`);
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

  const getStateColor = (state?: string | null) => {
    const stateStr = state?.toLowerCase();
    if (stateStr === 'installed') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    } else if (stateStr === 'updating') {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
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

  const updateFilter = (key: keyof AppFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      hideMicrosoftApps: true,
      showOnlyOutdated: false,
    });
  };

  // Extract unique values for filters
  const uniquePublishers = Array.from(
    new Set(environment?.installedApps.map(app => app.publisher).filter(Boolean))
  ).sort();

  const uniquePublishedAs = Array.from(
    new Set(environment?.installedApps.map(app => app.publishedAs).filter(Boolean))
  ).sort();

  const filteredApps = environment?.installedApps.filter((app) => {
    // Text search
    const matchesSearch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.version.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Hide Microsoft apps filter
    if (filters.hideMicrosoftApps && app.publisher.toLowerCase() === 'microsoft') {
      return false;
    }

    // Show only outdated filter
    if (filters.showOnlyOutdated) {
      const latestVersion = latestVersions[app.id];
      if (!latestVersion || !isVersionOutdated(app.version, latestVersion)) {
        return false;
      }
    }

    // Publisher filter
    if (filters.publisher && app.publisher !== filters.publisher) {
      return false;
    }

    // PublishedAs filter
    if (filters.publishedAs && app.publishedAs !== filters.publishedAs) {
      return false;
    }

    return true;
  }) || [];

  const hasActiveFilters = filters.publisher || filters.publishedAs || filters.showOnlyOutdated;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Back Button Skeleton */}
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20 animate-pulse" />

        {/* Header Skeleton */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-start gap-4">
            {/* Image Skeleton */}
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />

            {/* Info Skeleton */}
            <div className="flex-1 space-y-4">
              {/* Title and badges */}
              <div className="flex items-center gap-3">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse" />
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse" />
              </div>

              {/* Subtitle */}
              <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse" />

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16 animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Apps Section Skeleton */}
        <div className="space-y-4">
          {/* Title */}
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-64 animate-pulse" />
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse" />
          </div>

          {/* Search Bar Skeleton */}
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />

          {/* Filters Skeleton */}
          <div className="flex flex-wrap items-center gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 dark:bg-gray-800 rounded-md w-32 animate-pulse" />
            ))}
          </div>

          {/* Apps Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-16 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!environment) {
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
          Entorno no encontrado
        </h3>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  const isDeleted = environment.status?.toLowerCase() === 'softdeleted';

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-start gap-4">
          {/* Customer Image */}
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xl">
            {environment.customerImage ? (
              <img 
                src={environment.customerImage} 
                alt={environment.customerName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{environment.customerName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* Environment Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <h1 className={`text-3xl font-bold text-gray-900 dark:text-white ${isDeleted ? 'line-through' : ''}`}>
                  {environment.name}
                </h1>
                {environment.type && (
                  <span className={`px-3 py-1 text-sm font-medium rounded ${getTypeColor(environment.type)}`}>
                    {environment.type}
                  </span>
                )}
                {isDeleted && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded">
                    Eliminado
                  </span>
                )}
              </div>
              {!isDeleted && (
                <button
                  onClick={handleCompareClick}
                  className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
                  title="Comparar con otro entorno"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="hidden sm:inline">Comparar</span>
                </button>
              )}
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {environment.customerName}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Status */}
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`text-sm font-medium ${
                    isDeleted
                      ? 'text-red-800 dark:text-red-400'
                      : environment.status?.toLowerCase() === 'active'
                      ? 'text-green-800 dark:text-green-400'
                      : 'text-gray-800 dark:text-gray-400'
                  }`}>
                    {environment.status || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Application Version */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">App Version</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={environment.applicationVersion || undefined}>
                    {environment.applicationVersion || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Platform Version */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Platform Version</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={environment.platformVersion || undefined}>
                    {environment.platformVersion || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ubicación</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={environment.locationName || undefined}>
                    {environment.locationName || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Installed Apps Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Aplicaciones Instaladas
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredApps.length} {filteredApps.length === environment.installedApps.length ? '' : `de ${environment.installedApps.length}`} aplicaciones
          </p>
        </div>

        {/* Search Bar and Filters */}
        {environment.installedApps.length > 0 && (
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
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
                placeholder="Buscar aplicaciones..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Hide Microsoft Apps Toggle */}
              <label className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border cursor-pointer transition-colors ${
                filters.hideMicrosoftApps
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600"
                  : "border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
              }`}>
                <input
                  type="checkbox"
                  checked={filters.hideMicrosoftApps}
                  onChange={(e) => updateFilter('hideMicrosoftApps', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white border-blue-500 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className={`text-xs font-medium ${
                  filters.hideMicrosoftApps
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}>
                  Ocultar apps Microsoft
                </span>
              </label>

              {/* Show Only Outdated Toggle */}
              <label className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border cursor-pointer transition-colors ${
                filters.showOnlyOutdated
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-600"
                  : "border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
              }`}>
                <input
                  type="checkbox"
                  checked={filters.showOnlyOutdated}
                  onChange={(e) => updateFilter('showOnlyOutdated', e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-white border-orange-500 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className={`text-xs font-medium flex items-center gap-1 ${
                  filters.showOnlyOutdated
                    ? "text-orange-700 dark:text-orange-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Solo desactualizadas
                </span>
              </label>

              {/* Publisher Filter */}
              {uniquePublishers.length > 1 && (
                <FilterDropdown
                  label="Publisher"
                  value={filters.publisher || ""}
                  onChange={(value) => updateFilter('publisher', value || undefined)}
                  options={uniquePublishers}
                  placeholder="Todos"
                />
              )}

              {/* PublishedAs Filter */}
              {uniquePublishedAs.length > 1 && (
                <FilterDropdown
                  label="Publicado como"
                  value={filters.publishedAs || ""}
                  onChange={(value) => updateFilter('publishedAs', value || undefined)}
                  options={uniquePublishedAs}
                  placeholder="Todos"
                />
              )}

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Restablecer
                </button>
              )}
            </div>
          </div>
        )}

        {/* Apps List */}
        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => {
              const latestVersion = latestVersions[app.id];
              const isOutdated = isVersionOutdated(app.version, latestVersion);
              
              return (
                <Link
                  key={app.id}
                  href={`/applications/${app.id}`}
                  className={`group relative bg-white dark:bg-gray-900 border rounded-lg p-4 hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer ${
                    isOutdated 
                      ? 'border-orange-300 dark:border-orange-600 hover:border-orange-400 dark:hover:border-orange-500 bg-orange-50/30 dark:bg-orange-900/10' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  {/* Outdated Badge */}
                  {isOutdated && (
                    <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-semibold rounded-full shadow-md">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Desactualizada
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm flex-1 pr-2 transition-colors">
                      {app.name}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${getPublishedAsColor(app.publishedAs)}`}>
                      {app.publishedAs}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Publisher */}
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span className="truncate">{app.publisher}</span>
                    </div>

                    {/* Version */}
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-mono">{app.version}</span>
                        {isOutdated && latestVersion && (
                          <>
                            <svg className="w-3 h-3 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <span className="font-mono text-green-600 dark:text-green-400 truncate">{latestVersion}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* State - solo mostrar si NO es 'installed' */}
                    {app.state && app.state.toLowerCase() !== 'installed' && (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStateColor(app.state)}`}>
                          {app.state}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : environment.installedApps.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              No hay aplicaciones instaladas en este entorno
            </p>
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron aplicaciones con &quot;{searchQuery}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Seleccionar entorno para comparar
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
                    No hay otros entornos activos disponibles para comparar
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
