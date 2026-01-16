"use client";

import { useState, useEffect } from "react";
import type { GitHubEnvironment } from "@/modules/applications/types/github-environments";
import { AddGitHubEnvironmentModal } from "./AddGitHubEnvironmentModal";
import { useToast } from "@/modules/shared/hooks/useToast";
import ToastContainer from "@/modules/shared/components/ToastContainer";

interface GitHubEnvironmentsListProps {
  environments: GitHubEnvironment[];
  owner: string;
  repo: string;
  onEnvironmentDeleted: () => void;
}

export function GitHubEnvironmentsList({
  environments,
  owner,
  repo,
  onEnvironmentDeleted,
}: GitHubEnvironmentsListProps) {
  const [deletingEnv, setDeletingEnv] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [envToDelete, setEnvToDelete] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  // Escuchar evento para abrir modal
  useEffect(() => {
    const handleOpenModal = () => setShowAddModal(true);
    window.addEventListener('openAddEnvironmentModal', handleOpenModal);
    return () => window.removeEventListener('openAddEnvironmentModal', handleOpenModal);
  }, []);

  const openDeleteModal = (envName: string) => {
    setEnvToDelete(envName);
    setShowDeleteModal(true); 
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setEnvToDelete(null);
  };

  const handleDeleteEnvironment = async () => {
    if (!envToDelete) return;

    setDeletingEnv(envToDelete);

    try {
      const response = await fetch(
        `/api/github/environments/${encodeURIComponent(envToDelete)}?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el entorno");
      }

      closeDeleteModal();
      success(`Entorno "${envToDelete}" eliminado exitosamente`);
      onEnvironmentDeleted();
    } catch (err) {
      error(err instanceof Error ? err.message : "Error al eliminar el entorno");
    } finally {
      setDeletingEnv(null);
    }
  };

  const getDeploymentType = (envName: string): "manual" | "auto" => {
    return envName.includes("(Production)") ? "manual" : "auto";
  };

  const handleAddEnvironments = async (selectedEnvironments: { tenantId: string; environmentName: string; customerName: string }[], mode: 'manual' | 'auto') => {
    if (selectedEnvironments.length === 0) {
      alert("No se seleccionó ningún entorno");
      return;
    }

    const env = selectedEnvironments[0];
    
    // Construir el nombre del entorno según el modo
    // Si es manual deploy: "Entorno (Production)"
    // Si no es manual: solo "Entorno"
    const githubEnvName = mode === 'manual' 
      ? `${env.environmentName} (Production)` 
      : env.environmentName;

    try {
      // Crear el entorno en GitHub
      const response = await fetch('/api/github/create-environment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner,
          repo,
          environmentName: githubEnvName,
          tenantId: env.tenantId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el entorno en GitHub");
      }

      const responseData = await response.json();
      
      const modeText = mode === 'manual' ? 'Manual deploy' : 'Auto-deploy';
      let message = `Entorno "${githubEnvName}" creado exitosamente con modo ${modeText}`;
      
      // Mostrar warning si existe
      if (responseData.warning) {
        message += `. Aviso: ${responseData.warning}`;
      }
      
      success(message);
      
      // Recargar la lista de entornos
      onEnvironmentDeleted();
    } catch (err) {
      error(err instanceof Error ? err.message : "Error al crear el entorno");
      console.error("Error al crear entorno en GitHub:", err);
    }
  };

  return (
    <>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Modal para añadir entornos */}
      <AddGitHubEnvironmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddEnvironments}
        owner={owner}
        repo={repo}
      />

      {environments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No hay entornos configurados en este repositorio
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {environments.map((env) => {
            const deploymentType = getDeploymentType(env.name);
            return (
              <div
                key={env.id}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <svg
                      className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {env.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0 ${
                        deploymentType === "auto"
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {deploymentType === "manual" ? "Manual deploy" : "Auto-deploy"}
                    </span>
                    <button
                      onClick={() => openDeleteModal(env.name)}
                      disabled={deletingEnv === env.name}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                      title="Eliminar entorno github"
                    >
                      {deletingEnv === env.name ? (
                        <svg
                          className="w-4 h-4 animate-spin"
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
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Creado:</span>{" "}
                    {new Date(env.created_at).toLocaleDateString("es-ES")}
                  </div>
                  <div>
                    <span className="font-medium">Actualizado:</span>{" "}
                    {new Date(env.updated_at).toLocaleDateString("es-ES")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Eliminar entorno github
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    ¿Estás seguro de que deseas eliminar el entorno github?
                  </p>
                  <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded mt-2">
                    {envToDelete}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
              <button
                onClick={closeDeleteModal}
                disabled={deletingEnv !== null}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteEnvironment}
                disabled={deletingEnv !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deletingEnv ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
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
                    Eliminando...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Eliminar entorno github
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
