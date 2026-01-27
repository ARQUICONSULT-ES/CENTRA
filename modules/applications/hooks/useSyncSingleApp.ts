import { useState } from "react";
import type { Application } from "@/modules/applications/types";

interface UseSyncSingleAppReturn {
  syncApplication: () => Promise<void>;
  isSyncing: boolean;
  error: string | null;
  success: boolean;
}

export function useSyncSingleApp(
  applicationId: string,
  onSuccess?: (updatedApp: Application) => void
): UseSyncSingleAppReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const syncApplication = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`/api/applications/${applicationId}/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al sincronizar aplicación");
      }

      setSuccess(true);
      
      if (onSuccess && data.application) {
        onSuccess(data.application);
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
    syncApplication,
    isSyncing,
    error,
    success,
  };
}
