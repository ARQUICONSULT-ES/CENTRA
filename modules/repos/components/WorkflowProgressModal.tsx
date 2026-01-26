"use client";

import { useState, useEffect } from "react";

interface WorkflowStatus {
  status: "queued" | "in_progress" | "completed";
  conclusion: "success" | "failure" | "cancelled" | null;
  html_url: string;
}

interface WorkflowProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: string;
  repo: string;
  releaseName: string;
  type: "release" | "prerelease";
}

export function WorkflowProgressModal({
  isOpen,
  onClose,
  owner,
  repo,
  releaseName,
  type,
}: WorkflowProgressModalProps) {
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setWorkflowStatus(null);
      setIsLoading(true);
      setError(null);
      return;
    }

    const fetchWorkflowStatus = async () => {
      try {
        const response = await fetch(
          `/api/github/workflow-status?owner=${owner}&repo=${repo}&workflow=CreateRelease.yaml`
        );

        if (!response.ok) {
          throw new Error("Error al obtener estado del workflow");
        }

        const data = await response.json();
        
        if (data.workflow) {
          setWorkflowStatus(data.workflow);
          setIsLoading(false);
        } else {
          // Si aún no hay workflow disponible, seguir esperando
          setIsLoading(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        setIsLoading(false);
      }
    };

    // Fetch inicial
    fetchWorkflowStatus();

    // Polling cada 10 segundos
    const intervalId = setInterval(() => {
      fetchWorkflowStatus();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [isOpen, owner, repo]);

  if (!isOpen) return null;

  const isCompleted = workflowStatus?.status === "completed";
  const isSuccess = isCompleted && workflowStatus?.conclusion === "success";
  const isFailure = isCompleted && workflowStatus?.conclusion === "failure";
  const isCancelled = isCompleted && workflowStatus?.conclusion === "cancelled";

  const getStatusIcon = () => {
    if (error) {
      return (
        <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    }

    if (isSuccess) {
      return (
        <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M5 8.5L7 10.5L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    if (isFailure) {
      return (
        <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    }

    if (isCancelled) {
      return (
        <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M5 8H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    }

    // En progreso o en cola
    if (workflowStatus?.status === "in_progress") {
      return (
        <svg className="w-12 h-12 animate-spin" fill="none" viewBox="0 0 16 16" style={{ color: '#d29922' }}>
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" fill="none" />
          <path d="M8 1 A7 7 0 0 1 15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    }

    // Queued o iniciando
    return (
      <svg className="w-12 h-12 animate-pulse" fill="none" viewBox="0 0 16 16" style={{ color: '#d29922' }}>
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="8" cy="8" r="2" fill="currentColor" />
      </svg>
    );
  };

  const getStatusText = () => {
    if (error) {
      return "Error al monitorear el workflow";
    }

    if (isLoading && !workflowStatus) {
      return "Iniciando workflow...";
    }

    if (isSuccess) {
      return `${type === "release" ? "Release" : "Prerelease"} creada exitosamente`;
    }

    if (isFailure) {
      return "El workflow ha fallado";
    }

    if (isCancelled) {
      return "El workflow fue cancelado";
    }

    if (workflowStatus?.status === "queued") {
      return "Workflow en cola...";
    }

    if (workflowStatus?.status === "in_progress") {
      return "Ejecutando workflow...";
    }

    return "Procesando...";
  };

  const getStatusDescription = () => {
    if (error) {
      return error;
    }

    if (isSuccess) {
      return `La ${type === "release" ? "release" : "prerelease"} ${releaseName} se ha creado correctamente.`;
    }

    if (isFailure) {
      return "Revisa los logs del workflow en GitHub para más detalles.";
    }

    if (isCancelled) {
      return "El workflow fue cancelado manualmente.";
    }

    return `Monitoreando el progreso de ${releaseName}...`;
  };

  const bgColor = type === "prerelease" ? "bg-orange-600" : "bg-green-600";
  const hoverColor = type === "prerelease" ? "hover:bg-orange-500" : "hover:bg-green-500";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Progreso del Workflow
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Status Icon */}
        <div className="flex flex-col items-center mb-6">
          {getStatusIcon()}
          <h4 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white text-center">
            {getStatusText()}
          </h4>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            {getStatusDescription()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          {workflowStatus?.html_url && (
            <a
              href={workflowStatus.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
              Ver en GitHub
            </a>
          )}
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium text-white ${bgColor} ${hoverColor} rounded-md transition-colors`}
          >
            {isCompleted ? "Cerrar" : "Cerrar y continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
