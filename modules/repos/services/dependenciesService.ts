import {
  AppDependencyProbingPath,
  FileDependency,
  RepoDependencies,
  AppFileDependencyInfo,
} from "@/modules/repos/types";

const GITHUB_API_BASE = "/api/github";

/**
 * Obtiene el contenido de un archivo del repositorio
 */
export async function fetchFileContent<T>(
  owner: string,
  repo: string,
  path: string,
  ref: string = "main"
): Promise<{ content: T | null; error?: string }> {
  try {
    const res = await fetch(
      `${GITHUB_API_BASE}/file-content?owner=${owner}&repo=${repo}&path=${path}&ref=${ref}`,
      { cache: "no-store" }
    );
    
    if (res.status === 404) {
      return { content: null, error: `Archivo ${path} no encontrado` };
    }
    
    if (res.ok) {
      const data = await res.json();
      return { content: data.content };
    }
    
    return { content: null, error: `Error al obtener ${path}` };
  } catch (error) {
    return {
      content: null,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Obtiene las ramas de un repositorio
 */
export async function fetchBranches(
  owner: string,
  repo: string
): Promise<string[]> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/branches?owner=${owner}&repo=${repo}`, {
      cache: "no-store",
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.branches || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
}

/**
 * Obtiene la lista de archivos de dependencias (.app)
 */
export async function fetchFileDependencies(
  owner: string,
  repo: string,
  ref: string = "main"
): Promise<FileDependency[]> {
  try {
    const res = await fetch(
      `${GITHUB_API_BASE}/list-dependencies?owner=${owner}&repo=${repo}&ref=${ref}`,
      { cache: "no-store" }
    );
    
    if (res.ok) {
      const data = await res.json();
      return data.files || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching file dependencies:", error);
    return [];
  }
}

/**
 * Obtiene las dependencias de un repositorio desde .AL-Go/settings.json
 */
export async function fetchRepoDependencies(
  owner: string,
  repo: string,
  ref: string = "main"
): Promise<RepoDependencies | null> {
  try {
    const res = await fetch(
      `${GITHUB_API_BASE}/repo-dependencies?owner=${owner}&repo=${repo}&ref=${ref}`,
      { cache: "no-store" }
    );
    
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (error) {
    console.error("Error fetching repo dependencies:", error);
    return null;
  }
}

/**
 * Analiza un archivo .app y extrae sus dependencias
 */
export async function analyzeAppFile(file: File): Promise<AppFileDependencyInfo> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${GITHUB_API_BASE}/analyze-app-file`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return {
        fileName: file.name,
        manifest: data.manifest,
      };
    } else {
      const errorData = await res.json();
      return {
        fileName: file.name,
        manifest: null,
        error: errorData.error || "Error al analizar archivo",
      };
    }
  } catch (error) {
    return {
      fileName: file.name,
      manifest: null,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Actualiza settings.json y crea un Pull Request
 */
export async function updateSettings(params: {
  owner: string;
  repo: string;
  baseBranch: string;
  appDependencyProbingPaths: AppDependencyProbingPath[];
}): Promise<{ success: boolean; branch?: string; pullRequestUrl?: string; error?: string }> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/update-settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error || "Error al guardar cambios" };
    }

    const data = await res.json();
    return {
      success: true,
      branch: data.branch,
      pullRequestUrl: data.pullRequestUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Sube un archivo de dependencia (.app)
 */
export async function uploadDependency(params: {
  file: File;
  owner: string;
  repo: string;
  branch: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", params.file);
    formData.append("owner", params.owner);
    formData.append("repo", params.repo);
    formData.append("branch", params.branch);

    const res = await fetch(`${GITHUB_API_BASE}/upload-dependency`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Elimina un archivo de dependencia
 */
export async function deleteDependency(params: {
  owner: string;
  repo: string;
  branch: string;
  fileName: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/delete-dependency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
