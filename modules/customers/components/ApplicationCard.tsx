"use client";

import type { ApplicationWithEnvironment } from "@/modules/customers/types";

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

  return (
    <div className="group relative inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md isolate">
      {/* Información básica */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        {/* Nombre de la aplicación */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {application.name}
          </span>
        </div>
        
        {/* Publisher y Version */}
        <div className="flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400 min-w-0">
          <span className="truncate flex-1" title={application.publisher}>{application.publisher}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[10px] px-2 py-1 rounded font-medium ${getTypeBadgeColor(application.publishedAs)}`}>
              {application.publishedAs}
            </span>
            <span className="font-mono">{application.version}</span>
          </div>
        </div>
      </div>
      
      {/* Tooltip con información detallada */}
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-80 p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-2xl pointer-events-none" style={{ zIndex: 9999 }}>
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
