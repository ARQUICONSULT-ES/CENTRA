import { useState, useCallback } from "react";
import { ReleaseInfo, Commit } from "@/modules/repos/types";
import { 
  fetchLatestRelease as fetchLatestReleaseService,
  fetchCompareCommits as fetchCompareCommitsService 
} from "@/modules/repos/services/releaseService";

interface UseReleaseReturn {
  latestRelease: ReleaseInfo | null;
  commits: Commit[];
  isLoading: boolean;
  isLoadingCommits: boolean;
  error: string | null;
  fetchLatest: (owner: string, repo: string) => Promise<void>;
  fetchCommits: (owner: string, repo: string, base: string, head: string) => Promise<void>;
  reset: () => void;
}

/**
 * Hook para gestionar operaciones relacionadas con releases de GitHub
 */
export function useRelease(): UseReleaseReturn {
  const [latestRelease, setLatestRelease] = useState<ReleaseInfo | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = useCallback(async (owner: string, repo: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const release = await fetchLatestReleaseService(owner, repo);
      setLatestRelease(release);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al obtener release";
      setError(errorMessage);
      console.error("Error fetching latest release:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCommits = useCallback(async (
    owner: string, 
    repo: string, 
    base: string, 
    head: string
  ) => {
    setIsLoadingCommits(true);
    setError(null);
    
    try {
      const fetchedCommits = await fetchCompareCommitsService(owner, repo, base, head);
      setCommits(fetchedCommits);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al obtener commits";
      setError(errorMessage);
      console.error("Error fetching commits:", err);
    } finally {
      setIsLoadingCommits(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLatestRelease(null);
    setCommits([]);
    setIsLoading(false);
    setIsLoadingCommits(false);
    setError(null);
  }, []);

  return {
    latestRelease,
    commits,
    isLoading,
    isLoadingCommits,
    error,
    fetchLatest,
    fetchCommits,
    reset,
  };
}
