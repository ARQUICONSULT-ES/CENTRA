"use client";

import { useState } from "react";
import type { ApplicationWithEnvironment } from "@/modules/customers/types";
import { ApplicationCard } from "./ApplicationCard";

interface ApplicationsListProps {
  applications: ApplicationWithEnvironment[];
  isLoading?: boolean;
}

export function ApplicationsList({ 
  applications, 
  isLoading = false,
}: ApplicationsListProps) {
  // Agrupar aplicaciones por cliente para obtener todos los customerIds
  const groupedByCustomer = applications.reduce((acc, app) => {
    if (!acc[app.customerName]) {
      acc[app.customerName] = {
        customerId: app.customerId,
        customerImage: app.customerImage,
        applications: [],
      };
    }
    acc[app.customerName].applications.push(app);
    return acc;
  }, {} as Record<string, { 
    customerId: string; 
    customerImage?: string | null; 
    applications: ApplicationWithEnvironment[] 
  }>);

  // Inicializar todos los clientes como expandidos
  const allCustomerIds = Object.values(groupedByCustomer).map(data => data.customerId);
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set(allCustomerIds));
  
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

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
          <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No hay aplicaciones
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Haz clic en "Sincronizar Aplicaciones" para obtener las aplicaciones de Business Central
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedByCustomer).map(([customerName, data]) => {
        const isExpanded = expandedCustomers.has(data.customerId);
        
        return (
          <div key={data.customerId} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            {/* Header del cliente */}
            <button
              onClick={() => toggleCustomer(data.customerId)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Icono de expandir/colapsar */}
                <svg
                  className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform flex-shrink-0 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                
                <div className="flex-shrink-0 w-8 h-8 rounded-md overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {data.customerImage ? (
                    <img 
                      src={data.customerImage} 
                      alt={customerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{customerName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {customerName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {data.applications.length} aplicación{data.applications.length !== 1 ? 'es' : ''}
                  </p>
                </div>
              </div>
            </button>
            
            {/* Lista de aplicaciones agrupadas por entorno */}
            {isExpanded && (
              <div className="p-4">
                {(() => {
                  // Agrupar las aplicaciones de este cliente por entorno
                  const byEnvironment = data.applications.reduce((acc, app) => {
                    const envKey = `${app.environmentName}`;
                    if (!acc[envKey]) {
                      acc[envKey] = {
                        environmentName: app.environmentName,
                        environmentType: app.environmentType,
                        environmentStatus: app.environmentStatus,
                        applications: [],
                      };
                    }
                    acc[envKey].applications.push(app);
                    return acc;
                  }, {} as Record<string, { 
                    environmentName: string;
                    environmentType?: string | null;
                    environmentStatus?: string | null;
                    applications: ApplicationWithEnvironment[] 
                  }>);

                  // Función para obtener el color de la etiqueta de tipo
                  const getTypeColor = (type?: string | null) => {
                    const typeStr = type?.toLowerCase();
                    if (typeStr === 'production') {
                      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
                    } else if (typeStr === 'sandbox') {
                      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
                    }
                    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
                  };

                  return (
                    <div className="space-y-4">
                      {Object.entries(byEnvironment).map(([envKey, envData]) => (
                        <div key={envKey}>
                          {/* Header del entorno */}
                          <div className="mb-2 flex items-center gap-2">
                            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {envData.environmentName}
                            </h4>
                            {envData.environmentType && (
                              <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(envData.environmentType)}`}>
                                {envData.environmentType}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          ({envData.applications.length} app{envData.applications.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      
                      {/* Grid de aplicaciones */}
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {envData.applications.map((app) => (
                          <ApplicationCard 
                            key={`${app.tenantId}-${app.environmentName}-${app.id}`} 
                            application={app} 
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  })}
    </div>
  );
}
