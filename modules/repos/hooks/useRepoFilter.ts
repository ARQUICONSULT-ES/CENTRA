import { useMemo, useState } from "react";
import { GitHubRepository } from "@/types/github";

type SortOption = "updated" | "name";

interface UseRepoFilterReturn {
  filteredRepos: GitHubRepository[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
}

/**
 * Hook para gestionar el filtrado y ordenamiento de repositorios
 */
export function useRepoFilter(repos: GitHubRepository[]): UseRepoFilterReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");

  const filteredRepos = useMemo(() => {
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

  return {
    filteredRepos,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  };
}
