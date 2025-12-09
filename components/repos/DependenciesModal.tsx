"use client";

import { useState, useEffect } from "react";

interface AppDependencyProbingPath {
  repo: string;
  version: string;
  release_status: string;
  authTokenSecret?: string;
  projects?: string;
}

interface AppDependency {
  id: string;
  name: string;
  publisher: string;
  version: string;
}

interface DependenciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: string;
  repo: string;
}

export function DependenciesModal({ isOpen, onClose, owner, repo }: DependenciesModalProps) {
  const [settingsData, setSettingsData] = useState<{
    appDependencyProbingPaths: AppDependencyProbingPath[];
  } | null>(null);
  const [appJsonData, setAppJsonData] = useState<{
    dependencies: AppDependency[];
  } | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isLoadingAppJson, setIsLoadingAppJson] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [appJsonError, setAppJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
      fetchAppJson();
    }
  }, [isOpen, owner, repo]);

  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    setSettingsError(null);
    try {
      const res = await fetch(
        `/api/github/file-content?owner=${owner}&repo=${repo}&path=.AL-Go/settings.json&ref=main`
      );
      
      if (res.status === 404) {
        setSettingsError("Archivo .AL-Go/settings.json no encontrado");
        setSettingsData(null);
      } else if (res.ok) {
        const data = await res.json();
        setSettingsData(data.content);
      } else {
        throw new Error("Error al obtener settings.json");
      }
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const fetchAppJson = async () => {
    setIsLoadingAppJson(true);
    setAppJsonError(null);
    try {
      const res = await fetch(
        `/api/github/file-content?owner=${owner}&repo=${repo}&path=app.json&ref=main`
      );
      
      if (res.status === 404) {
        setAppJsonError("Archivo app.json no encontrado");
        setAppJsonData(null);
      } else if (res.ok) {
        const data = await res.json();
        setAppJsonData(data.content);
      } else {
        throw new Error("Error al obtener app.json");
      }
    } catch (error) {
      setAppJsonError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsLoadingAppJson(false);
    }
  };

  // Extraer nombre del repo de la URL
  const getRepoName = (repoUrl: string): string => {
    const match = repoUrl.match(/github\.com\/[^/]+\/([^/@]+)/);
    return match ? match[1] : repoUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-[90vw] max-w-6xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Dependencias CI/CD - {repo}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Split view */}
        <div className="flex-1 overflow-hidden grid grid-cols-2 divide-x divide-gray-700">
          {/* Left side - AL-Go/settings.json */}
          <div className="flex flex-col overflow-hidden">
            <div className="p-3 bg-gray-900/50 border-b border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <code className="text-xs bg-gray-700 px-2 py-0.5 rounded">.AL-Go/settings.json</code>
              </h3>
              <p className="text-xs text-gray-500 mt-1">appDependencyProbingPaths</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingSettings ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm">Cargando...</span>
                  </div>
                </div>
              ) : settingsError ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">{settingsError}</p>
                  </div>
                </div>
              ) : settingsData?.appDependencyProbingPaths && settingsData.appDependencyProbingPaths.length > 0 ? (
                <div className="space-y-3">
                  {settingsData.appDependencyProbingPaths.map((dep, index) => (
                    <div 
                      key={index}
                      className="bg-gray-900 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-blue-400 truncate">
                            {getRepoName(dep.repo)}
                          </h4>
                          <p className="text-xs text-gray-500 truncate mt-0.5" title={dep.repo}>
                            {dep.repo}
                          </p>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400">
                          {dep.version}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          {dep.release_status}
                        </span>
                        {dep.projects && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            </svg>
                            {dep.projects}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-sm text-gray-500">Sin dependencias CI/CD configuradas</p>
                  </div>
                </div>
              )}
            </div>

            {/* Counter */}
            <div className="p-2 border-t border-gray-700 bg-gray-900/30">
              <p className="text-xs text-gray-500 text-center">
                {settingsData?.appDependencyProbingPaths?.length || 0} dependencia(s)
              </p>
            </div>
          </div>

          {/* Right side - app.json */}
          <div className="flex flex-col overflow-hidden">
            <div className="p-3 bg-gray-900/50 border-b border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <code className="text-xs bg-gray-700 px-2 py-0.5 rounded">app.json</code>
              </h3>
              <p className="text-xs text-gray-500 mt-1">dependencies</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingAppJson ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm">Cargando...</span>
                  </div>
                </div>
              ) : appJsonError ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">{appJsonError}</p>
                  </div>
                </div>
              ) : appJsonData?.dependencies && appJsonData.dependencies.length > 0 ? (
                <div className="space-y-3">
                  {appJsonData.dependencies.map((dep, index) => (
                    <div 
                      key={index}
                      className="bg-gray-900 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-purple-400">
                            {dep.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {dep.publisher}
                          </p>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 text-xs font-medium rounded bg-purple-500/20 text-purple-400">
                          v{dep.version}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-400 font-mono">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          {dep.id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-sm text-gray-500">Sin dependencias de app</p>
                  </div>
                </div>
              )}
            </div>

            {/* Counter */}
            <div className="p-2 border-t border-gray-700 bg-gray-900/30">
              <p className="text-xs text-gray-500 text-center">
                {appJsonData?.dependencies?.length || 0} dependencia(s)
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
