"use client";

import { useEffect, useState } from "react";

export interface DeploymentStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

// Estados del despliegue de una aplicación:
// - pending: Esperando a ser procesada
// - in-progress: Se está procesando (validando, descargando o instalando - ver steps para detalles)
// - success: Instalada correctamente
// - error: Falló algún paso
export interface DeploymentProgress {
  applicationId: string;
  applicationName: string;
  status: 'pending' | 'in-progress' | 'success' | 'error';
  message?: string;
  error?: string;
  steps?: DeploymentStep[];
  startTime?: number; // Timestamp cuando inició el despliegue
  endTime?: number; // Timestamp cuando terminó (success o error)
}

interface DeploymentProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalApps: number;
  progressData: DeploymentProgress[];
  environmentName?: string;
}

export function DeploymentProgressModal({
  isOpen,
  onClose,
  totalApps,
  progressData,
  environmentName,
}: DeploymentProgressModalProps) {
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [totalStartTime] = useState(Date.now());

  const successCount = progressData.filter(p => p.status === 'success').length;
  const errorCount = progressData.filter(p => p.status === 'error').length;
  const abortedCount = progressData.filter(p => p.error?.includes('abortado')).length;
  const pendingCount = progressData.filter(p => p.status === 'pending').length;
  const inProgressCount = progressData.filter(p => p.status === 'in-progress').length;

  // Timer para actualizar los contadores cada segundo
  useEffect(() => {
    if (!isOpen || isComplete) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isComplete]);

  // Función para formatear tiempo: primero solo segundos, luego minutos:segundos
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcular tiempo transcurrido para cada app
  const getElapsedTime = (item: DeploymentProgress): string => {
    if (!item.startTime || item.status === 'pending') return '';
    
    // Si tiene endTime, usar ese tiempo final (congelado)
    const endTime = item.endTime || currentTime;
    const elapsed = Math.floor((endTime - item.startTime) / 1000);
    
    // Prevenir valores negativos
    const safeElapsed = Math.max(0, elapsed);
    return formatTime(safeElapsed);
  };

  // Calcular tiempo total
  const getTotalElapsedTime = (): string => {
    const elapsed = Math.floor((currentTime - totalStartTime) / 1000);
    
    // Prevenir valores negativos
    const safeElapsed = Math.max(0, elapsed);
    return formatTime(safeElapsed);
  };

  useEffect(() => {
    if (!isOpen) {
      setIsComplete(false);
      setHasError(false);
      return;
    }

    // Detectar si se completó o hubo error
    const hasErrorNow = progressData.some(p => p.status === 'error');
    const isCompleteNow = progressData.length > 0 && progressData.every(p => 
      p.status === 'success' || p.status === 'error'
    );

    setHasError(hasErrorNow);
    setIsComplete(isCompleteNow);
  }, [isOpen, progressData]);

  const getStatusIcon = (status: DeploymentProgress['status'], error?: string) => {
    // Si tiene mensaje de abortado, mostrar icono especial
    if (error?.includes('abortado')) {
      return (
        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    }
    
    switch (status) {
      case 'pending':
        return (
          <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-400 dark:border-gray-500 flex items-center justify-center">
            <span className="text-xs text-gray-400 dark:text-gray-500">⏸</span>
          </div>
        );
      case 'in-progress':
        return (
          <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case 'success':
        return (
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusText = (status: DeploymentProgress['status'], error?: string, steps?: DeploymentStep[]) => {
    if (error?.includes('abortado')) {
      return '⏸️ Abortado';
    }
    
    switch (status) {
      case 'pending': return '⏳ En espera';
      case 'in-progress': {
        // Mostrar el paso actual basado en cuál está en 'running'
        const currentStep = steps?.find(s => s.status === 'running');
        if (currentStep) {
          if (currentStep.name.includes('Validación')) return '🔍 Validando...';
          if (currentStep.name.includes('Descarga')) return '📥 Descargando...';
          if (currentStep.name.includes('Instalación')) return '⚙️ Instalando en BC...';
        }
        return '⏳ Procesando...';
      }
      case 'success': return '✅ Instalado correctamente';
      case 'error': return '❌ Error en instalación';
      default: return '';
    }
  };

  const getStepIcon = (status: DeploymentStep['status']) => {
    switch (status) {
      case 'pending':
        return (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
        );
      case 'running':
        return (
          <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case 'success':
        return (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Progreso de Despliegue
            </h2>
            {isComplete && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <div className="flex gap-4">
                {successCount > 0 && <span className="text-green-600 dark:text-green-400">✅ {successCount} completadas</span>}
                {inProgressCount > 0 && <span className="text-blue-600 dark:text-blue-400">⏳ {inProgressCount} en proceso</span>}
                {pendingCount > 0 && <span className="text-gray-500">⏸️ {pendingCount} pendientes</span>}
                {errorCount > 0 && <span className="text-red-600 dark:text-red-400">❌ {errorCount} fallidas</span>}
                {abortedCount > 0 && <span className="text-orange-600 dark:text-orange-400">⏸️ {abortedCount} abortadas</span>}
              </div>
              <span className="font-medium">{Math.round((successCount / totalApps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 transition-all duration-300 ${
                  hasError ? 'bg-red-500' : 'bg-blue-600'
                }`}
                style={{ width: `${(successCount / totalApps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Applications list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {progressData.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Preparando despliegue...
            </div>
          ) : (
            progressData.map((item, index) => (
              <div
                key={item.applicationId}
                className={`p-4 rounded-lg border-2 transition-all ${
                  item.error?.includes('abortado')
                    ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20'
                    : item.status === 'error'
                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    : item.status === 'success'
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                    : item.status === 'in-progress'
                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-300 dark:ring-blue-700'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(item.status, item.error)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          item.status === 'in-progress'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          #{index + 1}
                        </span>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {item.applicationName}
                        </h3>
                      </div>
                      {/* Timer individual */}
                      {item.startTime && (
                        <div className={`flex items-center gap-1 text-xs font-mono ${
                          item.status === 'in-progress'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{getElapsedTime(item)}</span>
                        </div>
                      )}
                    </div>
                    <p className={`text-sm mt-1 font-medium ${
                      item.error?.includes('abortado')
                        ? 'text-orange-600 dark:text-orange-400'
                        : item.status === 'error'
                        ? 'text-red-600 dark:text-red-400'
                        : item.status === 'success'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {getStatusText(item.status, item.error, item.steps)}
                    </p>
                    {item.message && !item.error && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {item.message}
                      </p>
                    )}
                    {item.error && (
                      <p className={`text-sm mt-1 font-medium ${
                        item.error?.includes('abortado')
                          ? 'text-orange-700 dark:text-orange-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {item.error}
                      </p>
                    )}
                    
                    {/* Steps Timeline */}
                    {item.steps && item.steps.length > 0 && (
                      <div className="mt-3 space-y-2 pl-2">
                        {item.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-center gap-2">
                            {getStepIcon(step.status)}
                            <div className="flex-1">
                              <span className={`text-xs font-medium ${
                                step.status === 'error'
                                  ? 'text-red-600 dark:text-red-400'
                                  : step.status === 'success'
                                  ? 'text-green-600 dark:text-green-400'
                                  : step.status === 'running'
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {step.name}
                              </span>
                              {step.message && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {step.message}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {isComplete && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {hasError ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-200">
                      Despliegue detenido por error
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      El despliegue se detuvo al encontrar un error. Las aplicaciones restantes no fueron procesadas.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">
                      ¡Despliegue completado!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Todas las aplicaciones se instalaron correctamente.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
