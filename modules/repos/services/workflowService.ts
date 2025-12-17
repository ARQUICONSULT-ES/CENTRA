import { WorkflowStatus } from "@/modules/repos/types";

const GITHUB_API_BASE = "/api/github";

/**
 * Obtiene el estado del último workflow de un repositorio
 */
export async function fetchWorkflowStatus(
  owner: string,
  repoName: string
): Promise<WorkflowStatus | null> {
  try {
    const res = await fetch(
      `${GITHUB_API_BASE}/workflow-status?owner=${owner}&repo=${repoName}`
    );
    
    if (res.ok) {
      const data = await res.json();
      return data.workflow;
    }
    return null;
  } catch (error) {
    console.error("Error fetching workflow status:", error);
    return null;
  }
}

/**
 * Obtiene los estados de workflows en batch para múltiples repositorios
 */
export async function fetchBatchWorkflows(
  repoRequests: Array<{ owner: string; repo: string }>
): Promise<Record<string, { workflow: WorkflowStatus | null }>> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/batch-workflows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repos: repoRequests }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
    return {};
  } catch (error) {
    console.error("Error fetching batch workflows:", error);
    return {};
  }
}

/**
 * Ejecuta un workflow de GitHub
 */
export async function triggerWorkflow(params: {
  owner: string;
  repo: string;
  workflow: string;
  ref: string;
  inputs?: Record<string, string>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/trigger-workflow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error || "Error al ejecutar workflow" };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
