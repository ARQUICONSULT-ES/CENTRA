import { useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GitHubRepository } from "@/types/github";

interface UseRepoFilterReturn {
  filteredRepos: GitHubRepository[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

/**
 * Hook para gestionar el filtrado de repositorios
 * Siempre ordena por fecha de actualización (recientes primero)
 */
export function useRepoFilter(repos: GitHubRepository[]): UseRepoFilterReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Inicializar desde URL
  const initialSearchQuery = searchParams.get('search') || '';

  const [searchQuery, setSearchQueryState] = useState(initialSearchQuery);

  // Función para actualizar la URL
  const updateUrl = useCallback((params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [searchParams, router]);

  // Wrapper que actualiza la URL
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    updateUrl({ search: query });
  }, [updateUrl]);

  const filteredRepos = useMemo(() => {
    let result = [...repos];

    // Filtrar por nombre (espacios se convierten en guiones)
    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.trim().toLowerCase().replace(/\s+/g, "-");
      result = result.filter((repo) =>
        repo.name.toLowerCase().includes(normalizedQuery)
      );
    }

    // Ordenar siempre por fecha de actualización (recientes primero)
    result.sort((a, b) => {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return result;
  }, [repos, searchQuery]);

  return {
    filteredRepos,
    searchQuery,
    setSearchQuery,
  };
}
