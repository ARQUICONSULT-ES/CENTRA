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
              <div className="p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {data.installations.map((installation) => {
                  const isOutdated = latestVersion && isVersionOutdated(installation.version, latestVersion);
                  const envTypeColor = installation.environmentType?.toLowerCase() === 'production' 
                    ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30' 
                    : 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
                  
                  return (
                    <Link
                      key={`${installation.tenantId}-${installation.environmentName}`}
                      href={`/environments/${installation.tenantId}/${installation.environmentName}`}
                      className="flex flex-col p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                      {/* Header de la tarjeta con tipo de entorno */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                          </svg>
                          {installation.environmentType && (
                            <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${envTypeColor}`}>
                              {installation.environmentType}
                            </span>
                          )}
                        </div>
                        <svg 
                          className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>

                      {/* Nombre del entorno */}
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {installation.environmentName}
                      </h4>
                        
                      {/* Versión instalada */}
                      <div className="mt-auto space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">Versión:</span>
                          <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
                            v{installation.version}
                          </span>
                        </div>
                        
                        {/* Badges de estado */}
                        {(isOutdated || (installation.environmentStatus && installation.environmentStatus.toLowerCase() !== 'active')) && (
                          <div className="flex flex-wrap gap-1.5">
                            {isOutdated && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Desactualizada
                              </span>
                            )}

                            {installation.environmentStatus && installation.environmentStatus.toLowerCase() !== 'active' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
                                {installation.environmentStatus}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
