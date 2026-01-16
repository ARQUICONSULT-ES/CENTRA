import { useState, useEffect } from "react";
import type { GitHubEnvironmentsResponse, GitHubEnvironmentSecret } from "@/modules/applications/types/github-environments";

interface UseGitHubEnvironmentsProps {
  owner: string | null;
  repo: string | null;
}

export function useGitHubEnvironments({ owner, repo }: UseGitHubEnvironmentsProps) {
  const [environments, setEnvironments] = useState<GitHubEnvironmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnvironments = async () => {
    if (!owner || !repo) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/github/environments?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener los entornos");
      }

      const data = await response.json();
      setEnvironments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvironments();
  }, [owner, repo]);

  return {
    environments,
    loading,
    error,
    refetch: fetchEnvironments,
  };
}

interface UseEnvironmentSecretsProps {
  owner: string | null;
  repo: string | null;
  environmentName: string | null;
}

export function useEnvironmentSecrets({ owner, repo, environmentName }: UseEnvironmentSecretsProps) {
  const [secrets, setSecrets] = useState<GitHubEnvironmentSecret[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSecrets = async () => {
    if (!owner || !repo || !environmentName) {
      setSecrets([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/github/environments/${encodeURIComponent(environmentName)}/secrets?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
      );

      if (!response.ok) {
        // Si es 404, puede que no haya secrets o no tengamos acceso
        if (response.status === 404) {
          setSecrets([]);
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener los secrets");
      }

      const data = await response.json();
      setSecrets(data.secrets || []);
    } catch (err) {
      console.error("Error fetching secrets:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setSecrets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecrets();
  }, [owner, repo, environmentName]);

  return {
    secrets,
    loading,
    error,
    refetch: fetchSecrets,
  };
}
