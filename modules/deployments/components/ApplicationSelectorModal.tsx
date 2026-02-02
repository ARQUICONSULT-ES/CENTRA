"use client";

import { useState } from "react";
import type { Application } from "@/modules/applications/types";
import type { VersionType } from "../types";
import type { GitHubPullRequest } from "@/types/github";

interface AppSelection {
  app: Application;
  versionType: VersionType;
  prNumber?: number; // Número del PR cuando versionType es 'pullrequest'
}

interface ApplicationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: Application[];
  onSelectApplications: (apps: Array<{ app: Application; versionType: VersionType; prNumber?: number }>) => void;
  selectedApplicationIds: string[];
  installedAppIds: string[];
}

export function ApplicationSelectorModal({
  isOpen,
  onClose,
  applications,
  onSelectApplications,
  selectedApplicationIds,
  installedAppIds,
}: ApplicationSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApps, setSelectedApps] = useState<Map<string, AppSelection>>(new Map());
  const [showOnlyInstalled, setShowOnlyInstalled] = useState(true);
  
  // Estado para el sub-modal de PRs
  const [prModalOpen, setPrModalOpen] = useState(false);
  const [currentAppForPR, setCurrentAppForPR] = useState<Application | null>(null);
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([]);
  const [loadingPRs, setLoadingPRs] = useState(false);
  const [prError, setPrError] = useState<string | null>(null);

  // Resetear estado cuando el modal se cierra
  if (!isOpen) {
    // Ejecutar cleanup cuando el modal no está visible
    if (selectedApps.size > 0 || searchQuery || prModalOpen) {
      setTimeout(() => {
        setSelectedApps(new Map());
        setSearchQuery("");
        setPrModalOpen(false);
        setCurrentAppForPR(null);
        setPullRequests([]);
      }, 0);
    }
    return null;
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.publisher.toLowerCase().includes(searchQuery.toLowerCase());
    const notAlreadySelected = !selectedApplicationIds.includes(app.id);
    const matchesInstalledFilter = !showOnlyInstalled || installedAppIds.includes(app.id);
    
    return matchesSearch && notAlreadySelected && matchesInstalledFilter;
  });

  const handleToggleVersion = (app: Application, versionType: VersionType) => {
    // Si es pullrequest, abrir el modal de selección de PR
    if (versionType === 'pullrequest') {
      openPRModal(app);
      return;
    }

    setSelectedApps(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(app.id);
      
      // Si ya está seleccionado con el mismo tipo, lo deseleccionamos
      if (existing && existing.versionType === versionType) {
        newMap.delete(app.id);
      } else {
        // Si no existe o tiene diferente tipo, lo seleccionamos con el nuevo tipo
        newMap.set(app.id, { app, versionType });
      }
      
      return newMap;
    });
  };

  const openPRModal = async (app: Application) => {
    setCurrentAppForPR(app);
    setPrModalOpen(true);
    setLoadingPRs(true);
    setPrError(null);

    try {
      // Extraer owner y repo - primero intentar desde githubUrl, luego desde githubRepoName
      let owner = '';
      let repo = app.githubRepoName;

      if (app.githubUrl) {
        // Extraer owner y repo de URL como: https://github.com/owner/repo
        const match = app.githubUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
        if (match) {
          owner = match[1];
          repo = match[2].replace(/\.git$/, ''); // Remover .git si existe
        }
      }

      // Si githubRepoName ya incluye el owner (formato owner/repo), usarlo
      if (!owner && app.githubRepoName.includes('/')) {
        const parts = app.githubRepoName.split('/');
        owner = parts[0]?.trim() || '';
        repo = parts[1]?.trim() || repo;
      }
      
      console.log(`[Modal] githubUrl: "${app.githubUrl}", githubRepoName: "${app.githubRepoName}"`);
      console.log(`[Modal] Owner: "${owner}", Repo: "${repo}"`);
      
      if (!owner || !repo) {
        throw new Error(`No se pudo determinar el owner del repositorio: "${app.githubRepoName}". Verifica que la aplicación tenga una URL de GitHub válida.`);
      }
      
      const url = `/api/github/pull-requests?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`;
      console.log(`[Modal] Fetching: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Modal] Error response:`, errorText);
        throw new Error('Error al obtener pull requests');
      }

      const prs: GitHubPullRequest[] = await response.json();
      setPullRequests(prs);
    } catch (error) {
      console.error('Error loading PRs:', error);
      setPrError('No se pudieron cargar los Pull Requests');
      setPullRequests([]);
    } finally {
      setLoadingPRs(false);
    }
  };

  const handleSelectPR = (prNumber: number) => {
    if (!currentAppForPR) return;

    setSelectedApps(prev => {
      const newMap = new Map(prev);
      newMap.set(currentAppForPR.id, {
        app: currentAppForPR,
        versionType: 'pullrequest',
        prNumber
      });
      return newMap;
    });

    setPrModalOpen(false);
    setCurrentAppForPR(null);
  };

  const handleConfirm = () => {
    if (selectedApps.size > 0) {
      onSelectApplications(Array.from(selectedApps.values()));
      setSelectedApps(new Map());
      setSearchQuery("");
    }
    onClose();
  };

  const handleCancel = () => {
    setSelectedApps(new Map());
    setSearchQuery("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Seleccionar Aplicación
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
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
              placeholder="Buscar aplicación por nombre o publisher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Filter: Mostrar solo instaladas */}
          <label className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border cursor-pointer transition-colors mt-3 ${
            showOnlyInstalled
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600"
              : "border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
          }`}>
            <input
              type="checkbox"
              checked={showOnlyInstalled}
              onChange={(e) => setShowOnlyInstalled(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white border-blue-500 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className={`text-xs font-medium ${
              showOnlyInstalled
                ? "text-blue-700 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-300"
            }`}>
              Mostrar solo instaladas
            </span>
          </label>
        </div>

        {/* Application List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p>
                {searchQuery
                  ? "No se encontraron aplicaciones"
                  : "Todas las aplicaciones ya están seleccionadas"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredApplications.map((app) => {
                const selection = selectedApps.get(app.id);
                const isReleaseSelected = selection?.versionType === 'release';
                const isPrereleaseSelected = selection?.versionType === 'prerelease';
                const isPRSelected = selection?.versionType === 'pullrequest';
                const hasRelease = !!app.latestReleaseVersion;
                const hasPrerelease = !!app.latestPrereleaseVersion;
                const hasGithubRepo = !!app.githubRepoName;
                
                return (
                  <div
                    key={app.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      selection
                        ? "border-blue-500 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Logo */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden shadow-sm">
                        {app.logoBase64 ? (
                          <img
                            src={app.logoBase64.startsWith('data:') ? app.logoBase64 : `data:image/png;base64,${app.logoBase64}`}
                            alt={app.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-white font-semibold text-sm">${app.name.substring(0, 2).toUpperCase()}</span>`;
                              }
                            }}
                          />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {app.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {app.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {app.publisher}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {app.latestReleaseVersion && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                v{app.latestReleaseVersion}
                              </span>
                              {app.latestReleaseDate && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(app.latestReleaseDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                          {app.latestPrereleaseVersion && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">
                                v{app.latestPrereleaseVersion}
                              </span>
                              {app.latestPrereleaseDate && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(app.latestPrereleaseDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Version Selection Buttons */}
                      <div className="flex-shrink-0 flex flex-col gap-2">
                        {/* Release Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleVersion(app, 'release');
                          }}
                          disabled={!hasRelease}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isReleaseSelected
                              ? "bg-blue-600 text-white shadow-sm"
                              : hasRelease
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
                          }`}
                          title={!hasRelease ? "No hay release disponible" : "Seleccionar release"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Release {hasRelease ? app.latestReleaseVersion : "--"}
                        </button>

                        {/* Prerelease Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleVersion(app, 'prerelease');
                          }}
                          disabled={!hasPrerelease}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isPrereleaseSelected
                              ? "bg-orange-600 text-white shadow-sm"
                              : hasPrerelease
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:text-orange-700 dark:hover:text-orange-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
                          }`}
                          title={!hasPrerelease ? "No hay prerelease disponible" : "Seleccionar prerelease"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Prerelease {hasPrerelease ? app.latestPrereleaseVersion : "--"}
                        </button>

                        {/* Pull Request Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleVersion(app, 'pullrequest');
                          }}
                          disabled={!hasGithubRepo}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isPRSelected
                              ? "bg-purple-600 text-white shadow-sm"
                              : hasGithubRepo
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-700 dark:hover:text-purple-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
                          }`}
                          title={!hasGithubRepo ? "No hay repositorio configurado" : "Seleccionar Pull Request"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          Pull Request {isPRSelected && selection?.prNumber ? `#${selection.prNumber}` : ""}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedApps.size > 0 ? (
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {selectedApps.size} aplicación{selectedApps.size !== 1 ? 'es' : ''} seleccionada{selectedApps.size !== 1 ? 's' : ''}
                </span>
              ) : (
                <span>Selecciona una versión para añadir</span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedApps.size === 0}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirmar ({selectedApps.size})
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Modal: Pull Request Selector */}
      {prModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[70vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Seleccionar Pull Request
                  </h3>
                  {currentAppForPR && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {currentAppForPR.name} - {currentAppForPR.githubRepoName}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setPrModalOpen(false);
                    setCurrentAppForPR(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingPRs ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : prError ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-red-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 dark:text-red-400">{prError}</p>
                </div>
              ) : pullRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <p>No hay Pull Requests abiertos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pullRequests.map((pr) => {
                    // Calcular tiempo relativo
                    const now = new Date();
                    const created = new Date(pr.created_at);
                    const diffMs = now.getTime() - created.getTime();
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    
                    let timeAgo = '';
                    if (diffDays > 0) {
                      timeAgo = `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
                    } else if (diffHours > 0) {
                      timeAgo = `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
                    } else {
                      timeAgo = 'hace un momento';
                    }

                    // Determinar si el PR es seleccionable (solo si los checks pasaron)
                    const isDisabled = pr.checks?.conclusion === 'failure' || pr.checks?.conclusion === 'pending';

                    return (
                      <button
                        key={pr.id}
                        onClick={() => !isDisabled && handleSelectPR(pr.number)}
                        disabled={isDisabled}
                        className={`w-full p-3 rounded-lg border text-left transition-colors ${
                          isDisabled
                            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed'
                            : 'border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-600 hover:bg-green-50/50 dark:hover:bg-green-900/20'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* PR Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"/>
                            </svg>
                          </div>

                          {/* PR Info */}
                          <div className="flex-1 min-w-0">
                            {/* Title con check status */}
                            <div className="flex items-start gap-2 mb-1">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex-1 flex items-center gap-1.5">
                                <span>{pr.title}</span>
                                <a
                                  href={pr.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                                  title="Abrir PR en GitHub"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </h4>
                              {/* Check status icon */}
                              {pr.checks?.conclusion === 'success' && (
                                <span className="flex-shrink-0 text-green-600 dark:text-green-400" title="All checks passed">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
                                  </svg>
                                </span>
                              )}
                              {pr.checks?.conclusion === 'pending' && (
                                <span className="flex-shrink-0 flex items-center justify-center w-4 h-4" title="Checks in progress">
                                  <span 
                                    className="w-2 h-2 rounded-full animate-pulse" 
                                    style={{ backgroundColor: '#d29922' }}
                                  />
                                </span>
                              )}
                              {pr.checks?.conclusion === 'failure' && (
                                <span className="flex-shrink-0 text-red-600 dark:text-red-400" title="Some checks failed">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/>
                                  </svg>
                                </span>
                              )}
                            </div>

                            {/* Metadata line */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                #{pr.number}
                              </span>
                              <span>
                                abierto hace {timeAgo}
                              </span>
                              <span className="flex items-center gap-1">
                                por
                                <img
                                  src={pr.user.avatar_url}
                                  alt={pr.user.login}
                                  className="w-3.5 h-3.5 rounded-full inline-block"
                                  title={pr.user.login}
                                />
                                <span className="font-medium">{pr.user.login}</span>
                              </span>
                              {pr.draft && (
                                <>
                                  <span>•</span>
                                  <span className="text-gray-500 dark:text-gray-500 font-medium">
                                    Draft
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Branch info */}
                            <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-500">
                              <span className="font-mono bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-1 py-0.5 rounded text-[11px]">
                                {pr.head.ref}
                              </span>
                              <span className="mx-1">→</span>
                              <span className="font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1 py-0.5 rounded text-[11px]">
                                {pr.base.ref}
                              </span>
                            </div>
                          </div>

                          {/* Arrow Icon */}
                          <div className="flex-shrink-0">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setPrModalOpen(false);
                  setCurrentAppForPR(null);
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
