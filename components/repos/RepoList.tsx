"use client";

import { useState, useEffect, useRef } from "react";
import { GitHubRepository } from "@/types/github";
import { RepoCard, RepoExtraInfo } from "./RepoCard";

interface RepoListProps {
  repos: GitHubRepository[];
}

export function RepoList({ repos }: RepoListProps) {
  const [extraInfo, setExtraInfo] = useState<Record<string, RepoExtraInfo>>({});
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [isLoadingReleases, setIsLoadingReleases] = useState(false);
  const hasLoadedReleases = useRef(false);

  // Cargar releases automáticamente cuando se obtienen los repos
  useEffect(() => {
    if (repos.length === 0 || hasLoadedReleases.current) return;
    
    hasLoadedReleases.current = true;
    setIsLoadingReleases(true);
    
    const fetchReleases = async () => {
      try {
        const repoRequests = repos.map((repo) => {
          const [owner, repoName] = repo.full_name.split("/");
          return { owner, repo: repoName };
        });

        const releasesRes = await fetch("/api/github/batch-releases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repos: repoRequests }),
        });

        if (releasesRes.ok) {
          const data = await releasesRes.json();
          const updated: Record<string, RepoExtraInfo> = {};
          
          for (const [key, value] of Object.entries(data.data)) {
            updated[key] = {
              release: (value as { release: RepoExtraInfo["release"] }).release,
              workflow: null,
            };
          }
          
          setExtraInfo(updated);
        }
      } catch (error) {
        console.error("Error fetching releases:", error);
      } finally {
        setIsLoadingReleases(false);
      }
    };

    fetchReleases();
  }, [repos]);

  // Cargar workflows manualmente con el botón
  const fetchWorkflows = async () => {
    if (repos.length === 0) return;
    
    setIsLoadingWorkflows(true);
    try {
      const repoRequests = repos.map((repo) => {
        const [owner, repoName] = repo.full_name.split("/");
        return { owner, repo: repoName };
      });

      const workflowsRes = await fetch("/api/github/batch-workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repos: repoRequests }),
      });

      if (workflowsRes.ok) {
        const data = await workflowsRes.json();
        
        setExtraInfo((prev) => {
          const updated = { ...prev };
          for (const [key, value] of Object.entries(data.data)) {
            updated[key] = {
              ...updated[key],
              workflow: (value as { workflow: RepoExtraInfo["workflow"] }).workflow,
            };
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Error fetching workflows:", error);
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  if (repos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No se encontraron repositorios
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Parece que no tienes repositorios aún.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Botón para cargar estado CI/CD */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={fetchWorkflows}
          disabled={isLoadingWorkflows}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-wait rounded-md transition-colors"
        >
          {isLoadingWorkflows ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {isLoadingWorkflows ? "Cargando..." : `Cargar estado CI/CD (${repos.length})`}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {repos.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            preloadedInfo={extraInfo[repo.full_name]}
            skipIndividualFetch={true}
            isLoadingRelease={isLoadingReleases}
          />
        ))}
      </div>
    </div>
  );
}
