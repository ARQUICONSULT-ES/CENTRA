"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { GitHubRepository } from "@/types/github";
import { DependenciesModal } from "./DependenciesModal";

export interface WorkflowStatus {
  status: "queued" | "in_progress" | "completed";
  conclusion: "success" | "failure" | "cancelled" | "skipped" | null;
  html_url: string;
}

export interface ReleaseInfo {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
}

export interface RepoExtraInfo {
  workflow: WorkflowStatus | null;
  release: ReleaseInfo | null;
}

interface RepoCardProps {
  repo: GitHubRepository;
  // Datos pre-cargados desde batch API (opcional para retrocompatibilidad)
  preloadedInfo?: RepoExtraInfo;
  // Si es true, no hace fetch individual (espera los datos del batch)
  skipIndividualFetch?: boolean;
  // Indica si se están cargando las releases desde el batch
  isLoadingRelease?: boolean;
  // Lista completa de repositorios para el modal de dependencias
  allRepos?: GitHubRepository[];
}

// Colores de lenguajes de GitHub
const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C#": "#178600",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  PowerShell: "#012456",
  AL: "#3AA6D0",
};

// Función para calcular la siguiente versión minor
function getNextMinorVersion(tagName: string | null): string {
  if (!tagName) return "1.0";
  
  // Extraer números de la versión (ej: "v1.2.3" -> [1, 2, 3])
  const numbers = tagName.match(/(\d+)/g);
  if (!numbers || numbers.length < 2) return "1.0";
  
  const major = parseInt(numbers[0]);
  const minor = parseInt(numbers[1]) + 1;
  return `${major}.${minor}`;
}

// Función para formatear tiempo relativo
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `hace ${diffYears} año${diffYears > 1 ? "s" : ""}`;
  if (diffMonths > 0) return `hace ${diffMonths} mes${diffMonths > 1 ? "es" : ""}`;
  if (diffWeeks > 0) return `hace ${diffWeeks} semana${diffWeeks > 1 ? "s" : ""}`;
  if (diffDays > 0) return `hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
  if (diffHours > 0) return `hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffMins > 0) return `hace ${diffMins} minuto${diffMins > 1 ? "s" : ""}`;
  return "hace un momento";
}

export function RepoCard({ 
  repo, 
  preloadedInfo, 
  skipIndividualFetch = false,
  isLoadingRelease: externalIsLoadingRelease = false,
  allRepos = [] 
}: RepoCardProps) {
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(
    preloadedInfo?.workflow ?? null
  );
  const [latestRelease, setLatestRelease] = useState<ReleaseInfo | null>(
    preloadedInfo?.release ?? null
  );
  // Si hay datos pre-cargados o se debe esperar el batch, no mostrar loading
  const [isLoading, setIsLoading] = useState(!preloadedInfo && !skipIndividualFetch);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUpdatingAlGo, setIsUpdatingAlGo] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releaseCommits, setReleaseCommits] = useState<Array<{
    sha: string;
    message: string;
    author: string;
    avatar_url?: string;
    date: string;
  }>>([]);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showDependenciesModal, setShowDependenciesModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Actualizar estados cuando llegan los datos pre-cargados
  useEffect(() => {
    if (preloadedInfo) {
      setWorkflowStatus(preloadedInfo.workflow);
      setLatestRelease(preloadedInfo.release);
      setIsLoading(false);
    }
  }, [preloadedInfo]);

  useEffect(() => {
    // Solo hacer fetch si no hay datos pre-cargados Y no se debe esperar el batch
    if (!preloadedInfo && !skipIndividualFetch) {
      const [owner, repoName] = repo.full_name.split("/");
      fetchWorkflowStatus(owner, repoName);
      fetchLatestRelease(owner, repoName);
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

  const fetchWorkflowStatus = async (owner: string, repoName: string) => {
    try {
      const res = await fetch(`/api/github/workflow-status?owner=${owner}&repo=${repoName}`);
      
      if (res.ok) {
        const data = await res.json();
        setWorkflowStatus(data.workflow);
      }
    } catch (error) {
      console.error("Error fetching workflow status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLatestRelease = async (owner: string, repoName: string) => {
    try {
      const res = await fetch(`/api/github/latest-release?owner=${owner}&repo=${repoName}`);
      
      if (res.ok) {
        const data = await res.json();
        setLatestRelease(data.release);
      }
    } catch (error) {
      console.error("Error fetching latest release:", error);
    }
  };

  const handleUpdateAlGo = async () => {
    setShowConfirmModal(false);
    setIsUpdatingAlGo(true);
    setIsMenuOpen(false);
    
    try {
      const [owner, repoName] = repo.full_name.split("/");
      const res = await fetch("/api/github/trigger-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner,
          repo: repoName,
          workflow: "UpdateGitHubGoSystemFiles.yaml",
          ref: "main",
          inputs: {
            templateUrl: "https://github.com/ARQUICONSULT-ES/AL-Go@main",
            downloadLatest: "true",
            directCommit: "false",
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al ejecutar workflow");
      }

      // Mostrar banner y abrir ventana después de 3 segundos
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
        fetchWorkflowStatus(owner, repoName);
      }, 2000);

    } catch (error) {
      console.error("Error triggering workflow:", error);
      alert(error instanceof Error ? error.message : "Error al ejecutar workflow");
    } finally {
      setIsUpdatingAlGo(false);
    }
  };

  const openConfirmModal = () => {
    setIsMenuOpen(false);
    setShowConfirmModal(true);
  };

  const openReleaseModal = async () => {
    setShowReleaseModal(true);
    setIsLoadingCommits(true);
    setReleaseCommits([]);

    try {
      const [owner, repoName] = repo.full_name.split("/");
      const base = latestRelease?.tag_name || "";
      const url = `/api/github/compare?owner=${owner}&repo=${repoName}&base=${base}&head=main`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReleaseCommits(data.commits || []);
      }
    } catch (error) {
      console.error("Error fetching commits:", error);
    } finally {
      setIsLoadingCommits(false);
    }
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">
              Confirmar actualización
            </h3>
            <p className="text-gray-300 mb-4">
              ¿Estás seguro de que deseas actualizar los archivos AL-Go del repositorio <span className="font-semibold text-blue-400">{repo.name}</span>?
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Esto ejecutará el workflow UpdateGitHubGoSystemFiles.yaml con la configuración por defecto.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
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

      {/* Modal de crear release */}
      {showReleaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl border border-gray-700 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Nueva release v{getNextMinorVersion(latestRelease?.tag_name ?? null)}
              </h3>
              <button
                onClick={() => setShowReleaseModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mb-3">
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
                      <span className="text-gray-500 font-mono shrink-0">
                        {commit.sha.substring(0, 7)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-300 break-words">{commit.message}</p>
                        <p className="text-xs text-gray-500 mt-0.5">by {commit.author}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
              <button
                onClick={() => setShowReleaseModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={releaseCommits.length === 0 || isLoadingCommits}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear release
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
              <span className="font-medium">Workflow iniciado correctamente</span>
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

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col gap-2">
        {/* Header: Nombre y estado */}
        <div className="flex items-start justify-between gap-2">
          <Link
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-semibold text-sm truncate"
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
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: languageColor || "#6e7681" }}
              />
              {repo.language}
            </span>
          )}
          
          {/* Separador */}
          {repo.language && (externalIsLoadingRelease || latestRelease) && (
            <span className="text-gray-600">•</span>
          )}
          
          {/* Release badge */}
          {externalIsLoadingRelease ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-gray-400 bg-gray-700/50">
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
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-colors"
              title={`Release: ${latestRelease.name || latestRelease.tag_name}`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 010 2.474l-5.026 5.026a1.75 1.75 0 01-2.474 0l-6.25-6.25A1.75 1.75 0 011 7.775zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 00.354 0l5.025-5.025a.25.25 0 000-.354l-6.25-6.25a.25.25 0 00-.177-.073H2.75a.25.25 0 00-.25.25v5.025zM6 5a1 1 0 110 2 1 1 0 010-2z" />
              </svg>
              {latestRelease.tag_name}
            </a>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-500 border border-gray-700">
              Sin release
            </span>
          )}
        </div>

        {/* Tiempo desde última modificación */}
        <div className="text-xs text-gray-500">
          Actualizado {getRelativeTime(repo.updated_at)}
        </div>

        {/* Boton de crear release y menu */}
        <div className="flex items-center gap-2 mt-auto">
          <button 
            onClick={openReleaseModal}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Crear release v{getNextMinorVersion(latestRelease?.tag_name ?? null)}
          </button>
          
          {/* Menu de tres puntos */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              disabled={isUpdatingAlGo}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
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
              <div className="absolute right-0 bottom-full mb-1 w-56 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <button
                    onClick={openConfirmModal}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualizar archivos AL-Go
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowDependenciesModal(true);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
