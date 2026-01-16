"use client";

import { useState, useEffect } from "react";

interface GitHubEnvironment {
  name: string;
  url: string;
  id: number;
}

interface PublishToEnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: string;
  repo: string;
  onPublish: (appVersion: string, environmentName: string) => Promise<void>;
}

export function PublishToEnvironmentModal({
  isOpen,
  onClose,
  owner,
  repo,
  onPublish,
}: PublishToEnvironmentModalProps) {
  const [appVersion, setAppVersion] = useState<string>("current");
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("");
  const [environments, setEnvironments] = useState<GitHubEnvironment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && owner && repo) {
      loadEnvironments();
    }
  }, [isOpen, owner, repo]);

  const loadEnvironments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/github/environments?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener los entornos");
      }

      const data = await response.json();
      setEnvironments(data.environments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEnvironment) {
      setError("Debes seleccionar un entorno");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onPublish(appVersion, selectedEnvironment);
      onClose();
      // Reset form
      setAppVersion("current");
      setSelectedEnvironment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const versions = [
    { 
      value: "latest", 
      label: "Latest", 
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", 
      description: "Última release",
      color: "blue"
    },
    { 
      value: "prerelease", 
      label: "Prerelease", 
      icon: "M13 10V3L4 14h7v7l9-11h-7z", 
      description: "Última pre-release",
      color: "orange"
    },
    { 
      value: "current", 
      label: "Current", 
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", 
      description: "Última compilación (main)",
      color: "green"
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Publicar a Entorno
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Selecciona la versión y el entorno de destino
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-600 rounded-r-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* App Version Selector - Buttons */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Versión de la Aplicación
            </label>
            <div className="grid grid-cols-3 gap-3">
              {versions.map((version) => {
                const isSelected = appVersion === version.value;
                const colorClasses = {
                  blue: {
                    border: isSelected ? "border-blue-500" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                    bg: isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800",
                    iconActive: "text-blue-600 dark:text-blue-400",
                    iconInactive: "text-gray-400 dark:text-gray-500",
                    textActive: "text-blue-700 dark:text-blue-300",
                    textInactive: "text-gray-700 dark:text-gray-300",
                    checkmark: "text-blue-600 dark:text-blue-400"
                  },
                  orange: {
                    border: isSelected ? "border-orange-500" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                    bg: isSelected ? "bg-orange-50 dark:bg-orange-900/20" : "bg-white dark:bg-gray-800",
                    iconActive: "text-orange-600 dark:text-orange-400",
                    iconInactive: "text-gray-400 dark:text-gray-500",
                    textActive: "text-orange-700 dark:text-orange-300",
                    textInactive: "text-gray-700 dark:text-gray-300",
                    checkmark: "text-orange-600 dark:text-orange-400"
                  },
                  green: {
                    border: isSelected ? "border-green-500" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                    bg: isSelected ? "bg-green-50 dark:bg-green-900/20" : "bg-white dark:bg-gray-800",
                    iconActive: "text-green-600 dark:text-green-400",
                    iconInactive: "text-gray-400 dark:text-gray-500",
                    textActive: "text-green-700 dark:text-green-300",
                    textInactive: "text-gray-700 dark:text-gray-300",
                    checkmark: "text-green-600 dark:text-green-400"
                  }
                };
                const colors = colorClasses[version.color as keyof typeof colorClasses];
                
                return (
                  <button
                    key={version.value}
                    type="button"
                    onClick={() => setAppVersion(version.value)}
                    disabled={isSubmitting}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${colors.border} ${colors.bg} ${isSelected ? "shadow-md" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className={`w-8 h-8 ${isSelected ? colors.iconActive : colors.iconInactive}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={version.icon} />
                      </svg>
                      <div className="text-center">
                        <p className={`text-sm font-semibold ${isSelected ? colors.textActive : colors.textInactive}`}>
                          {version.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {version.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <svg className={`w-5 h-5 ${colors.checkmark}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Environment Selector - Cards */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Entornos de GitHub
            </label>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <svg className="w-10 h-10 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Cargando entornos...</p>
              </div>
            ) : environments.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {environments.map((env) => (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() => setSelectedEnvironment(env.name)}
                    disabled={isSubmitting}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedEnvironment === env.name
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedEnvironment === env.name
                            ? "bg-blue-100 dark:bg-blue-800"
                            : "bg-gray-100 dark:bg-gray-700"
                        }`}>
                          <svg
                            className={`w-5 h-5 ${
                              selectedEnvironment === env.name
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </div>
                        <div>
                          <p className={`font-semibold ${
                            selectedEnvironment === env.name
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-gray-900 dark:text-white"
                          }`}>
                            {env.name.replace(' (Production)', '')}
                          </p>
                        </div>
                      </div>
                      {selectedEnvironment === env.name && (
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-600 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                      No hay entornos disponibles
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                      No se encontraron entornos de GitHub para este repositorio
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedEnvironment || loading}
              className="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Publicando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Publicar Aplicación
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
