"use client";

import { useState, useEffect } from "react";
import type { ReleaseInfo, Commit } from "@/modules/repos/types";
import { getNextMinorVersion } from "@/modules/repos/services/utils";

interface ReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRelease: () => Promise<void>;
  latestRelease: ReleaseInfo | null;
  commits: Commit[];
  isLoadingCommits: boolean;
  isCreating: boolean;
  canCreate: boolean;
  validationReason?: string;
  type: "release" | "prerelease";
  // Props adicionales para prerelease
  branches?: string[];
  selectedBranch?: string;
  onBranchChange?: (branch: string) => void;
  isLoadingBranches?: boolean;
  baseTag?: string;
}

export function ReleaseModal({
  isOpen,
  onClose,
  onCreateRelease,
  latestRelease,
  commits,
  isLoadingCommits,
  isCreating,
  canCreate,
  validationReason,
  type,
  branches = [],
  selectedBranch = "main",
  onBranchChange,
  isLoadingBranches = false,
  baseTag = "",
}: ReleaseModalProps) {
  if (!isOpen) return null;

  const nextVersion = getNextMinorVersion(latestRelease?.tag_name ?? null);
  const isPrerelease = type === "prerelease";
  const title = isPrerelease 
    ? `Nueva prerelease v${nextVersion}-preview`
    : `Nueva release v${nextVersion}`;
  
  const bgColor = isPrerelease ? "bg-orange-600" : "bg-green-600";
  const hoverColor = isPrerelease ? "hover:bg-orange-500" : "hover:bg-green-500";
  const buttonText = isPrerelease ? "Crear prerelease" : "Crear release";

  const baseVersion = isPrerelease 
    ? (baseTag || latestRelease?.tag_name)
    : latestRelease?.tag_name;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full shadow-xl border border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Descripción */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {baseVersion 
            ? `Cambios desde ${baseVersion}:`
            : `Commits a incluir en la primera ${isPrerelease ? 'prerelease' : 'release'}:`}
        </p>

        {/* Lista de commits */}
        <div className="flex-1 overflow-y-auto min-h-0 mb-4">
          {isLoadingCommits ? (
            <div className="flex items-center justify-center py-8">
              <svg className="w-6 h-6 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : commits.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {baseVersion 
                ? `No hay cambios desde ${baseVersion}`
                : "No hay commits disponibles"}
            </p>
          ) : (
            <ul className="space-y-3">
              {commits.map((commit) => (
                <li key={commit.sha} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-400 dark:text-gray-500 font-mono shrink-0">
                    {commit.sha.substring(0, 7)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 dark:text-gray-300 break-words">{commit.message}</p>
                    <p className="text-xs text-gray-500 mt-0.5">by {commit.author}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Validación de CI/CD */}
        {!canCreate && validationReason && (
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-md mb-4">
            <svg className="w-4 h-4 text-yellow-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-yellow-500">{validationReason}</p>
          </div>
        )}

        {/* Footer con acciones */}
        <div className={`flex ${isPrerelease ? 'flex-col sm:flex-row' : 'flex-row'} items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700`}>
          {/* Selector de rama (solo para prerelease) */}
          {isPrerelease && onBranchChange && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-gray-600 dark:text-gray-400 shrink-0">Rama:</span>
              <select
                value={selectedBranch}
                onChange={(e) => onBranchChange(e.target.value)}
                disabled={isLoadingBranches || isCreating}
                className="flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed truncate"
              >
                {isLoadingBranches ? (
                  <option>Cargando...</option>
                ) : branches.length > 0 ? (
                  branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))
                ) : (
                  <option>main</option>
                )}
              </select>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 justify-end shrink-0">
            <button
              onClick={onClose}
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={onCreateRelease}
              disabled={commits.length === 0 || isLoadingCommits || isCreating || !canCreate}
              className={`px-4 py-2 text-sm font-medium text-white ${bgColor} ${hoverColor} rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
              title={!canCreate ? validationReason : ""}
            >
              {isCreating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creando...
                </>
              ) : (
                buttonText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
