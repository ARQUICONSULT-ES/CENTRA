"use client";

import Link from "next/link";
import type { InstalledAppWithEnvironment } from "@/modules/customers/types";
import { isVersionOutdated } from "@/modules/applications/utils/versionComparison";

interface ApplicationCardProps {
  application: InstalledAppWithEnvironment;
  latestVersion?: string; // Versión más reciente de la aplicación para comparar
}

export function ApplicationCard({ application, latestVersion }: ApplicationCardProps) {
  // Badge de tipo de aplicación (Global=Verde, Tenant=Azul, Dev=Rojo)
  const getTypeBadgeColor = (publishedAs: string) => {
    const typeLower = publishedAs.toLowerCase();
    if (typeLower === "global") {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
    if (typeLower === "tenant") {
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
    if (typeLower === "dev") {
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }
    return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  };

  // Verificar si la instalación está desactualizada (versión instalada < versión más reciente)
  const isOutdated = isVersionOutdated(application.version, latestVersion);

  return (
    <Link 
      href={`/applications/${application.id}`}
      className={`group relative inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm hover:shadow-md cursor-pointer ${
        isOutdated 
          ? 'border-orange-300 dark:border-orange-600 hover:border-orange-400 dark:hover:border-orange-500' 
          : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
      }`}
    >
      {/* Badge de "Desactualizada" si aplica */}
      {isOutdated && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-semibold rounded-full shadow-md">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Desactualizada
        </div>
      )}
      {/* Información básica */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {/* Header: Nombre (izquierda) + PublishedAs (derecha) */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
            {application.name}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-medium whitespace-nowrap flex-shrink-0 ${getTypeBadgeColor(application.publishedAs)}`}>
            {application.publishedAs}
          </span>
        </div>
        
        {/* Footer: Publisher (izquierda) + Version (derecha) */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1" title={application.publisher}>
            {application.publisher}
          </span>
          <span className="text-xs font-mono text-gray-600 dark:text-gray-400 flex-shrink-0">
            {application.version}
          </span>
        </div>
      </div>
      
      {/* Icono de navegación */}
      <svg 
        className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
