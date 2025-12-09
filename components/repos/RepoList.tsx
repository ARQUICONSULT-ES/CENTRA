"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { GitHubRepository } from "@/types/github";
import { RepoCard, RepoExtraInfo } from "./RepoCard";

interface RepoListProps {
  repos: GitHubRepository[];
}

export interface RepoListHandle {
  fetchWorkflows: () => Promise<void>;
  isLoadingWorkflows: boolean;
}

export const RepoList = forwardRef<RepoListHandle, RepoListProps>(({ repos }, ref) => {
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

  // Exponer la función y el estado al componente padre
  useImperativeHandle(ref, () => ({
    fetchWorkflows,
    isLoadingWorkflows,
  }));

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
});

RepoList.displayName = "RepoList";
