import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GitHubRepository } from "@/types/github";
import { dataCache, CACHE_KEYS } from "../../shared/utils/cache";

interface UseReposReturn {
  repos: GitHubRepository[];
  isLoading: boolean;
  error: string | null;
  needsToken: boolean;
  fetchRepos: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook para gestionar la carga de repositorios desde la API de GitHub
 */
export function useRepos(): UseReposReturn {
  const router = useRouter();
  
  // Usar ref para rastrear si ya hicimos el fetch inicial
  const hasFetchedRef = useRef(false);
  // Ref para el router para evitar re-renders
  const routerRef = useRef(router);
  
  // Mantener la ref actualizada
  useEffect(() => {
    routerRef.current = router;
  }, [router]);
  
  const [repos, setRepos] = useState<GitHubRepository[]>(() => {
    // Intentar cargar desde cache al inicializar
    return dataCache.get<GitHubRepository[]>(CACHE_KEYS.REPOS) || [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    // Si hay datos en cache, no mostrar loading
    return !dataCache.has(CACHE_KEYS.REPOS);
  });
  const [error, setError] = useState<string | null>(null);
  const [needsToken, setNeedsToken] = useState(false);

  const fetchRepos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNeedsToken(false);
    
    try {
      const res = await fetch("/api/github/repos");
      
      if (res.status === 401) {
        const data = await res.json();
        if (data.error?.includes("GitHub token")) {
          setNeedsToken(true);
          setError("Se requiere un token de GitHub para acceder a los repositorios");
          return;
        }
        routerRef.current.push("/");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al cargar repositorios");
      }

      const data = await res.json();
      
      // La respuesta ahora incluye { repos, githubAvatar }
      // El avatar se actualiza en el servidor, no necesitamos actualizar la sesión aquí
      // ya que causa bucles infinitos de re-renders
      const repositories = data.repos || data;
      setRepos(repositories);
      // Guardar en cache
      dataCache.set(CACHE_KEYS.REPOS, repositories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, []); // Sin dependencias porque usamos refs

  useEffect(() => {
    // Evitar múltiples llamadas en modo desarrollo (React strict mode)
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    // Siempre cargar los repos al montar el componente para verificar el token
    fetchRepos();
  }, [fetchRepos]);

  return {
    repos,
    isLoading,
    error,
    needsToken,
    fetchRepos,
    refetch: fetchRepos,
  };
}
