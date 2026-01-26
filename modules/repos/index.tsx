"use client";

import { useState, useEffect } from "react";
import { RepoList } from "@/modules/repos/components/RepoList";
import { GitHubTokenModal } from "@/modules/repos/components/GitHubTokenModal";
import { useRepos } from "@/modules/repos/hooks/useRepos";
import { useRepoFilter } from "@/modules/repos/hooks/useRepoFilter";
import { useToast } from "@/modules/shared/hooks/useToast";
import ToastContainer from "@/modules/shared/components/ToastContainer";

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      <div className="flex items-center gap-2 mt-auto">
        <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      </div>
    </div>
  );
}

export function ReposPage() {
  const { toasts, removeToast } = useToast();
  const { repos, isLoading, error, fetchRepos, needsToken } = useRepos();
  const { 
    filteredRepos: filteredAndSortedRepos, 
    searchQuery, 
    setSearchQuery,
  } = useRepoFilter(repos);
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Mostrar modal si se necesita el token
  useEffect(() => {
    if (needsToken && !isLoading) {
      setShowTokenModal(true);
    }
  }, [needsToken, isLoading]);

  const handleSaveToken = async (token: string) => {
    try {
      const response = await fetch("/api/users/me/github-token", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ githubToken: token }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al guardar el token");
      }

      // Recargar los repositorios
      await fetchRepos();
      setShowTokenModal(false);
    } catch (error) {
      throw error;
    }
  };

  // Si se necesita token, mostrar solo el modal (sin otros errores)
  if (needsToken) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Administración de repositorios
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Configura tu token de GitHub para acceder a tus repositorios
          </p>
        </div>

        {/* Mensaje informativo */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Token de GitHub requerido
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
            Para acceder a tus repositorios de GitHub, necesitas configurar un token personal de acceso.
            Haz clic en el botón de abajo para comenzar.
          </p>
          <button
            onClick={() => setShowTokenModal(true)}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Configurar Token de GitHub
          </button>
        </div>

        {/* Modal para configurar GitHub Token */}
        <GitHubTokenModal
          isOpen={showTokenModal}
          onClose={() => setShowTokenModal(false)}
          onSave={handleSaveToken}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>

        {/* Search and sort skeleton */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 animate-pulse"></div>
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
          Error al cargar repositorios
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={fetchRepos}
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
          Administración de repositorios
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {searchQuery 
            ? `${filteredAndSortedRepos.length} de ${repos.length} repositorios`
            : `${repos.length} repositorios`
          }
        </p>
      </div>

      {/* Buscador */}
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
          placeholder="Buscar repositorios..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Lista de repositorios */}
      {filteredAndSortedRepos.length > 0 ? (
        <RepoList repos={filteredAndSortedRepos} allRepos={repos} />
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            No se encontraron repositorios con "{searchQuery}"
          </p>
        </div>
      )}

      {/* Modal para configurar GitHub Token */}
      <GitHubTokenModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onSave={handleSaveToken}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
