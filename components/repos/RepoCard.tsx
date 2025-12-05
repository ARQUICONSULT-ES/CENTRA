"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitHubRepository } from "@/types/github";

interface WorkflowStatus {
  status: "queued" | "in_progress" | "completed";
  conclusion: "success" | "failure" | "cancelled" | "skipped" | null;
  html_url: string;
}

interface ReleaseInfo {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
}

interface RepoCardProps {
  repo: GitHubRepository;
}

export function RepoCard({ repo }: RepoCardProps) {
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(null);
  const [latestRelease, setLatestRelease] = useState<ReleaseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRelease, setIsLoadingRelease] = useState(true);

  useEffect(() => {
    const [owner, repoName] = repo.full_name.split("/");
    fetchWorkflowStatus(owner, repoName);
    fetchLatestRelease(owner, repoName);
  }, [repo.full_name]);

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
    } finally {
      setIsLoadingRelease(false);
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

  return (
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

      {/* Version badge */}
      <div>
        {isLoadingRelease ? (
          <div className="h-5 w-16 bg-gray-700 rounded animate-pulse" />
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

      {/* Boton de crear release */}
      <div className="flex items-center gap-2 mt-auto">
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-300 transition-colors">
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          Create minor v1.0
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
