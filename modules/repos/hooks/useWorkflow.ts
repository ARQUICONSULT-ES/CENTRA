import { useState, useCallback } from "react";
import { WorkflowStatus } from "@/modules/repos/types";
import { 
  fetchWorkflowStatus as fetchWorkflowStatusService, 
  triggerWorkflow as triggerWorkflowService 
} from "@/modules/repos/services/workflowService";

interface TriggerWorkflowParams {
  owner: string;
  repo: string;
  workflow: string;
  ref: string;
  inputs?: Record<string, string>;
}

interface UseWorkflowReturn {
  workflowStatus: WorkflowStatus | null;
  isLoading: boolean;
  isTriggering: boolean;
  error: string | null;
  fetchStatus: (owner: string, repo: string) => Promise<void>;
  trigger: (params: TriggerWorkflowParams) => Promise<{ success: boolean; error?: string }>;
  reset: () => void;
}

/**
 * Hook para gestionar operaciones relacionadas con workflows de GitHub Actions
 */
export function useWorkflow(): UseWorkflowReturn {
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (owner: string, repo: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const status = await fetchWorkflowStatusService(owner, repo);
      setWorkflowStatus(status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al obtener estado del workflow";
      setError(errorMessage);
      console.error("Error fetching workflow status:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const trigger = useCallback(async (params: TriggerWorkflowParams) => {
    setIsTriggering(true);
    setError(null);
    
    try {
      const result = await triggerWorkflowService(params);
      
      if (!result.success) {
        setError(result.error || "Error al ejecutar workflow");
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al ejecutar workflow";
      setError(errorMessage);
      console.error("Error triggering workflow:", err);
      return { success: false, error: errorMessage };
    } finally {
      setIsTriggering(false);
    }
  }, []);

  const reset = useCallback(() => {
    setWorkflowStatus(null);
    setIsLoading(false);
    setIsTriggering(false);
    setError(null);
  }, []);

  return {
    workflowStatus,
    isLoading,
    isTriggering,
    error,
    fetchStatus,
    trigger,
    reset,
  };
}
