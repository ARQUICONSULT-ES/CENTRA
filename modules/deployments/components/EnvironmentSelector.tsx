"use client";

import { useState } from "react";
import type { DeploymentEnvironment } from "../types";
import type { EnvironmentWithCustomer } from "@/modules/customers/types";

interface EnvironmentSelectorProps {
  environments: EnvironmentWithCustomer[];
  selectedEnvironment: DeploymentEnvironment | null;
  onSelectEnvironment: (env: DeploymentEnvironment) => void;
}

export function EnvironmentSelector({
  environments,
  selectedEnvironment,
  onSelectEnvironment,
}: EnvironmentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Group environments by customer
  const groupedEnvironments = environments.reduce((acc, env) => {
    const key = env.customerName || "Sin cliente";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(env);
    return acc;
  }, {} as Record<string, EnvironmentWithCustomer[]>);

  // Filter environments
  const filteredGroups = Object.entries(groupedEnvironments).reduce((acc, [customerName, envs]) => {
    const filtered = envs.filter(env => 
      env.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[customerName] = filtered;
    }
    return acc;
  }, {} as Record<string, EnvironmentWithCustomer[]>);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Seleccionar Entorno Destino
        </h2>
        
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar entorno o cliente..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Environment List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {Object.keys(filteredGroups).length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-sm">No se encontraron entornos</p>
          </div>
        ) : (
          Object.entries(filteredGroups).map(([customerName, envs]) => (
            <div key={customerName}>
              {/* Customer Header */}
              <div className="flex items-center gap-2 mb-2">
                {/* Customer Logo */}
                {envs[0].customerImage && (
                  <img
                    src={envs[0].customerImage}
                    alt={customerName}
                    className="w-6 h-6 rounded object-contain"
                  />
                )}
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {customerName}
                  {envs[0].tenantId && (
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
                      - {envs[0].tenantId}
                    </span>
                  )}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({envs.length})
                </span>
              </div>

              {/* Environments */}
              <div className="space-y-1">
                {envs.map((env) => {
                  const isSelected = selectedEnvironment?.tenantId === env.tenantId && 
                                    selectedEnvironment?.name === env.name;
                  
                  return (
                    <button
                      key={`${env.tenantId}-${env.name}`}
                      onClick={() => onSelectEnvironment({ ...env, selected: true })}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-600 shadow-sm"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${
                              isSelected
                                ? "text-blue-700 dark:text-blue-300"
                                : "text-gray-900 dark:text-gray-100"
                            }`}>
                              {env.name}
                            </span>
                            {env.type && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                env.type === "Production"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              }`}>
                                {env.type}
                              </span>
                            )}
                          </div>
                          {env.applicationVersion && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              BC {env.applicationVersion}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <svg
                            className="w-5 h-5 text-blue-600 dark:text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
