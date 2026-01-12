import { useState } from "react";

interface SyncResults {
  total: number;
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ repo: string; error: string }>;
}

interface UseSyncFromGitHubReturn {
  syncFromGitHub: () => Promise<void>;
  isSyncing: boolean;
  syncResults: SyncResults | null;
  error: string | null;
}

export function useSyncFromGitHub(onSuccess?: () => void): UseSyncFromGitHubReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncFromGitHub = async () => {  
    try {
      setIsSyncing(true);
      setError(null);
      setSyncResults(null);

      const response = await fetch("/api/applications/sync-github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al sincronizar aplicaciones");
      }

      setSyncResults(data.results);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error en sincronización:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncFromGitHub,
    isSyncing,
    syncResults,
    error,
  };
}
