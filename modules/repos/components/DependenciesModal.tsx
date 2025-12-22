"use client";

import { useState, useEffect, useCallback } from "react";
import { GitHubRepository } from "@/types/github";
import type {
  AppDependencyProbingPath,
  FileDependency,
  AppDependency,
  AppFileManifestDependency,
  AppFileManifest,
  AppFileDependencyInfo,
  MissingDependencyInfo,
  MissingFileDependencyInfo,
  DependencyTreeNode,
  RepoDependencies,
  DependenciesModalProps,
  SaveStep,
  AddRepoModalProps,
  AddFileModalProps,
} from "@/modules/repos/types";
import {
  fetchFileContent,
  fetchBranches,
  fetchFileDependencies,
  fetchRepoDependencies,
  analyzeAppFile,
  updateSettings,
  uploadDependency,
  deleteDependency,
} from "@/modules/repos/services/dependenciesService";
import { parseRepoUrl, getRepoName, formatFileSize } from "@/modules/repos/services/utils";

const LoadingSpinner = ({ text = "Cargando..." }: { text?: string }) => (
  <div className="flex items-center justify-center h-32">
    <div className="flex items-center gap-2 text-gray-400">
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span className="text-sm">{text}</span>
    </div>
  </div>
);

const EmptyState = ({ message, icon }: { message: string; icon: React.ReactNode }) => (
  <div className="flex items-center justify-center h-32">
    <div className="text-center">
      {icon}
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  </div>
);

export function DependenciesModal({ isOpen, onClose, owner, repo, allRepos }: DependenciesModalProps) {
  const [settingsData, setSettingsData] = useState<{
    appDependencyProbingPaths: AppDependencyProbingPath[];
  } | null>(null);
  const [appJsonData, setAppJsonData] = useState<{
    dependencies: AppDependency[];
  } | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isLoadingAppJson, setIsLoadingAppJson] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [appJsonError, setAppJsonError] = useState<string | null>(null);
  const [editedDependencies, setEditedDependencies] = useState<AppDependencyProbingPath[]>([]);
  const [fileDependencies, setFileDependencies] = useState<FileDependency[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [showAddRepoModal, setShowAddRepoModal] = useState(false);
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [saveStep, setSaveStep] = useState<SaveStep>({ status: 'idle' });
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [missingDependencies, setMissingDependencies] = useState<Map<string, MissingDependencyInfo>>(new Map());
  const [isResolvingDeps, setIsResolvingDeps] = useState(false);
  const [depDataMap, setDepDataMap] = useState<Map<string, RepoDependencies>>(new Map());
  const [appFileDependencies, setAppFileDependencies] = useState<Map<string, AppFileDependencyInfo>>(new Map());
  const [missingFileDependencies, setMissingFileDependencies] = useState<Map<string, MissingFileDependencyInfo>>(new Map());
  const [dependencyTree, setDependencyTree] = useState<Map<string, DependencyTreeNode>>(new Map());

  const isSaving = saveStep.status !== 'idle' && saveStep.status !== 'completed';

  useEffect(() => {
    if (!isOpen) return;
    
    // Reset estados al abrir el modal
    setSettingsData(null);
    setAppJsonData(null);
    setSettingsError(null);
    setAppJsonError(null);
    setEditedDependencies([]);
    setFileDependencies([]);
    setFilesToUpload([]);
    setFilesToDelete([]);
    setSaveStep({ status: 'idle' });
    setMissingDependencies(new Map());
    setIsResolvingDeps(false);
    setDepDataMap(new Map());
    setAppFileDependencies(new Map());
    setMissingFileDependencies(new Map());
    setDependencyTree(new Map());
    
    fetchSettings();
    fetchAppJson();
    fetchBranches();
    fetchFileDependencies();
  }, [isOpen, owner, repo]);

  // Bloquear cierre con Escape mientras se está guardando
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSaving) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, isSaving]);

  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    setSettingsError(null);
    try {
      const res = await fetch(
        `/api/github/file-content?owner=${owner}&repo=${repo}&path=.AL-Go/settings.json&ref=main`,
        { cache: "no-store" }
      );
      
      if (res.status === 404) {
        setSettingsError("Archivo .AL-Go/settings.json no encontrado");
      } else if (res.ok) {
        const data = await res.json();
        setSettingsData(data.content);
      } else {
        throw new Error("Error al obtener settings.json");
      }
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const fetchAppJson = async () => {
    setIsLoadingAppJson(true);
    setAppJsonError(null);
    try {
      const res = await fetch(
        `/api/github/file-content?owner=${owner}&repo=${repo}&path=app.json&ref=main`,
        { cache: "no-store" }
      );
      
      if (res.status === 404) {
        setAppJsonError("Archivo app.json no encontrado");
      } else if (res.ok) {
        const data = await res.json();
        setAppJsonData(data.content);
      } else {
        throw new Error("Error al obtener app.json");
      }
    } catch (error) {
      setAppJsonError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsLoadingAppJson(false);
    }
  };

  const fetchBranches = async () => {
    setIsLoadingBranches(true);
    try {
      const res = await fetch(`/api/github/branches?owner=${owner}&repo=${repo}`, { cache: "no-store" });
      
      if (res.ok) {
        const data = await res.json();
        setBranches(data.branches);
        
        // Prioridad: dev -> main -> primera disponible
        let defaultBranch = "main";
        if (data.branches.includes("dev")) {
          defaultBranch = "dev";
        } else if (data.branches.includes("main")) {
          defaultBranch = "main";
        } else if (data.branches.length > 0) {
          defaultBranch = data.branches[0];
        }
        
        setSelectedBranch(defaultBranch);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const fetchFileDependencies = async () => {
    try {
      const res = await fetch(
        `/api/github/list-dependencies?owner=${owner}&repo=${repo}&ref=main`,
        { cache: "no-store" }
      );
      
      if (res.ok) {
        const data = await res.json();
        setFileDependencies(data.files || []);
      }
    } catch (error) {
      console.error("Error fetching file dependencies:", error);
    }
  };

  // Extraer owner y repo de una URL de GitHub
  const parseRepoUrl = (repoUrl: string): { owner: string; repo: string } | null => {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/@]+)/);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
    return null;
  };

  // Extraer nombre del repo de la URL
  const getRepoName = (repoUrl: string): string => {
    const match = repoUrl.match(/github\.com\/[^/]+\/([^/@]+)/);
    return match ? match[1] : repoUrl;
  };

  // Función para verificar dependencias faltantes
  const checkMissingDependencies = useCallback((
    deps: AppDependencyProbingPath[],
    files: FileDependency[],
    allDepData: Map<string, RepoDependencies>
  ): Map<string, MissingDependencyInfo> => {
    const missing = new Map<string, MissingDependencyInfo>();
    const currentRepoUrls = new Set(deps.map(d => d.repo));
    const currentFileNames = new Set(files.map(f => f.name));

    for (const dep of deps) {
      const parsed = parseRepoUrl(dep.repo);
      if (!parsed) continue;

      const fullName = `${parsed.owner}/${parsed.repo}`;
      const depData = allDepData.get(fullName);
      
      if (!depData) continue;

      const missingRepos: string[] = [];
      const missingFiles: string[] = [];

      // Verificar dependencias de repositorio
      for (const subDep of depData.repoDependencies) {
        if (!currentRepoUrls.has(subDep.repo)) {
          missingRepos.push(subDep.repo);
        }
      }

      // Verificar dependencias de archivo
      for (const fileDep of depData.fileDependencies) {
        if (!currentFileNames.has(fileDep.name)) {
          missingFiles.push(fileDep.name);
        }
      }

      if (missingRepos.length > 0 || missingFiles.length > 0) {
        missing.set(dep.repo, {
          repoFullName: fullName,
          missingRepos,
          missingFiles,
        });
      }
    }

    return missing;
  }, []);

  // Función para verificar dependencias faltantes de archivos .app
  const checkMissingFileDependencies = useCallback((
    files: FileDependency[],
    appFileDepData: Map<string, AppFileDependencyInfo>
  ): Map<string, MissingFileDependencyInfo> => {
    const missing = new Map<string, MissingFileDependencyInfo>();
    const currentFileNames = new Set(files.map(f => f.name));

    for (const file of files) {
      const fileInfo = appFileDepData.get(file.name);
      if (!fileInfo?.manifest?.dependencies) continue;

      const missingDeps: AppFileManifestDependency[] = [];

      // Verificar cada dependencia del manifest
      for (const dep of fileInfo.manifest.dependencies) {
        // Buscar si existe un archivo con el mismo nombre (aproximado)
        // El nombre puede variar ligeramente, así que buscamos por el nombre de la app
        const depFileName = `${dep.name}.app`;
        const exists = Array.from(currentFileNames).some(fileName => 
          fileName.toLowerCase().includes(dep.name.toLowerCase()) ||
          dep.name.toLowerCase().includes(fileName.toLowerCase().replace('.app', ''))
        );

        if (!exists) {
          missingDeps.push(dep);
        }
      }

      if (missingDeps.length > 0) {
        missing.set(file.name, {
          fileName: file.name,
          missingDependencies: missingDeps,
        });
      }
    }

    return missing;
  }, []);

  // Función para construir el árbol de dependencias
  const buildDependencyTree = useCallback((
    deps: AppDependencyProbingPath[],
    allDepData: Map<string, RepoDependencies>
  ): Map<string, DependencyTreeNode> => {
    const tree = new Map<string, DependencyTreeNode>();
    const allRepoUrls = new Set(deps.map(d => d.repo));
    
    // Encontrar qué repos son dependidos por otros (no son raíces)
    const dependedByOthers = new Set<string>();
    
    for (const dep of deps) {
      const parsed = parseRepoUrl(dep.repo);
      if (!parsed) continue;
      
      const fullName = `${parsed.owner}/${parsed.repo}`;
      const depData = allDepData.get(fullName);
      
      if (depData) {
        for (const subDep of depData.repoDependencies) {
          if (allRepoUrls.has(subDep.repo)) {
            dependedByOthers.add(subDep.repo);
          }
        }
      }
    }
    
    // Inicializar todos los nodos
    for (const dep of deps) {
      tree.set(dep.repo, {
        repo: dep.repo,
        depth: 0,
        parentRepo: null,
        children: [],
      });
    }
    
    // Establecer relaciones padre-hijo
    for (const dep of deps) {
      const parsed = parseRepoUrl(dep.repo);
      if (!parsed) continue;
      
      const fullName = `${parsed.owner}/${parsed.repo}`;
      const depData = allDepData.get(fullName);
      
      if (depData) {
        for (const subDep of depData.repoDependencies) {
          if (allRepoUrls.has(subDep.repo)) {
            const parentNode = tree.get(dep.repo);
            const childNode = tree.get(subDep.repo);
            
            if (parentNode && childNode && childNode.parentRepo === null) {
              // Solo asignar padre si aún no tiene uno
              childNode.parentRepo = dep.repo;
              parentNode.children.push(subDep.repo);
            }
          }
        }
      }
    }
    
    // Calcular profundidades usando BFS desde las raíces
    const calculateDepths = () => {
      const roots = Array.from(tree.values()).filter(node => node.parentRepo === null);
      
      for (const root of roots) {
        const queue: { url: string; depth: number }[] = [{ url: root.repo, depth: 0 }];
        
        while (queue.length > 0) {
          const { url, depth } = queue.shift()!;
          const node = tree.get(url);
          
          if (node) {
            node.depth = depth;
            
            for (const childUrl of node.children) {
              queue.push({ url: childUrl, depth: depth + 1 });
            }
          }
        }
      }
    };
    
    calculateDepths();
    
    return tree;
  }, []);

  // Función para obtener dependencias recursivas de un repositorio
  const fetchRecursiveDependencies = async (repoUrls: string[]): Promise<{
    allDeps: AppDependencyProbingPath[];
    allFiles: FileDependency[];
    depDataMap: Map<string, RepoDependencies>;
  }> => {
    const allDeps: AppDependencyProbingPath[] = [];
    const allFiles: FileDependency[] = [];
    const depDataMap = new Map<string, RepoDependencies>();
    const processedUrls = new Set<string>();
    const urlsToProcess = [...repoUrls];

    while (urlsToProcess.length > 0) {
      const currentUrl = urlsToProcess.shift()!;
      
      if (processedUrls.has(currentUrl)) continue;
      processedUrls.add(currentUrl);

      const parsed = parseRepoUrl(currentUrl);
      if (!parsed) continue;

      try {
        const res = await fetch(
          `/api/github/repo-dependencies?owner=${parsed.owner}&repo=${parsed.repo}&ref=main`,
          { cache: "no-store" }
        );

        if (res.ok) {
          const data: RepoDependencies = await res.json();
          const fullName = `${parsed.owner}/${parsed.repo}`;
          depDataMap.set(fullName, data);

          // Agregar dependencias de repositorio encontradas
          for (const dep of data.repoDependencies) {
            // Verificar si ya existe en la lista actual
            const exists = allDeps.some(d => d.repo === dep.repo) ||
                          editedDependencies.some(d => d.repo === dep.repo);
            
            if (!exists) {
              allDeps.push(dep);
              // Añadir a la cola para procesar sus dependencias
              if (!processedUrls.has(dep.repo)) {
                urlsToProcess.push(dep.repo);
              }
            }
          }

          // Agregar dependencias de archivo encontradas
          for (const file of data.fileDependencies) {
            const fileExists = allFiles.some(f => f.name === file.name) ||
                              fileDependencies.some(f => f.name === file.name);
            
            if (!fileExists) {
              allFiles.push(file);
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching dependencies for ${currentUrl}:`, error);
      }
    }

    return { allDeps, allFiles, depDataMap };
  };

  // Inicializar editedDependencies y resolver árbol cuando se carga settingsData
  useEffect(() => {
    if (settingsData?.appDependencyProbingPaths) {
      const deps = [...settingsData.appDependencyProbingPaths];
      setEditedDependencies(deps);
      
      // Resolver árbol de dependencias si hay dependencias existentes
      if (deps.length > 0) {
        resolveExistingDependencies(deps);
      }
    }
  }, [settingsData]);

  // Función para resolver dependencias existentes al abrir el modal
  const resolveExistingDependencies = async (deps: AppDependencyProbingPath[]) => {
    setIsResolvingDeps(true);
    
    try {
      const repoUrls = deps.map(d => d.repo);
      const { depDataMap: newDepDataMap } = await fetchRecursiveDependencies(repoUrls);
      
      // Actualizar el mapa de datos de dependencias
      setDepDataMap(newDepDataMap);
      
      // Construir y establecer el árbol de dependencias
      const tree = buildDependencyTree(deps, newDepDataMap);
      setDependencyTree(tree);
      
      // Calcular warnings de dependencias faltantes
      const missing = checkMissingDependencies(deps, fileDependencies, newDepDataMap);
      setMissingDependencies(missing);
    } catch (error) {
      console.error("Error resolving existing dependencies:", error);
    } finally {
      setIsResolvingDeps(false);
    }
  };

  const handleRemoveDependency = (index: number) => {
    const updated = editedDependencies.filter((_, i) => i !== index);
    setEditedDependencies(updated);
    // Recalcular warnings con las dependencias actualizadas
    const missing = checkMissingDependencies(updated, fileDependencies, depDataMap);
    setMissingDependencies(missing);
    // Reconstruir árbol de dependencias
    const tree = buildDependencyTree(updated, depDataMap);
    setDependencyTree(tree);
  };

  const handleRemoveFileDependency = (fileName: string) => {
    setFilesToDelete([...filesToDelete, fileName]);
    const updatedFiles = fileDependencies.filter(f => f.name !== fileName);
    setFileDependencies(updatedFiles);
    // Eliminar del mapa de dependencias de archivos
    const updatedAppFileDeps = new Map(appFileDependencies);
    updatedAppFileDeps.delete(fileName);
    setAppFileDependencies(updatedAppFileDeps);
    // Recalcular warnings con los archivos actualizados
    const missing = checkMissingDependencies(editedDependencies, updatedFiles, depDataMap);
    setMissingDependencies(missing);
    // Recalcular warnings de archivos
    const fileMissing = checkMissingFileDependencies(updatedFiles, updatedAppFileDeps);
    setMissingFileDependencies(fileMissing);
  };

  // Función para analizar un archivo .app y extraer sus dependencias
  const analyzeAppFile = async (file: File): Promise<AppFileDependencyInfo> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/github/analyze-app-file", {
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
  };

  const handleAddFileDependencies = async (files: File[]) => {
    setFilesToUpload([...filesToUpload, ...files]);
    const newFiles: FileDependency[] = files.map(file => ({
      name: file.name,
      path: `dependencies/${file.name}`,
      sha: "pending",
      size: file.size,
    }));
    const combinedFiles = [...fileDependencies, ...newFiles];
    setFileDependencies(combinedFiles);

    // Analizar cada archivo .app para extraer sus dependencias
    const newAppFileDeps = new Map(appFileDependencies);
    for (const file of files) {
      const depInfo = await analyzeAppFile(file);
      newAppFileDeps.set(file.name, depInfo);
    }
    setAppFileDependencies(newAppFileDeps);

    // Recalcular warnings de archivos
    const fileMissing = checkMissingFileDependencies(combinedFiles, newAppFileDeps);
    setMissingFileDependencies(fileMissing);
  };

  const handleAddDependencies = async (selectedRepos: GitHubRepository[], version: string, releaseStatus: string) => {
    setShowAddRepoModal(false);
    setIsResolvingDeps(true);

    try {
      // Crear las dependencias iniciales de los repos seleccionados
      const newDeps: AppDependencyProbingPath[] = selectedRepos.map(repo => ({
        repo: repo.html_url,
        version: version,
        release_status: releaseStatus,
        authTokenSecret: "GHTOKENWORKFLOW",
        projects: "*",
      }));

      // Obtener las URLs de los repos seleccionados
      const repoUrls = selectedRepos.map(r => r.html_url);

      // Obtener dependencias recursivas
      const { allDeps, allFiles, depDataMap: newDepDataMap } = await fetchRecursiveDependencies(repoUrls);

      // Combinar el mapa de dependencias existente con el nuevo
      const combinedDepDataMap = new Map([...depDataMap, ...newDepDataMap]);
      setDepDataMap(combinedDepDataMap);

      // Combinar todas las dependencias
      const combinedDeps = [...editedDependencies, ...newDeps];
      
      // Añadir las dependencias transitivas (de repositorio)
      for (const dep of allDeps) {
        if (!combinedDeps.some(d => d.repo === dep.repo)) {
          combinedDeps.push({
            ...dep,
            version: dep.version || version,
            release_status: dep.release_status || releaseStatus,
            authTokenSecret: dep.authTokenSecret || "GHTOKENWORKFLOW",
            projects: dep.projects || "*",
          });
        }
      }

      setEditedDependencies(combinedDeps);

      // Añadir los archivos .app de las dependencias (nota: estos son para referencia, no se suben automáticamente)
      // El usuario tendrá que subir los archivos manualmente si los necesita
      // Por ahora solo mostramos el warning de archivos faltantes

      // Verificar dependencias faltantes
      const missing = checkMissingDependencies(combinedDeps, fileDependencies, combinedDepDataMap);
      setMissingDependencies(missing);

      // Construir árbol de dependencias
      const tree = buildDependencyTree(combinedDeps, combinedDepDataMap);
      setDependencyTree(tree);

    } catch (error) {
      console.error("Error resolving dependencies:", error);
      // Si hay error, al menos añadir las dependencias directas
      const newDeps: AppDependencyProbingPath[] = selectedRepos.map(repo => ({
        repo: repo.html_url,
        version: version,
        release_status: releaseStatus,
        authTokenSecret: "GHTOKENWORKFLOW",
        projects: "*",
      }));
      setEditedDependencies([...editedDependencies, ...newDeps]);
    } finally {
      setIsResolvingDeps(false);
    }
  };

  // Función para obtener dependencias ordenadas por árbol (DFS)
  const getSortedDependencies = useCallback((): Array<{ dep: AppDependencyProbingPath; index: number; depth: number; parentName: string | null }> => {
    if (dependencyTree.size === 0) {
      // Si no hay árbol construido, mostrar las dependencias sin orden especial
      return editedDependencies.map((dep, index) => ({
        dep,
        index,
        depth: 0,
        parentName: null,
      }));
    }

    const result: Array<{ dep: AppDependencyProbingPath; index: number; depth: number; parentName: string | null }> = [];
    const visited = new Set<string>();

    // DFS para ordenar por árbol
    const dfs = (repoUrl: string, parentName: string | null) => {
      if (visited.has(repoUrl)) return;
      visited.add(repoUrl);

      const node = dependencyTree.get(repoUrl);
      const depIndex = editedDependencies.findIndex(d => d.repo === repoUrl);
      
      if (depIndex !== -1 && node) {
        result.push({
          dep: editedDependencies[depIndex],
          index: depIndex,
          depth: node.depth,
          parentName,
        });

        // Visitar hijos
        for (const childUrl of node.children) {
          dfs(childUrl, getRepoName(repoUrl));
        }
      }
    };

    // Empezar desde las raíces (nodos sin padre)
    const roots = Array.from(dependencyTree.values()).filter(node => node.parentRepo === null);
    for (const root of roots) {
      dfs(root.repo, null);
    }

    // Agregar cualquier dependencia que no esté en el árbol (por si acaso)
    for (let i = 0; i < editedDependencies.length; i++) {
      if (!visited.has(editedDependencies[i].repo)) {
        result.push({
          dep: editedDependencies[i],
          index: i,
          depth: 0,
          parentName: null,
        });
      }
    }

    return result;
  }, [editedDependencies, dependencyTree]);

  const handleSaveChanges = async () => {
    try {
      // Paso 1: Actualizar settings.json
      setSaveStep({ status: 'updating-settings', message: 'Actualizando settings.json...' });
      
      const res = await fetch("/api/github/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner,
          repo,
          baseBranch: selectedBranch,
          appDependencyProbingPaths: editedDependencies,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar cambios");
      }

      const data = await res.json();
      const branchName = data.branch;

      // Paso 2: Subir archivos
      if (filesToUpload.length > 0) {
        for (let i = 0; i < filesToUpload.length; i++) {
          const file = filesToUpload[i];
          setSaveStep({ 
            status: 'uploading-files', 
            message: `Subiendo ${file.name}...`,
            current: i + 1,
            total: filesToUpload.length
          });

          const formData = new FormData();
          formData.append("file", file);
          formData.append("owner", owner);
          formData.append("repo", repo);
          formData.append("branch", branchName);

          const uploadRes = await fetch("/api/github/upload-dependency", {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) {
            const errorData = await uploadRes.json();
            throw new Error(`Error subiendo ${file.name}: ${errorData.error}`);
          }
        }
      }

      // Paso 3: Eliminar archivos
      if (filesToDelete.length > 0) {
        for (let i = 0; i < filesToDelete.length; i++) {
          const fileName = filesToDelete[i];
          setSaveStep({ 
            status: 'deleting-files', 
            message: `Eliminando ${fileName}...`,
            current: i + 1,
            total: filesToDelete.length
          });

          const deleteRes = await fetch("/api/github/delete-dependency", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ owner, repo, branch: branchName, fileName }),
          });

          if (!deleteRes.ok) {
            const errorData = await deleteRes.json();
            console.warn(`Error eliminando ${fileName}: ${errorData.error}`);
          }
        }
      }
      
      // Paso 4: Crear PR
      setSaveStep({ status: 'creating-pr', message: 'Creando Pull Request...' });
      await new Promise(resolve => setTimeout(resolve, 500)); // Pequeña pausa para que se vea el mensaje
      
      setSaveStep({ status: 'completed', message: 'Pull Request creado exitosamente' });
      
      // Abrir PR y cerrar modal después de un breve momento
      window.open(data.pullRequestUrl, '_blank');
      setTimeout(() => {
        setSaveStep({ status: 'idle' });
        onClose();
      }, 1000);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al guardar cambios");
      setSaveStep({ status: 'idle' });
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (isSaving) {
        // No hacer nada, el modal está bloqueado
        return;
      }
      onClose();
    }
  };

  const handleClose = () => {
    if (isSaving) {
      return; // Bloquear cierre
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-[90vw] max-w-6xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Dependencias CI/CD - {repo}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={isSaving ? "Procesando cambios..." : "Cerrar"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Split view */}
        <div className="flex-1 overflow-hidden grid grid-cols-2 divide-x divide-gray-700">
          {/* Left side - AL-Go/settings.json */}
          <div className="flex flex-col overflow-hidden">
            <div className="p-3 bg-gray-900/50 border-b border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <code className="text-xs bg-gray-700 px-2 py-0.5 rounded">.AL-Go/settings.json</code>
              </h3>
              <p className="text-xs text-gray-500 mt-1">appDependencyProbingPaths</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingSettings || isResolvingDeps ? (
                <LoadingSpinner text={isResolvingDeps ? "Resolviendo dependencias..." : "Cargando..."} />
              ) : settingsError ? (
                <EmptyState 
                  message={settingsError}
                  icon={
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                />
              ) : editedDependencies.length > 0 || fileDependencies.length > 0 ? (
                <div className="space-y-2">
                  {/* Dependencias de repositorio ordenadas por árbol */}
                  {getSortedDependencies().map(({ dep, index, depth, parentName }) => {
                    const missingInfo = missingDependencies.get(dep.repo);
                    const hasMissing = missingInfo && (missingInfo.missingRepos.length > 0 || missingInfo.missingFiles.length > 0);
                    const indentPx = depth * 24; // 24px por nivel
                    
                    return (
                      <div 
                        key={`repo-${index}`}
                        className={`bg-gray-900 border rounded-lg p-3 hover:border-gray-600 transition-colors ${
                          hasMissing ? 'border-yellow-500/50' : 'border-gray-700'
                        }`}
                        style={{ marginLeft: `${indentPx}px` }}
                      >
                        {/* Indicador de dependencia padre */}
                        {depth > 0 && (
                          <div className="flex items-center gap-1.5 mb-2 -mt-1">
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-[10px] text-gray-500">
                              Requerido por <span className="text-gray-400 font-medium">{parentName}</span>
                            </span>
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium text-blue-400 truncate">
                                  {getRepoName(dep.repo)}
                                </h4>
                                {hasMissing && (
                                  <div className="relative group/tooltip">
                                    <svg 
                                      className="w-4 h-4 text-yellow-500 cursor-help shrink-0" 
                                      fill="currentColor" 
                                      viewBox="0 0 20 20"
                                    >
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {/* Tooltip */}
                                    <div className="fixed hidden group-hover/tooltip:block" style={{ zIndex: 9999 }}>
                                      <div className="absolute left-6 top-0 w-64 p-3 bg-gray-900 border border-yellow-500/30 rounded-lg shadow-2xl">
                                        <p className="text-xs font-medium text-yellow-500 mb-2">
                                          Dependencias faltantes:
                                        </p>
                                        {missingInfo!.missingRepos.length > 0 && (
                                          <div className="mb-2">
                                            <p className="text-xs text-gray-400 mb-1">Repositorios:</p>
                                            <ul className="text-xs text-gray-300 space-y-1">
                                              {missingInfo!.missingRepos.map((repo, i) => (
                                                <li key={i} className="truncate flex items-center gap-1">
                                                  <svg className="w-3 h-3 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633z" clipRule="evenodd" />
                                                  </svg>
                                                  {getRepoName(repo)}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {missingInfo!.missingFiles.length > 0 && (
                                          <div>
                                            <p className="text-xs text-gray-400 mb-1">Archivos .app:</p>
                                            <ul className="text-xs text-gray-300 space-y-1">
                                              {missingInfo!.missingFiles.map((file, i) => (
                                                <li key={i} className="truncate flex items-center gap-1">
                                                  <svg className="w-3 h-3 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                  </svg>
                                                  {file}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 truncate mt-0.5" title={dep.repo}>
                                {dep.repo}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                  </svg>
                                  {dep.release_status}
                                </span>
                                {dep.projects && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                    </svg>
                                    {dep.projects}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="shrink-0 px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400">
                              {dep.version}
                            </span>
                            <button
                              onClick={() => handleRemoveDependency(index)}
                              disabled={isSaving}
                              className="shrink-0 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              title="Eliminar dependencia"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Dependencias de archivo */}
                  {fileDependencies.map((file, index) => {
                    const appFileInfo = appFileDependencies.get(file.name);
                    const missingInfo = missingFileDependencies.get(file.name);
                    const hasMissing = missingInfo && missingInfo.missingDependencies.length > 0;
                    
                    return (
                      <div 
                        key={`file-${index}`}
                        className={`bg-gray-900 border rounded-lg p-3 hover:border-gray-600 transition-colors ${
                          hasMissing ? 'border-yellow-500/50' : 'border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium text-white truncate">
                                  {file.name}
                                </h4>
                                {hasMissing && (
                                  <div className="relative group/filetooltip">
                                    <svg 
                                      className="w-4 h-4 text-yellow-500 cursor-help shrink-0" 
                                      fill="currentColor" 
                                      viewBox="0 0 20 20"
                                    >
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {/* Tooltip */}
                                    <div className="fixed hidden group-hover/filetooltip:block" style={{ zIndex: 9999 }}>
                                      <div className="absolute left-6 top-0 w-72 p-3 bg-gray-900 border border-yellow-500/30 rounded-lg shadow-2xl">
                                        <p className="text-xs font-medium text-yellow-500 mb-2">
                                          Dependencias faltantes:
                                        </p>
                                        <ul className="text-xs text-gray-300 space-y-2">
                                          {missingInfo!.missingDependencies.map((dep, i) => (
                                            <li key={i} className="flex flex-col gap-0.5 pb-2 border-b border-gray-700 last:border-0 last:pb-0">
                                              <div className="flex items-center gap-1">
                                                <svg className="w-3 h-3 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-medium text-white">{dep.name}</span>
                                              </div>
                                              <span className="text-gray-400 text-[10px]">{dep.publisher} • v{dep.minVersion}+</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {appFileInfo?.manifest && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {appFileInfo.manifest.publisher} • v{appFileInfo.manifest.version}
                                </p>
                              )}
                              <p className="text-xs text-gray-600 mt-0.5">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFileDependency(file.name)}
                            disabled={isSaving}
                            className="shrink-0 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            title="Eliminar archivo"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState 
                  message="Sin dependencias CI/CD configuradas"
                  icon={
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  }
                />
              )}
            </div>

            {/* Counter and Add buttons */}
            <div className="p-2 border-t border-gray-700 bg-gray-900/30 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {editedDependencies.length + fileDependencies.length} dependencia(s)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddRepoModal(true)}
                  disabled={isSaving || isResolvingDeps}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Añadir repositorio"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Repositorio
                </button>
                <button
                  onClick={() => setShowAddFileModal(true)}
                  disabled={isSaving || isResolvingDeps}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-gray-600 hover:bg-gray-500 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Añadir archivo .app"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  Archivo
                </button>
              </div>
            </div>
          </div>

          {/* Right side - app.json */}
          <div className="flex flex-col overflow-hidden">
            <div className="p-3 bg-gray-900/50 border-b border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <code className="text-xs bg-gray-700 px-2 py-0.5 rounded">app.json</code>
              </h3>
              <p className="text-xs text-gray-500 mt-1">dependencies</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingAppJson ? (
                <LoadingSpinner />
              ) : appJsonError ? (
                <EmptyState 
                  message={appJsonError}
                  icon={
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                />
              ) : appJsonData?.dependencies && appJsonData.dependencies.length > 0 ? (
                <div className="space-y-3">
                  {appJsonData.dependencies.map((dep, index) => (
                    <div 
                      key={index}
                      className="bg-gray-900 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-purple-400">
                            {dep.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {dep.publisher}
                          </p>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 text-xs font-medium rounded bg-purple-500/20 text-purple-400">
                          v{dep.version}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-400 font-mono">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          {dep.id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  message="Sin dependencias de app"
                  icon={
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  }
                />
              )}
            </div>

            {/* Counter */}
            <div className="p-2 border-t border-gray-700 bg-gray-900/30">
              <p className="text-xs text-gray-500 text-center">
                {appJsonData?.dependencies?.length || 0} dependencia(s)
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex flex-col gap-3">
          {/* Barra de progreso */}
          {isSaving && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {saveStep.status === 'updating-settings' && saveStep.message}
                    {saveStep.status === 'uploading-files' && `${saveStep.message} (${saveStep.current}/${saveStep.total})`}
                    {saveStep.status === 'deleting-files' && `${saveStep.message} (${saveStep.current}/${saveStep.total})`}
                    {saveStep.status === 'creating-pr' && saveStep.message}
                  </p>
                  {(saveStep.status === 'uploading-files' || saveStep.status === 'deleting-files') && (
                    <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(saveStep.current / saveStep.total) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            {/* Selector de rama */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">PR a rama:</span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                disabled={isLoadingBranches || isSaving}
                className="px-3 py-2 text-sm bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingBranches ? (
                  <option>Cargando...</option>
                ) : branches.length > 0 ? (
                  branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))
                ) : (
                  <option>No hay ramas disponibles</option>
                )}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saveStep.status === 'completed' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Completado
                  </>
                ) : isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Crear PR a {selectedBranch}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de selección de repositorio */}
      {showAddRepoModal && (
        <AddRepoModal
          onClose={() => setShowAddRepoModal(false)}
          repos={allRepos}
          currentRepoFullName={`${owner}/${repo}`}
          existingDeps={editedDependencies}
          onAdd={handleAddDependencies}
        />
      )}

      {/* Modal de carga de archivos */}
      {showAddFileModal && (
        <AddFileModal
          onClose={() => setShowAddFileModal(false)}
          onAdd={handleAddFileDependencies}
        />
      )}
    </div>
  );
}

function AddRepoModal({ onClose, repos, currentRepoFullName, existingDeps, onAdd }: AddRepoModalProps) {
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
  const [version, setVersion] = useState("latest");
  const [releaseStatus, setReleaseStatus] = useState("release");
  const [searchQuery, setSearchQuery] = useState("");

  const existingRepoUrls = new Set(existingDeps.map(dep => dep.repo));
  const availableRepos = repos.filter(repo => 
    !existingRepoUrls.has(repo.html_url) && repo.full_name !== currentRepoFullName
  );
  const filteredRepos = availableRepos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRepoSelection = (repoId: number) => {
    setSelectedRepos(prev => {
      const newSelection = new Set(prev);
      newSelection.has(repoId) ? newSelection.delete(repoId) : newSelection.add(repoId);
      return newSelection;
    });
  };

  const getSelectedRepoNames = () => {
    return availableRepos
      .filter(repo => selectedRepos.has(repo.id))
      .map(repo => repo.name);
  };

  const handleAdd = () => {
    if (selectedRepos.size === 0) return;
    
    const reposToAdd = availableRepos.filter(repo => selectedRepos.has(repo.id));
    onAdd(reposToAdd, version, releaseStatus);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-[90vw] max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Añadir dependencia</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar repositorio..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-600 bg-gray-900 text-white text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Repo list */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredRepos.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">
                {availableRepos.length === 0 
                  ? "Todos los repositorios ya están agregados" 
                  : "No se encontraron repositorios"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRepos.map((repo) => {
                const isSelected = selectedRepos.has(repo.id);
                return (
                  <button
                    key={repo.id}
                    onClick={() => toggleRepoSelection(repo.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700 bg-gray-900 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {repo.name}
                        </h4>
                        <p className="text-xs text-gray-400 truncate">
                          {repo.full_name}
                        </p>
                      </div>
                      <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-500"
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected repos indicator */}
        {selectedRepos.size > 0 && (
          <div className="px-4 py-2 border-t border-gray-700 bg-gray-900/30">
            <p className="text-xs text-gray-400">
              <span className="font-medium text-blue-400">Seleccionados:</span>{" "}
              {getSelectedRepoNames().join(", ")}
            </p>
          </div>
        )}

        {/* Config */}
        {selectedRepos.size > 0 && (
          <div className="p-4 border-t border-gray-700 bg-gray-900/50">
            <p className="text-xs text-gray-400 mb-3">
              Configuración aplicada a todos los repositorios seleccionados
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Versión
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-900 text-white text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Release Status
                </label>
                <select
                  value={releaseStatus}
                  onChange={(e) => setReleaseStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-900 text-white text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="release">release</option>
                  <option value="prerelease">prerelease</option>
                  <option value="draft">draft</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedRepos.size === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Añadir {selectedRepos.size > 0 && `(${selectedRepos.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddFileModal({ onClose, onAdd }: AddFileModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList).filter(f => f.name.endsWith('.app'));
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    if (selectedFiles.length === 0) return;
    onAdd(selectedFiles);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-[90vw] max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            Añadir archivos .app
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drop zone */}
        <div className="flex-1 overflow-y-auto p-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-gray-400 bg-gray-500/10"
                : "border-gray-600 hover:border-gray-500"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-300 mb-2">
              Arrastra archivos .app aquí
            </p>
            <p className="text-gray-500 text-sm mb-4">o</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Seleccionar archivos
              <input
                type="file"
                accept=".app"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Selected files list */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Archivos seleccionados ({selectedFiles.length})
              </h4>
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-900 border border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="shrink-0 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedFiles.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Añadir {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
