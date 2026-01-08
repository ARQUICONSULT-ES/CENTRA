"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { GitHubRepository } from "@/types/github";
import { DependenciesModal } from "./DependenciesModal";
import type { 
  WorkflowStatus, 
  ReleaseInfo, 
  RepoCardProps, 
  Commit 
} from "@/modules/repos/types";
import { languageColors } from "@/modules/repos/types";
import { useWorkflow } from "@/modules/repos/hooks/useWorkflow";
import { useRelease } from "@/modules/repos/hooks/useRelease";
import { getNextMinorVersion, getRelativeTime } from "@/modules/repos/services/utils";
import { useToast } from "@/modules/shared/hooks/useToast";

export function RepoCard({ 
  repo, 
  preloadedInfo, 
  skipIndividualFetch = false,
  isLoadingRelease: externalIsLoadingRelease = false,
  allRepos = [] 
}: RepoCardProps) {
  const { error: showError } = useToast();
  
  // Estados de UI local
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showPrereleaseModal, setShowPrereleaseModal] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Workflow iniciado correctamente");
  const [countdown, setCountdown] = useState(3);
  const [showDependenciesModal, setShowDependenciesModal] = useState(false);
  const [isCreatingRelease, setIsCreatingRelease] = useState(false);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Hooks personalizados para workflow y release
  const workflowHook = useWorkflow();
  const releaseHook = useRelease();

  // Estados derivados de los hooks o preloadedInfo
  const workflowStatus: WorkflowStatus | null = preloadedInfo?.workflow ?? workflowHook.workflowStatus;
  const latestRelease: ReleaseInfo | null = preloadedInfo?.release ?? releaseHook.latestRelease;
  const isLoading = !preloadedInfo && !skipIndividualFetch && (workflowHook.isLoading || releaseHook.isLoading);
  const isLoadingCommits = releaseHook.isLoadingCommits;
  const releaseCommits: Commit[] = releaseHook.commits;
  const isUpdatingAlGo = workflowHook.isTriggering;

  // Cargar datos individuales si no hay preloadedInfo y no se debe esperar el batch
  useEffect(() => {
    if (!preloadedInfo && !skipIndividualFetch) {
      const [owner, repoName] = repo.full_name.split("/");
      workflowHook.fetchStatus(owner, repoName);
      releaseHook.fetchLatest(owner, repoName);
    }
  }, [repo.full_name, preloadedInfo, skipIndividualFetch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdateAlGo = async () => {
    setShowConfirmModal(false);
    setIsMenuOpen(false);
    
    const [owner, repoName] = repo.full_name.split("/");
    const result = await workflowHook.trigger({
      owner,
      repo: repoName,
      workflow: "UpdateGitHubGoSystemFiles.yaml",
      ref: "main",
      inputs: {
        templateUrl: "https://github.com/ARQUICONSULT-ES/AL-Go@main",
        downloadLatest: "true",
        directCommit: "false",
      },
    });

    if (result.success) {
      // Mostrar banner y abrir ventana después de 3 segundos
      setSuccessMessage("Workflow de AL-Go iniciado correctamente");
      setShowSuccessBanner(true);
      setCountdown(3);
      
      setTimeout(() => setCountdown(2), 1000);
      setTimeout(() => setCountdown(1), 2000);
      setTimeout(() => {
        setShowSuccessBanner(false);
        window.open(`https://github.com/${repo.full_name}/actions`, "_blank");
      }, 3000);

      // Refrescar el estado del workflow después de un momento
      setTimeout(() => {
        workflowHook.fetchStatus(owner, repoName);
      }, 2000);
    } else {
      showError(result.error || "Error al ejecutar workflow");
    }
  };

  const openConfirmModal = () => {
    setIsMenuOpen(false);
    setShowConfirmModal(true);
  };

  const openReleaseModal = async () => {
    setShowReleaseModal(true);
    
    const [owner, repoName] = repo.full_name.split("/");
    const base = latestRelease?.tag_name || "";
    await releaseHook.fetchCommits(owner, repoName, base, "main");
  };

  const openPrereleaseModal = async () => {
    setIsMenuOpen(false);
    setShowPrereleaseModal(true);
    
    const [owner, repoName] = repo.full_name.split("/");
    const base = latestRelease?.tag_name || "";
    await releaseHook.fetchCommits(owner, repoName, base, "main");
    
    // Cargar las ramas disponibles
    await fetchBranches(owner, repoName);
  };

  const fetchBranches = async (owner: string, repo: string) => {
    setIsLoadingBranches(true);
    try {
      const res = await fetch(`/api/github/branches?owner=${owner}&repo=${repo}`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        const branchNames = data.branches; // Ya es un array de strings
        setBranches(branchNames);
        
        // Si existe "main" usarla como predeterminada, sino usar la primera rama
        const defaultBranch = branchNames.includes("main") 
          ? "main" 
          : branchNames[0] || "main";
        setSelectedBranch(defaultBranch);
      }
    } catch (error) {
      console.error("Error al cargar ramas:", error);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const handleCreateRelease = async () => {
    setIsCreatingRelease(true);

    const [owner, repoName] = repo.full_name.split("/");
    const newVersion = getNextMinorVersion(latestRelease?.tag_name ?? null);
    
    const result = await workflowHook.trigger({
      owner,
      repo: repoName,
      workflow: "CreateRelease.yaml",
      ref: "main",
      inputs: {
        useGhTokenWorkflow: "true",
        updateVersionNumber: "+0.1",
        name: newVersion,
        tag: `${newVersion}.0`,
      },
    });

    if (result.success) {
      // Cerrar modal de release
      setShowReleaseModal(false);

      // Mostrar banner y abrir ventana después de 3 segundos
      setSuccessMessage(`Release v${newVersion} creada correctamente`);
      setShowSuccessBanner(true);
      setCountdown(3);
      
      setTimeout(() => setCountdown(2), 1000);
      setTimeout(() => setCountdown(1), 2000);
      setTimeout(() => {
        setShowSuccessBanner(false);
        window.open(`https://github.com/${repo.full_name}/actions`, "_blank");
      }, 3000);

      // Refrescar el estado del workflow y release después de un momento
      setTimeout(() => {
        workflowHook.fetchStatus(owner, repoName);
        releaseHook.fetchLatest(owner, repoName);
      }, 2000);
    } else {
      showError(result.error || "Error al crear release");
    }
    
    setIsCreatingRelease(false);
  };

  const handleCreatePrerelease = async () => {
    setIsCreatingRelease(true);

    const [owner, repoName] = repo.full_name.split("/");
    const newVersion = getNextMinorVersion(latestRelease?.tag_name ?? null);
    
    const result = await workflowHook.trigger({
      owner,
      repo: repoName,
      workflow: "CreateRelease.yaml",
      ref: selectedBranch,
      inputs: {
        useGhTokenWorkflow: "true",
        updateVersionNumber: "+0.1",
        name: `${newVersion}-preview`,
        tag: `${newVersion}.0-preview`,
        prerelease: "true",
      },
    });

    if (result.success) {
      // Cerrar modal de prerelease
      setShowPrereleaseModal(false);

      // Mostrar banner y abrir ventana después de 3 segundos
      setSuccessMessage(`Prerelease v${newVersion}-preview creada correctamente`);
      setShowSuccessBanner(true);
      setCountdown(3);
      
      setTimeout(() => setCountdown(2), 1000);
      setTimeout(() => setCountdown(1), 2000);
      setTimeout(() => {
        setShowSuccessBanner(false);
        window.open(`https://github.com/${repo.full_name}/actions`, "_blank");
      }, 3000);

      // Refrescar el estado del workflow y release después de un momento
      setTimeout(() => {
        workflowHook.fetchStatus(owner, repoName);
        releaseHook.fetchLatest(owner, repoName);
      }, 2000);
    } else {
      showError(result.error || "Error al crear prerelease");
    }
    
    setIsCreatingRelease(false);
  };

  // Función para validar si se puede crear una release
  const canCreateRelease = (): { canCreate: boolean; reason?: string } => {
    if (isLoading) {
      return { canCreate: false, reason: "Cargando estado del workflow..." };
    }

    if (!workflowStatus) {
      return { canCreate: false, reason: "Estado del CI/CD desconocido" };
    }

    const { status, conclusion } = workflowStatus;

    // Si está en progreso o en cola, no se puede crear release
    if (status === "queued" || status === "in_progress") {
      return { canCreate: false, reason: "Hay un workflow CI/CD en ejecución" };
    }

    // Si está completado pero no fue exitoso
    if (status === "completed" && conclusion !== "success") {
      if (conclusion === "failure") {
        return { canCreate: false, reason: "El último CI/CD falló" };
      }
      if (conclusion === "cancelled") {
        return { canCreate: false, reason: "El último CI/CD fue cancelado" };
      }
      return { canCreate: false, reason: "El último CI/CD no finalizó correctamente" };
    }

    // Si está completado y fue exitoso
    if (status === "completed" && conclusion === "success") {
      return { canCreate: true };
    }

    return { canCreate: false, reason: "Estado del CI/CD desconocido" };
  };

  const getStatusIndicator = () => {
    if (isLoading) {
      return (
        <div className="w-5 h-5 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-gray-500 animate-pulse" />
        </div>
      );
    }

    if (!workflowStatus) {
      // No hay workflow CICD.yaml o nunca se ha ejecutado
      return (
        <div className="w-5 h-5 flex items-center justify-center" title="Sin workflow CI/CD">
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    const { status, conclusion, html_url } = workflowStatus;

    // En proceso (queued o in_progress)
    if (status === "queued" || status === "in_progress") {
      return (
        <a
          href={html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-5 h-5 flex items-center justify-center"
          title="En progreso - Click para ver ejecución"
        >
          <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
        </a>
      );
    }

    // Completado - verificar conclusión
    if (status === "completed") {
      if (conclusion === "success") {
        return (
          <a
            href={html_url}
            target="_blank"
            rel="noopener noreferrer"
            title="Éxito - Click para ver ejecución"
          >
            <svg className="w-5 h-5 text-green-500 hover:text-green-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </a>
        );
      } else if (conclusion === "failure") {
        return (
          <a
            href={html_url}
            target="_blank"
            rel="noopener noreferrer"
            title="Fallido - Click para ver ejecución"
          >
            <svg className="w-5 h-5 text-red-500 hover:text-red-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </a>
        );
      } else {
        // cancelled, skipped u otro
        return (
          <a
            href={html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-5 h-5 flex items-center justify-center"
            title="Cancelado/Saltado - Click para ver ejecución"
          >
            <div className="w-3 h-3 rounded-full bg-gray-400" />
          </a>
        );
      }
    }

    return null;
  };

  const languageColor = repo.language ? languageColors[repo.language] || "#6e7681" : null;

  return (
    <>
      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Confirmar actualización
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              ¿Estás seguro de que deseas actualizar los archivos AL-Go del repositorio <span className="font-semibold text-blue-600 dark:text-blue-400">{repo.name}</span>?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Esto ejecutará el workflow UpdateGitHubGoSystemFiles.yaml con la configuración por defecto.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateAlGo}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de crear prerelease */}
      {showPrereleaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full shadow-xl border border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Nueva prerelease v{getNextMinorVersion(latestRelease?.tag_name ?? null)}-preview
              </h3>
              <button
                onClick={() => setShowPrereleaseModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {latestRelease 
                ? `Cambios desde ${latestRelease.tag_name}:`
                : "Commits a incluir en la primera prerelease:"}
            </p>

            <div className="flex-1 overflow-y-auto min-h-0 mb-4">
              {isLoadingCommits ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="w-6 h-6 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : releaseCommits.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay cambios desde la última release
                </p>
              ) : (
                <ul className="space-y-3">
                  {releaseCommits.map((commit) => (
                    <li key={commit.sha} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-400 dark:text-gray-500 font-mono shrink-0">
                        {commit.sha.substring(0, 7)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 dark:text-gray-300 break-words">{commit.message}</p>
                        <p className="text-xs text-gray-500 mt-0.5">by {commit.author}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Validación de CI/CD */}
            {(() => {
              const validation = canCreateRelease();
              return !validation.canCreate && validation.reason ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-md mb-4">
                  <svg className="w-4 h-4 text-yellow-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-yellow-500">{validation.reason}</p>
                </div>
              ) : null;
            })()}

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Selector de rama */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rama:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  disabled={isLoadingBranches || isCreatingRelease}
                  className="px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <option>main</option>
                  )}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPrereleaseModal(false)}
                  disabled={isCreatingRelease}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePrerelease}
                  disabled={releaseCommits.length === 0 || isLoadingCommits || isCreatingRelease || !canCreateRelease().canCreate}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title={!canCreateRelease().canCreate ? canCreateRelease().reason : ""}
                >
                  {isCreatingRelease ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creando...
                    </>
                  ) : (
                    "Crear prerelease"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de crear release */}
      {showReleaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full shadow-xl border border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Nueva release v{getNextMinorVersion(latestRelease?.tag_name ?? null)}
              </h3>
              <button
                onClick={() => setShowReleaseModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {latestRelease 
                ? `Cambios desde ${latestRelease.tag_name}:`
                : "Commits a incluir en la primera release:"}
            </p>

            <div className="flex-1 overflow-y-auto min-h-0 mb-4">
              {isLoadingCommits ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="w-6 h-6 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : releaseCommits.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay cambios desde la última release
                </p>
              ) : (
                <ul className="space-y-3">
                  {releaseCommits.map((commit) => (
                    <li key={commit.sha} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-400 dark:text-gray-500 font-mono shrink-0">
                        {commit.sha.substring(0, 7)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 dark:text-gray-300 break-words">{commit.message}</p>
                        <p className="text-xs text-gray-500 mt-0.5">by {commit.author}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Validación de CI/CD */}
            {(() => {
              const validation = canCreateRelease();
              return !validation.canCreate && validation.reason ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-md mb-4">
                  <svg className="w-4 h-4 text-yellow-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-yellow-500">{validation.reason}</p>
                </div>
              ) : null;
            })()}

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowReleaseModal(false)}
                disabled={isCreatingRelease}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateRelease}
                disabled={releaseCommits.length === 0 || isLoadingCommits || isCreatingRelease || !canCreateRelease().canCreate}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title={!canCreateRelease().canCreate ? canCreateRelease().reason : ""}
              >
                {isCreatingRelease ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creando...
                  </>
                ) : (
                  "Crear release"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner de éxito con countdown */}
      {showSuccessBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
            <div className="flex items-center gap-2 text-green-100 border-l border-green-500 pl-4">
              <span className="text-sm">Abriendo workflows en</span>
              <span className="bg-green-700 px-2 py-0.5 rounded font-mono font-bold">{countdown}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de dependencias CI/CD */}
      <DependenciesModal
        isOpen={showDependenciesModal}
        onClose={() => setShowDependenciesModal(false)}
        owner={repo.full_name.split("/")[0]}
        repo={repo.full_name.split("/")[1]}
        allRepos={allRepos}
      />

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col gap-2">
        {/* Header: Nombre y estado */}
        <div className="flex items-start justify-between gap-2">
          <Link
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold text-sm truncate"
          >
            {repo.name}
          </Link>
          
          {/* Indicador de estado */}
          <div className="shrink-0">
            {getStatusIndicator()}
          </div>
        </div>

        {/* Lenguaje y Version badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Lenguaje */}
          {repo.language && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: languageColor || "#6e7681" }}
              />
              {repo.language}
            </span>
          )}
          
          {/* Separador */}
          {repo.language && (externalIsLoadingRelease || latestRelease) && (
            <span className="text-gray-400 dark:text-gray-600">•</span>
          )}
          
          {/* Release badge */}
          {externalIsLoadingRelease ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Obteniendo release...
            </span>
          ) : latestRelease ? (
            <a
              href={latestRelease.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 transition-colors"
              title={`Release: ${latestRelease.name || latestRelease.tag_name}`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 010 2.474l-5.026 5.026a1.75 1.75 0 01-2.474 0l-6.25-6.25A1.75 1.75 0 011 7.775zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 00.354 0l5.025-5.025a.25.25 0 000-.354l-6.25-6.25a.25.25 0 00-.177-.073H2.75a.25.25 0 00-.25.25v5.025zM6 5a1 1 0 110 2 1 1 0 010-2z" />
              </svg>
              {latestRelease.tag_name}
            </a>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700">
              Sin release
            </span>
          )}
        </div>

        {/* Tiempo desde última modificación */}
        <div className="text-xs text-gray-500 dark:text-gray-500">
          Actualizado {getRelativeTime(repo.updated_at)}
        </div>

        {/* Boton de crear release y menu */}
        <div className="flex items-center gap-2 mt-auto">
          <button 
            onClick={openReleaseModal}
            disabled={!canCreateRelease().canCreate}
            title={!canCreateRelease().canCreate ? canCreateRelease().reason : ""}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-800"
          >
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span className="truncate">Crear release v{getNextMinorVersion(latestRelease?.tag_name ?? null)}</span>
          </button>
          
          {/* Menu de tres puntos */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              disabled={isUpdatingAlGo}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isUpdatingAlGo ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              )}
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 bottom-full mb-1 w-56 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50 border border-gray-200 dark:border-gray-700">
                <div className="py-1">
                  <button
                    onClick={openPrereleaseModal}
                    disabled={!canCreateRelease().canCreate}
                    title={!canCreateRelease().canCreate ? canCreateRelease().reason : ""}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 text-orange-500 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Crear prerelease
                  </button>
                  <button
                    onClick={openConfirmModal}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualizar archivos AL-Go
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowDependenciesModal(true);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    Dependencias CI/CD
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
