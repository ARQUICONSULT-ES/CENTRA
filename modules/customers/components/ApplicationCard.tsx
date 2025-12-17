"use client";

import type { ApplicationWithEnvironment } from "../types";

interface ApplicationCardProps {
  application: ApplicationWithEnvironment;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  // Badge de tipo de aplicación (Global=Verde, Tenant=Azul)
  const getTypeBadgeColor = (publishedAs: string) => {
    const typeLower = publishedAs.toLowerCase();
    if (typeLower === "global") {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
    if (typeLower === "tenant") {
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
    return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  };

  // Círculo de estado de la aplicación
  const getStateDotColor = (state?: string | null) => {
    if (!state) return "bg-gray-400";
    
    const stateLower = state.toLowerCase();
    if (stateLower === "installed") {
      return "bg-green-500";
    }
    if (stateLower === "updating") {
      return "bg-yellow-500";
    }
    if (stateLower === "uninstalling") {
      return "bg-red-500";
    }
    return "bg-gray-400";
  };

  return (
    <div className="group relative inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md">
      {/* Círculo de estado */}
      {application.state && (
        <span className={`w-2 h-2 rounded-full ${getStateDotColor(application.state)}`} />
      )}
      
      {/* Información básica */}
      <div className="flex flex-col gap-0.5">
        {/* Nombre de la aplicación */}
        <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
          {application.name}
        </span>
        
        {/* Publisher y Version */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="truncate max-w-[120px]">{application.publisher}</span>
          <span>•</span>
          <span className="font-mono">{application.version}</span>
        </div>
      </div>
      
      {/* Badge de tipo */}
      <span className={`text-[10px] px-2 py-1 rounded font-medium ml-auto ${getTypeBadgeColor(application.publishedAs)}`}>
        {application.publishedAs}
      </span>
      
      {/* Tooltip con información detallada */}
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-80 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
        <div className="space-y-2 text-xs">
          {/* Nombre */}
          <div className="font-semibold text-base text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            {application.name}
          </div>
          
          {/* Publisher */}
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Publisher:</span>
            <span className="text-gray-900 dark:text-white font-medium">{application.publisher}</span>
          </div>
          
          {/* Version */}
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Version:</span>
            <span className="text-gray-900 dark:text-white font-mono">{application.version}</span>
          </div>
          
          {/* Tipo */}
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
            <span className={`text-[10px] px-2 py-1 rounded font-medium ${getTypeBadgeColor(application.publishedAs)}`}>
              {application.publishedAs}
            </span>
          </div>
          
          {/* Estado */}
          {application.state && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Estado:</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getStateDotColor(application.state)}`} />
                <span className="text-gray-900 dark:text-white font-medium capitalize">
                  {application.state}
                </span>
              </div>
            </div>
          )}
          
          {/* Separador */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
          
          {/* Customer */}
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Cliente:</span>
            <span className="text-gray-900 dark:text-white font-medium">{application.customerName}</span>
          </div>
          
          {/* Environment */}
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Entorno:</span>
            <span className="text-gray-900 dark:text-white font-medium">{application.environmentName}</span>
          </div>
          
          {/* Environment Type */}
          {application.environmentType && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Tipo Entorno:</span>
              <span className="text-gray-900 dark:text-white">{application.environmentType}</span>
            </div>
          )}
          
          {/* App ID */}
          <div className="flex justify-between items-start">
            <span className="text-gray-500 dark:text-gray-400">ID:</span>
            <span className="text-gray-900 dark:text-white font-mono text-[10px] break-all text-right max-w-[200px]">
              {application.id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
