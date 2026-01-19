"use client";

import { useState } from "react";
import type { Application } from "@/modules/applications/types";
import type { VersionType } from "../types";

interface AppSelection {
  app: Application;
  versionType: VersionType;
}

interface ApplicationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: Application[];
  onSelectApplications: (apps: Array<{ app: Application; versionType: VersionType }>) => void;
  selectedApplicationIds: string[];
}

export function ApplicationSelectorModal({
  isOpen,
  onClose,
  applications,
  onSelectApplications,
  selectedApplicationIds,
}: ApplicationSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApps, setSelectedApps] = useState<Map<string, AppSelection>>(new Map());

  if (!isOpen) return null;

  const filteredApplications = applications.filter(app => 
    (app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.publisher.toLowerCase().includes(searchQuery.toLowerCase())) &&
    !selectedApplicationIds.includes(app.id)
  );

  const handleToggleVersion = (app: Application, versionType: VersionType) => {
    setSelectedApps(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(app.id);
      
      // Si ya está seleccionado con el mismo tipo, lo deseleccionamos
      if (existing && existing.versionType === versionType) {
        newMap.delete(app.id);
      } else {
        // Si no existe o tiene diferente tipo, lo seleccionamos con el nuevo tipo
        newMap.set(app.id, { app, versionType });
      }
      
      return newMap;
    });
  };

  const handleConfirm = () => {
    if (selectedApps.size > 0) {
      onSelectApplications(Array.from(selectedApps.values()));
      setSelectedApps(new Map());
      setSearchQuery("");
    }
    onClose();
  };

  const handleCancel = () => {
    setSelectedApps(new Map());
    setSearchQuery("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Seleccionar Aplicación
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
              placeholder="Buscar aplicación por nombre o publisher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Application List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p>
                {searchQuery
                  ? "No se encontraron aplicaciones"
                  : "Todas las aplicaciones ya están seleccionadas"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredApplications.map((app) => {
                const selection = selectedApps.get(app.id);
                const isReleaseSelected = selection?.versionType === 'release';
                const isPrereleaseSelected = selection?.versionType === 'prerelease';
                const hasRelease = !!app.latestReleaseVersion;
                const hasPrerelease = false; // TODO: Añadir campo en el futuro
                
                return (
                  <div
                    key={app.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      selection
                        ? "border-blue-500 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Logo */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden shadow-sm">
                        {app.logoBase64 ? (
                          <img
                            src={app.logoBase64.startsWith('data:') ? app.logoBase64 : `data:image/png;base64,${app.logoBase64}`}
                            alt={app.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-white font-semibold text-sm">${app.name.substring(0, 2).toUpperCase()}</span>`;
                              }
                            }}
                          />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {app.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {app.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {app.publisher}
                        </p>
                        {app.latestReleaseVersion && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                              v{app.latestReleaseVersion}
                            </span>
                            {app.latestReleaseDate && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(app.latestReleaseDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Version Selection Buttons */}
                      <div className="flex-shrink-0 flex flex-col gap-2">
                        {/* Release Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleVersion(app, 'release');
                          }}
                          disabled={!hasRelease}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isReleaseSelected
                              ? "bg-blue-600 text-white shadow-sm"
                              : hasRelease
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
                          }`}
                          title={!hasRelease ? "No hay release disponible" : "Seleccionar release"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Release {hasRelease ? app.latestReleaseVersion : "--"}
                        </button>

                        {/* Prerelease Button (Placeholder) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleVersion(app, 'prerelease');
                          }}
                          disabled={!hasPrerelease}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isPrereleaseSelected
                              ? "bg-purple-600 text-white shadow-sm"
                              : hasPrerelease
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-700 dark:hover:text-purple-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
                          }`}
                          title={!hasPrerelease ? "No hay prerelease disponible" : "Seleccionar prerelease"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Prerelease --
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedApps.size > 0 ? (
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {selectedApps.size} aplicación{selectedApps.size !== 1 ? 'es' : ''} seleccionada{selectedApps.size !== 1 ? 's' : ''}
                </span>
              ) : (
                <span>Selecciona una versión para añadir</span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedApps.size === 0}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirmar ({selectedApps.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
