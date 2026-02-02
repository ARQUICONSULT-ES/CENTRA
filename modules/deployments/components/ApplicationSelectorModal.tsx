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

  if (!isOpen) return null;

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
      // Extraer owner y repo del githubRepoName (formato: "owner/repo")
      console.log(`[Modal] githubRepoName: "${app.githubRepoName}"`);
      const parts = app.githubRepoName.split('/');
      const owner = parts[0]?.trim();
      const repo = parts[1]?.trim();
      
      console.log(`[Modal] Owner: "${owner}", Repo: "${repo}"`);
      
      if (!owner || !repo) {
        throw new Error(`Formato inválido de repositorio: "${app.githubRepoName}"`);
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
                              <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
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
                              <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
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
                              ? "bg-purple-600 text-white shadow-sm"
                              : hasPrerelease
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-700 dark:hover:text-purple-300"
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
                              ? "bg-orange-600 text-white shadow-sm"
                              : hasGithubRepo
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:text-orange-700 dark:hover:text-orange-300"
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
                  {pullRequests.map((pr) => (
                    <button
                      key={pr.id}
                      onClick={() => handleSelectPR(pr.number)}
                      className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-600 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-colors text-left"
                    >
                      <div className="flex items-start gap-3">
                        {/* PR Icon */}
                        <div className="flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>

                        {/* PR Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              #{pr.number}
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {pr.title}
                            </span>
                            {pr.draft && (
                              <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                Draft
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <img
                                src={pr.user.avatar_url}
                                alt={pr.user.login}
                                className="w-4 h-4 rounded-full"
                              />
                              {pr.user.login}
                            </span>
                            <span>{pr.head.ref} → {pr.base.ref}</span>
                            <span>
                              {new Date(pr.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Arrow Icon */}
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
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
