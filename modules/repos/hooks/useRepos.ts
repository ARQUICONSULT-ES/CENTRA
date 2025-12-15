import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GitHubRepository } from "@/types/github";

interface UseReposReturn {
  repos: GitHubRepository[];
  isLoading: boolean;
  error: string | null;
  fetchRepos: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook para gestionar la carga de repositorios desde la API de GitHub
 */
export function useRepos(): UseReposReturn {
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchRepos = async () => {
    setIsLoading(true);
    setError(null);
    
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

  useEffect(() => {
    fetchRepos();
  }, []);

  return {
    repos,
    isLoading,
    error,
    fetchRepos,
    refetch: fetchRepos,
  };
}
