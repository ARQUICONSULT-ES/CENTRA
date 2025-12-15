import { useState, useEffect, useRef, useCallback } from "react";
import { GitHubRepository } from "@/types/github";
import { RepoExtraInfo } from "../types";
import { fetchBatchReleases } from "../services/releaseService";
import { fetchBatchWorkflows } from "../services/workflowService";

interface UseRepoExtraInfoReturn {
  extraInfo: Record<string, RepoExtraInfo>;
  isLoadingReleases: boolean;
  isLoadingWorkflows: boolean;
  loadWorkflows: () => Promise<void>;
  resetExtraInfo: () => void;
}

/**
 * Hook para gestionar la carga de información adicional de repositorios
 * (releases y workflows)
 */
export function useRepoExtraInfo(repos: GitHubRepository[]): UseRepoExtraInfoReturn {
  const [extraInfo, setExtraInfo] = useState<Record<string, RepoExtraInfo>>({});
  const [isLoadingReleases, setIsLoadingReleases] = useState(false);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const hasLoadedReleases = useRef(false);

  // Cargar releases automáticamente cuando se obtienen los repos
  useEffect(() => {
    if (repos.length === 0 || hasLoadedReleases.current) return;
    
    hasLoadedReleases.current = true;
    setIsLoadingReleases(true);
    
    const loadReleases = async () => {
      try {
        const repoRequests = repos.map((repo) => {
          const [owner, repoName] = repo.full_name.split("/");
          return { owner, repo: repoName };
        });

        const releasesData = await fetchBatchReleases(repoRequests);
        const updated: Record<string, RepoExtraInfo> = {};
        
        for (const [key, value] of Object.entries(releasesData)) {
          updated[key] = {
            release: value.release,
            workflow: null,
          };
        }
        
        setExtraInfo(updated);
      } catch (error) {
        console.error("Error fetching releases:", error);
      } finally {
        setIsLoadingReleases(false);
      }
    };

    loadReleases();
  }, [repos]);

  // Función para cargar workflows manualmente
  const loadWorkflows = useCallback(async () => {
    if (repos.length === 0) return;
    
    setIsLoadingWorkflows(true);
    try {
      const repoRequests = repos.map((repo) => {
        const [owner, repoName] = repo.full_name.split("/");
        return { owner, repo: repoName };
      });

      const workflowsData = await fetchBatchWorkflows(repoRequests);
      
      setExtraInfo((prev) => {
        const updated = { ...prev };
        for (const [key, value] of Object.entries(workflowsData)) {
          updated[key] = {
            ...updated[key],
            workflow: value.workflow,
          };
        }
        return updated;
      });
    } catch (error) {
      console.error("Error fetching workflows:", error);
    } finally {
      setIsLoadingWorkflows(false);
    }
  }, [repos]);

  const resetExtraInfo = useCallback(() => {
    setExtraInfo({});
    hasLoadedReleases.current = false;
  }, []);

  return {
    extraInfo,
    isLoadingReleases,
    isLoadingWorkflows,
    loadWorkflows,
    resetExtraInfo,
  };
}
