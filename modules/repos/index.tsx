"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { RepoList } from "./components/RepoList";
import { GitHubRepository } from "@/types/github";
import type { RepoListHandle } from "./types";

type SortOption = "updated" | "name";

function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
      </div>
      <div className="h-5 bg-gray-700 rounded w-20"></div>
      <div className="flex items-center gap-2 mt-auto">
        <div className="flex-1 h-9 bg-gray-700 rounded-md"></div>
        <div className="w-9 h-9 bg-gray-700 rounded-md"></div>
      </div>
    </div>
  );
}

export function ReposPage() {
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [isLoadingCICD, setIsLoadingCICD] = useState(false);
  const repoListRef = useRef<RepoListHandle>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const res = await fetch("/api/github/repos");
      
      if (res.status === 401) {
        router.push("/");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al cargar repositorios");
      }

      const data = await res.json();
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadCICD = async () => {
    if (repoListRef.current) {
      setIsLoadingCICD(true);
      await repoListRef.current.fetchWorkflows();
      setIsLoadingCICD(false);
    }
  };

  const filteredAndSortedRepos = useMemo(() => {
    let result = [...repos];

    // Filtrar por nombre (espacios se convierten en guiones)
    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.trim().toLowerCase().replace(/\s+/g, "-");
      result = result.filter((repo) =>
        repo.name.toLowerCase().includes(normalizedQuery)
      );
    }

    // Ordenar
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "updated":
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return result;
  }, [repos, searchQuery, sortBy]);

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
          <div className="h-10 bg-gray-700 rounded-lg w-48 animate-pulse"></div>
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
          onClick={() => {
            setError(null);
            setIsLoading(true);
            fetchRepos();
          }}
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
          Mis Repositorios
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {searchQuery 
            ? `${filteredAndSortedRepos.length} de ${repos.length} repositorios`
            : `${repos.length} repositorios`
          }
        </p>
      </div>

      {/* Buscador y ordenacion */}
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
            placeholder="Buscar repositorios..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Ordenar:</span>
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
            </div>
          </div>
          
          <button
            onClick={handleLoadCICD}
            disabled={isLoadingCICD}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-wait rounded-lg transition-colors whitespace-nowrap"
            title="Cargar estado CI/CD de los repositorios"
          >
            {isLoadingCICD ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            CI/CD
          </button>
        </div>
      </div>

      {/* Lista de repositorios */}
      {filteredAndSortedRepos.length > 0 ? (
        <RepoList ref={repoListRef} repos={filteredAndSortedRepos} allRepos={repos} />
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
    </div>
  );
}

// ==================== RE-EXPORTS ====================

// Components
export { RepoList } from "./components/RepoList";
export { RepoCard } from "./components/RepoCard";
export { DependenciesModal } from "./components/DependenciesModal";

// Types
export type {
  WorkflowStatus,
  ReleaseInfo,
  RepoExtraInfo,
  RepoCardProps,
  Commit,
  RepoListProps,
  RepoListHandle,
  AppDependencyProbingPath,
  FileDependency,
  AppDependency,
  AppFileManifestDependency,
  AppFileManifest,
  AppFileDependencyInfo,
  MissingDependencyInfo,
  MissingFileDependencyInfo,
  DependencyTreeNode,
  RepoDependencies,
  DependenciesModalProps,
  SaveStep,
  AddRepoModalProps,
  AddFileModalProps,
} from "./types";

export { languageColors } from "./types";

// Services
export {
  fetchWorkflowStatus,
  fetchBatchWorkflows,
  triggerWorkflow,
} from "./services/workflowService";

export {
  fetchLatestRelease,
  fetchBatchReleases,
  fetchCompareCommits,
} from "./services/releaseService";

export {
  fetchFileContent,
  fetchBranches,
  fetchFileDependencies,
  fetchRepoDependencies,
  analyzeAppFile,
  updateSettings,
  uploadDependency,
  deleteDependency,
} from "./services/dependenciesService";

export {
  getNextMinorVersion,
  getRelativeTime,
  formatFileSize,
  parseRepoUrl,
  getRepoName,
} from "./services/utils";
