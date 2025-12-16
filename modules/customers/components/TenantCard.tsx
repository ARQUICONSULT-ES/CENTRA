"use client";

import { useState, useRef, useEffect } from "react";
import type { TenantCardProps } from "../types";
import { formatRelativeTime } from "../services/utils";
import { useEnvironments } from "../hooks/useEnvironments";
import { EnvironmentsList } from "./EnvironmentsList";
import { EnvironmentsModal } from "./EnvironmentsModal";

export function TenantCard({ tenant, onEdit }: TenantCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { 
    environments, 
    isLoading: isLoadingEnvs, 
    isSyncing,
    error,
    loadEnvironments,
    syncEnvironmentsData 
  } = useEnvironments(tenant.id);

  // Cargar entornos desde la DB al montar el componente
  useEffect(() => {
    loadEnvironments();
  }, [loadEnvironments]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEdit = () => {
    onEdit?.(tenant);
    setIsMenuOpen(false);
  };

  const handleManageEnvironments = () => {
    setIsModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleRefreshEnvironments = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSyncError(null);
    try {
      await syncEnvironmentsData();
    } catch (error) {
      console.error("Error refreshing environments:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al sincronizar environments";
      setSyncError(errorMessage);
      
      // Mostrar alert al usuario
      alert(`Error al sincronizar entornos: ${errorMessage}\n\nVerifica que el tenant tenga un token válido configurado.`);
    }
  };

  const handleShowAllEnvironments = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col gap-3 hover:shadow-lg transition-shadow">
      {/* Header con nombre y menú */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <button
            onClick={handleEdit}
            className="font-semibold text-gray-900 dark:text-white text-sm truncate text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {tenant.customerName}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5 truncate">
            ID: {tenant.id}
          </p>
        </div>

        {/* Menú de 3 puntos */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuToggle}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            title="Más opciones"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Editar tenant
                </button>
                <button
                  onClick={handleManageEnvironments}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Gestionar entornos
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Descripción del tenant */}
      {tenant.description && (
        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {tenant.description}
        </div>
      )}

      {/* Sección de Entornos */}
      <div className="space-y-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Entornos ({environments.length})
            </span>
          </div>
          <button
            onClick={handleRefreshEnvironments}
            disabled={isSyncing}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors disabled:opacity-50 disabled:cursor-wait"
            title="Sincronizar entornos desde Business Central"
          >
            <svg 
              className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>
        <EnvironmentsList 
          environments={environments} 
          isLoading={isLoadingEnvs}
          maxVisible={3}
          onShowMore={handleShowAllEnvironments}
        />
        {(error || syncError) && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
            ⚠️ {error || syncError}
          </div>
        )}
      </div>

      {/* Footer con fecha de actualización */}
      <div className="mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Actualizado {formatRelativeTime(tenant.modifiedAt)}</span>
        </div>
      </div>

      {/* Modal de Entornos */}
      <EnvironmentsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        environments={environments}
        tenantName={tenant.customerName}
        isLoading={isLoadingEnvs}
        onRefresh={syncEnvironmentsData}
        isRefreshing={isSyncing}
      />
    </div>
  );
}
