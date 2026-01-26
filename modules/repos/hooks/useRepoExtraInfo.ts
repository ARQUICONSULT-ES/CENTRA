import { useState, useEffect, useRef, useCallback } from "react";
import { GitHubRepository } from "@/types/github";
import { RepoExtraInfo } from "@/modules/repos/types";
import { fetchBatchRepoInfo } from "@/modules/repos/services/batchInfoService";
import { dataCache, CACHE_KEYS } from "@/modules/shared/utils/cache";

interface UseRepoExtraInfoReturn {
  extraInfo: Record<string, RepoExtraInfo>;
  isLoading: boolean;
  loadWorkflows: () => Promise<void>;
  resetExtraInfo: () => void;
}

/**
 * Hook para gestionar la carga de información adicional de repositorios
 * (releases, workflows, PRs, branches)
 */
export function useRepoExtraInfo(repos: GitHubRepository[]): UseRepoExtraInfoReturn {
  const [extraInfo, setExtraInfo] = useState<Record<string, RepoExtraInfo>>(() => {
    // Intentar cargar desde cache al inicializar
    return dataCache.get<Record<string, RepoExtraInfo>>(CACHE_KEYS.REPO_EXTRA_INFO) || {};
  });
  const [isLoading, setIsLoading] = useState(false);
  const hasLoadedData = useRef<boolean>(dataCache.has(CACHE_KEYS.REPO_EXTRA_INFO));

  // Cargar toda la información automáticamente cuando se obtienen los repos
  useEffect(() => {
    if (repos.length === 0 || hasLoadedData.current) return;
    
    hasLoadedData.current = true;
    setIsLoading(true);
    
    const loadRepoInfo = async () => {
      try {
        const repoRequests = repos.map((repo) => {
          const [owner, repoName] = repo.full_name.split("/");
          return { owner, repo: repoName };
        });

        const repoInfoData = await fetchBatchRepoInfo(repoRequests);
        console.log('[useRepoExtraInfo] Batch info response:', repoInfoData);
        console.log('[useRepoExtraInfo] Total repos with data:', Object.keys(repoInfoData).length);
        
        setExtraInfo(repoInfoData);
        // Guardar en cache
        dataCache.set(CACHE_KEYS.REPO_EXTRA_INFO, repoInfoData);
      } catch (error) {
        console.error("Error fetching repo info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRepoInfo();
  }, [repos]);

  // Función para recargar workflows manualmente (mantener compatibilidad)
  const loadWorkflows = useCallback(async () => {
    if (repos.length === 0) return;
    
    setIsLoading(true);
    try {
      const repoRequests = repos.map((repo) => {
        const [owner, repoName] = repo.full_name.split("/");
        return { owner, repo: repoName };
      });

      const repoInfoData = await fetchBatchRepoInfo(repoRequests);
      
      setExtraInfo(repoInfoData);
      // Guardar en cache
      dataCache.set(CACHE_KEYS.REPO_EXTRA_INFO, repoInfoData);
    } catch (error) {
      console.error("Error fetching repo info:", error);
    } finally {
      setIsLoading(false);
    }
  }, [repos]);

  const resetExtraInfo = useCallback(() => {
    setExtraInfo({});
    hasLoadedData.current = false;
    // Invalidar cache
    dataCache.invalidate(CACHE_KEYS.REPO_EXTRA_INFO);
  }, []);

  return {
    extraInfo,
    isLoading,
    loadWorkflows,
    resetExtraInfo,
  };
}
