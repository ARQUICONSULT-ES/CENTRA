"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { InstalledAppWithEnvironment } from "@/modules/customers/types";
import { isVersionOutdated } from "@/modules/applications/utils/versionComparison";

interface InstallationsByCustomerProps {
  installations: InstalledAppWithEnvironment[];
  isLoading?: boolean;
  latestVersion?: string;
}

export function InstallationsByCustomer({ 
  installations, 
  isLoading = false,
  latestVersion,
}: InstallationsByCustomerProps) {
  // Agrupar instalaciones por cliente
  const groupedByCustomer = installations.reduce((acc, installation) => {
    if (!acc[installation.customerName]) {
      acc[installation.customerName] = {
        customerId: installation.customerId,
        customerImage: installation.customerImage,
        installations: [],
      };
    }
    acc[installation.customerName].installations.push(installation);
    return acc;
  }, {} as Record<string, { 
    customerId: string; 
    customerImage?: string | null; 
    installations: InstalledAppWithEnvironment[] 
  }>);

  // Inicializar todos los clientes como expandidos
  const allCustomerIds = Object.values(groupedByCustomer).map(data => data.customerId);
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set(allCustomerIds));

  // Actualizar clientes expandidos cuando cambian las instalaciones
  useEffect(() => {
    setExpandedCustomers(new Set(allCustomerIds));
  }, [installations.length]);
  
  const toggleCustomer = (customerId: string) => {
    setExpandedCustomers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="grid gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (installations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
          <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No hay instalaciones
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Esta aplicación aún no está instalada en ningún entorno
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedByCustomer).map(([customerName, data]) => {
        const isExpanded = expandedCustomers.has(data.customerId);
        
        return (
          <div key={data.customerId} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Header del cliente */}
            <div className="flex items-center w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              {/* Botón de expandir/colapsar */}
              <button
                onClick={() => toggleCustomer(data.customerId)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors mr-2 flex-shrink-0"
                aria-label={isExpanded ? "Colapsar" : "Expandir"}
              >
                <svg
                  className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Información del cliente */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {data.customerImage ? (
                    <img 
                      src={data.customerImage} 
                      alt={customerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">{customerName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                    {customerName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {data.installations.length} instalación{data.installations.length !== 1 ? 'es' : ''}
                  </p>
                </div>
              </div>
              
              {/* Link al cliente */}
              <Link 
                href={`/customers/${data.customerId}/edit`}
                className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                title="Ver cliente"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
            
            {/* Grid de instalaciones (entornos como tarjetas) */}
            {isExpanded && (
              <div className="p-4">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {data.installations.map((installation) => {
                    const isOutdated = latestVersion && isVersionOutdated(installation.version, latestVersion);
                    
                    // Badge de tipo de entorno (Production=Verde, Sandbox=Azul)
                    const getEnvTypeBadgeColor = (envType?: string | null) => {
                      const typeLower = envType?.toLowerCase();
                      if (typeLower === "production") {
                        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
                      }
                      if (typeLower === "sandbox") {
                        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
                      }
                      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
                    };
                    
                    // Badge de publishedAs (Global=Verde, Tenant=Azul)
                    const getPublishedAsBadgeColor = (publishedAs: string) => {
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
                    
                    return (
                      <Link
                        key={`${installation.tenantId}-${installation.environmentName}`}
                        href={`/environments/${installation.tenantId}/${installation.environmentName}`}
                        className={`group relative inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm hover:shadow-md cursor-pointer ${
                          isOutdated 
                            ? 'border-orange-300 dark:border-orange-600 hover:border-orange-400 dark:hover:border-orange-500' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                        }`}
                      >
                        {/* Badge de "Desactualizada" si aplica */}
                        {isOutdated && (
                          <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-semibold rounded-full shadow-md z-10">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Desactualizada
                          </div>
                        )}
                        
                        {/* Información básica */}
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          {/* Header: Nombre del entorno (izquierda) + Tipo (derecha) */}
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white break-words flex-1">
                              {installation.environmentName}
                            </span>
                            <div className="flex gap-1 flex-shrink-0">
                              {installation.environmentType && (
                                <span className={`text-[10px] px-2 py-0.5 rounded font-medium whitespace-nowrap ${getEnvTypeBadgeColor(installation.environmentType)}`}>
                                  {installation.environmentType}
                                </span>
                              )}
                              <span className={`text-[10px] px-2 py-0.5 rounded font-medium whitespace-nowrap ${getPublishedAsBadgeColor(installation.publishedAs)}`}>
                                {installation.publishedAs}
                              </span>
                            </div>
                          </div>
                          
                          {/* Footer: Estado (izquierda) + Versión (derecha) */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
                              {installation.environmentStatus || 'Unknown'}
                            </span>
                            <span className="text-xs font-mono text-gray-600 dark:text-gray-400 flex-shrink-0">
                              v{installation.version}
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
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
