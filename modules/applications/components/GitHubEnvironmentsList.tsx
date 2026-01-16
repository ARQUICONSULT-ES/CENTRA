"use client";

import { useState } from "react";
import type { GitHubEnvironment } from "@/modules/applications/types/github-environments";

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

  const handleDeleteEnvironment = async (envName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el entorno "${envName}"?`)) {
      return;
    }

    setDeletingEnv(envName);

    try {
      const response = await fetch(
        `/api/github/environments/${encodeURIComponent(envName)}?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el entorno");
      }

      alert(`Entorno "${envName}" eliminado exitosamente`);
      onEnvironmentDeleted();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar el entorno");
    } finally {
      setDeletingEnv(null);
    }
  };

  if (environments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No hay entornos configurados en este repositorio
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {environments.map((env) => (
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
            <button
              onClick={() => handleDeleteEnvironment(env.name)}
              disabled={deletingEnv === env.name}
              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50 flex-shrink-0"
              title="Eliminar entorno"
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
      ))}
    </div>
  );
}
