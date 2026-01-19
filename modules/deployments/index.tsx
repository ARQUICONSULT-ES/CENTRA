"use client";

import { useState } from "react";
import { useAllEnvironments } from "@/modules/customers/hooks/useAllEnvironments";
import { useApplications } from "@/modules/applications/hooks/useApplications";
import { useDeployment } from "./hooks/useDeployment";
import { EnvironmentSelector } from "./components/EnvironmentSelector";
import { ApplicationList } from "./components/ApplicationList";
import { ApplicationSelectorModal } from "./components/ApplicationSelectorModal";
import type { Application } from "@/modules/applications/types";

export function DeploymentsPage() {
  const { environments, loading: loadingEnvs } = useAllEnvironments();
  const { applications, isLoading: loadingApps } = useApplications();
  const {
    selectedEnvironment,
    setSelectedEnvironment,
    applications: selectedApplications,
    addApplication,
    addApplications,
    removeApplication,
    moveApplicationUp,
    moveApplicationDown,
    reorderApplications,
  } = useDeployment();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter active environments
  const activeEnvironments = environments.filter(
    env => env.status?.toLowerCase() !== 'softdeleted'
  );

  const selectedAppIds = selectedApplications.map((app: Application) => app.id);

  const handleDeploy = () => {
    // Aquí se implementará la lógica de despliegue
    console.log("Desplegando aplicaciones:", selectedApplications);
    console.log("En entorno:", selectedEnvironment);
    alert(`Se desplegarán ${selectedApplications.length} aplicaciones en ${selectedEnvironment?.name}`);
  };

  if (loadingEnvs || loadingApps) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="Volver atrás"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Despliegues
        </h1>
      </div>

      {/* Main Content - Two Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Environments */}
        <EnvironmentSelector
          environments={activeEnvironments}
          selectedEnvironment={selectedEnvironment}
          onSelectEnvironment={setSelectedEnvironment}
        />

        {/* Right Panel - Applications */}
        <ApplicationList
          applications={selectedApplications}
          selectedEnvironmentName={selectedEnvironment?.name || null}
          onRemove={removeApplication}
          onMoveUp={moveApplicationUp}
          onMoveDown={moveApplicationDown}
          onAddClick={() => setIsModalOpen(true)}
          onDeploy={handleDeploy}
          onReorder={reorderApplications}
        />
      </div>

      {/* Application Selector Modal */}
      <ApplicationSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applications={applications}
        onSelectApplications={addApplications}
        selectedApplicationIds={selectedAppIds}
      />
    </div>
  );
}
