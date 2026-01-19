"use client";

import { useState } from "react";
import type { DeploymentApplication } from "../types";

interface ApplicationListProps {
  applications: DeploymentApplication[];
  selectedEnvironmentName: string | null;
  onRemove: (appId: string) => void;
  onMoveUp: (appId: string) => void;
  onMoveDown: (appId: string) => void;
  onAddClick: () => void;
  onDeploy: () => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

export function ApplicationList({
  applications,
  selectedEnvironmentName,
  onRemove,
  onMoveUp,
  onMoveDown,
  onAddClick,
  onDeploy,
  onReorder,
}: ApplicationListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const sortedApplications = [...applications].sort((a, b) => a.order - b.order);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDeploy = () => {
    if (!selectedEnvironmentName) {
      alert("⚠️ Debes seleccionar un entorno antes de desplegar");
      return;
    }
    if (applications.length === 0) {
      alert("⚠️ Debes añadir al menos una aplicación para desplegar");
      return;
    }
    onDeploy();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Aplicaciones a Desplegar
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {applications.length === 0 ? (
                ""
              ) : (
                <>
                  {applications.length} aplicación{applications.length !== 1 ? 'es' : ''} • 
                  {selectedEnvironmentName ? (
                    <span className="text-blue-600 dark:text-blue-400 font-medium ml-1">
                      {selectedEnvironmentName}
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-medium ml-1">
                      Sin entorno seleccionado
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onAddClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir Aplicación
        </button>
      </div>

      {/* Application List */}
      <div className="flex-1 overflow-y-auto p-5">
        {sortedApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400 dark:text-gray-500"
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
            </div>
            <p className="text-gray-500 dark:text-gray-500 text-xs">
              Haz clic en &quot;Añadir Aplicación&quot; para comenzar
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedApplications.map((app, index) => (
              <div
                key={app.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`group p-3.5 rounded-lg border bg-white dark:bg-gray-800 transition-all cursor-move ${
                  draggedIndex === index
                    ? "opacity-50 scale-95"
                    : dragOverIndex === index
                    ? "border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02]"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Drag Handle */}
                  <div className="flex-shrink-0 cursor-move">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>

                  {/* Order Number */}
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold shadow-sm">
                    {index + 1}
                  </div>

                  {/* Logo */}
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden shadow-sm">
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
                            parent.innerHTML = `<span class="text-white font-semibold text-xs">${app.name.substring(0, 2).toUpperCase()}</span>`;
                          }
                        }}
                      />
                    ) : (
                      <span className="text-white font-semibold text-xs">
                        {app.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {app.name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {app.publisher}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {app.latestReleaseVersion && (
                        <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${
                          app.versionType === 'release'
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}>
                          {app.versionType === 'release' ? `✓ Release ${app.latestReleaseVersion}` : `Release ${app.latestReleaseVersion}`}
                        </span>
                      )}
                      {app.versionType === 'prerelease' && (
                        <span className="inline-block text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium">
                          ✓ Prerelease --
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {/* Move Up */}
                    <button
                      onClick={() => onMoveUp(app.id)}
                      disabled={index === 0}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Subir"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={() => onMoveDown(app.id)}
                      disabled={index === sortedApplications.length - 1}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Bajar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => onRemove(app.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with Deploy Button */}
      {applications.length > 0 && (
        <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={handleDeploy}
            disabled={!selectedEnvironmentName}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
            title={!selectedEnvironmentName ? "Debes seleccionar un entorno primero" : "Desplegar aplicaciones"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {!selectedEnvironmentName ? "Selecciona un entorno" : `Desplegar ${applications.length} Aplicación${applications.length !== 1 ? 'es' : ''}`}
          </button>
          {!selectedEnvironmentName && (
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2 font-medium">
              ⚠️ Primero debes seleccionar un entorno destino
            </p>
          )}
        </div>
      )}
    </div>
  );
}
