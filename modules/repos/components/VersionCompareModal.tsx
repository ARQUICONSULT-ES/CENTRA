"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/modules/shared/hooks/useToast";

interface VersionCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: string;
  repo: string;
}

interface VersionData {
  settingsVersion: string; // repoVersion desde .AL-Go/settings.json
  appJsonVersion: string;  // version desde app.json
}

interface VersionParts {
  major: string;
  minor: string;
  build: string;
  revision: string;
}

type SaveStep = 
  | { status: 'idle' }
  | { status: 'creating_branch'; message: string }
  | { status: 'completed'; prUrl: string }
  | { status: 'error'; message: string };

const LoadingSpinner = ({ text = "Cargando..." }: { text?: string }) => (
  <div className="flex items-center justify-center h-32">
    <div className="flex items-center gap-2 text-gray-400">
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span className="text-sm">{text}</span>
    </div>
  </div>
);

export function VersionCompareModal({ isOpen, onClose, owner, repo }: VersionCompareModalProps) {
  const { error: showError, success: showSuccess } = useToast();
  
  const [versionData, setVersionData] = useState<VersionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsParts, setSettingsParts] = useState<VersionParts>({ major: '', minor: '', build: '', revision: '' });
  const [appJsonParts, setAppJsonParts] = useState<VersionParts>({ major: '', minor: '', build: '', revision: '' });
  const [latestRelease, setLatestRelease] = useState<string>("");
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [saveStep, setSaveStep] = useState<SaveStep>({ status: 'idle' });

  const isSaving = saveStep.status !== 'idle' && saveStep.status !== 'completed';

  useEffect(() => {
    if (!isOpen) return;

    // Reset estados al abrir el modal
    setVersionData(null);
    setError(null);
    setSettingsParts({ major: '', minor: '', build: '', revision: '' });
    setAppJsonParts({ major: '', minor: '', build: '', revision: '' });
    setLatestRelease("");
    setSaveStep({ status: 'idle' });

    fetchVersions();
    fetchBranches();
    fetchLatestRelease();
  }, [isOpen, owner, repo]);

  // Bloquear cierre con Escape mientras se está guardando
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSaving) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, isSaving]);

  const fetchVersions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch settings.json
      const settingsRes = await fetch(
        `/api/github/file-content?owner=${owner}&repo=${repo}&path=.AL-Go/settings.json&ref=main`,
        { cache: "no-store" }
      );

      // Fetch app.json
      const appJsonRes = await fetch(
        `/api/github/file-content?owner=${owner}&repo=${repo}&path=app.json&ref=main`,
        { cache: "no-store" }
      );

      if (!settingsRes.ok) {
        throw new Error("No se pudo obtener .AL-Go/settings.json");
      }

      if (!appJsonRes.ok) {
        throw new Error("No se pudo obtener app.json");
      }

      const settingsData = await settingsRes.json();
      const appJsonData = await appJsonRes.json();

      const settingsVersion = settingsData.content.repoVersion || "";
      const appJsonVersion = appJsonData.content.version || "";

      setVersionData({
        settingsVersion,
        appJsonVersion,
      });

      // Parsear settings version
      const settingsParsed = parseVersion(settingsVersion);
      setSettingsParts(settingsParsed);

      // Parsear app.json version
      const appJsonParsed = parseVersion(appJsonVersion);
      setAppJsonParts(appJsonParsed);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      showError(err instanceof Error ? err.message : "Error al cargar versiones");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLatestRelease = async () => {
    try {
      const res = await fetch(
        `/api/github/latest-release?owner=${owner}&repo=${repo}`,
        { cache: "no-store" }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.release?.tag_name) {
          setLatestRelease(data.release.tag_name);
        }
      }
    } catch (error) {
      console.error("Error fetching latest release:", error);
    }
  };

  const parseVersion = (version: string): VersionParts => {
    const parts = version.split('.');
    return {
      major: parts[0] || '',
      minor: parts[1] || '',
      build: parts[2] || '',
      revision: parts[3] || '',
    };
  };

  const buildSettingsVersionString = (parts: VersionParts): string => {
    // Settings solo usa major.minor
    return `${parts.major}.${parts.minor}`;
  };

  const buildAppJsonVersionString = (parts: VersionParts): string => {
    // App.json usa los 4 campos
    return `${parts.major}.${parts.minor}.${parts.build}.${parts.revision}`;
  };

  const applyRecommendedSettings = () => {
    if (!latestRelease) return;

    // Parsear la última release (ej: v1.0.4.5 o 1.0.4.5)
    const cleanVersion = latestRelease.replace(/^v/, '');
    const parts = cleanVersion.split('.');
    
    const major = parts[0] || '0';
    const minor = parts[1] || '0';
    const nextMinor = (parseInt(minor, 10) + 1).toString();

    // Establecer settings: major.(minor+1)
    setSettingsParts({
      major,
      minor: nextMinor,
      build: '',
      revision: '',
    });

    // Establecer app.json: major.(minor+1).0.0
    setAppJsonParts({
      major,
      minor: nextMinor,
      build: '0',
      revision: '0',
    });
  };

  const fetchBranches = async () => {
    setIsLoadingBranches(true);
    try {
      const res = await fetch(`/api/github/branches?owner=${owner}&repo=${repo}`, { cache: "no-store" });
      
      if (res.ok) {
        const data = await res.json();
        setBranches(data.branches);
        
        // Prioridad: dev -> main -> primera disponible
        let defaultBranch = "main";
        if (data.branches.includes("dev")) {
          defaultBranch = "dev";
        } else if (data.branches.includes("main")) {
          defaultBranch = "main";
        } else if (data.branches.length > 0) {
          defaultBranch = data.branches[0];
        }
        
        setSelectedBranch(defaultBranch);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  // Validar que el tercer número del app.json sea 0
  const validateAppJsonBuildNumber = (version: string): { valid: boolean; message?: string } => {
    const parts = version.split('.');
    if (parts.length !== 4) {
      return { valid: false, message: "La versión debe tener formato X.X.X.X" };
    }
    
    const buildNumber = parseInt(parts[2], 10);
    if (buildNumber !== 0) {
      return { 
        valid: false, 
        message: "El tercer número está reservado para el número de compilación de GitHub y debe ser siempre 0" 
      };
    }

    return { valid: true };
  };

  const hasChanges = (): boolean => {
    if (!versionData) return false;
    const currentSettings = buildSettingsVersionString(settingsParts);
    const currentAppJson = buildAppJsonVersionString(appJsonParts);
    return (
      currentSettings !== versionData.settingsVersion ||
      currentAppJson !== versionData.appJsonVersion
    );
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      showError("No hay cambios para guardar");
      return;
    }

    const editedAppJsonVersion = buildAppJsonVersionString(appJsonParts);
    const editedSettingsVersion = buildSettingsVersionString(settingsParts);

    // Validar formatos
    if (appJsonParts.major === '' || appJsonParts.minor === '' || appJsonParts.build === '' || appJsonParts.revision === '') {
      showError("La versión de app.json debe tener formato X.X.X.X (todos los campos requeridos)");
      return;
    }

    // Validar que el tercer número de app.json sea 0
    const buildValidation = validateAppJsonBuildNumber(editedAppJsonVersion);
    if (!buildValidation.valid) {
      showError(buildValidation.message || "Error en validación de versión");
      return;
    }

    // Validar que settings tenga major y minor
    if (settingsParts.major === '' || settingsParts.minor === '') {
      showError("La versión de settings debe tener formato X.X");
      return;
    }

    try {
      // Llamar al endpoint único que hace todo el proceso
      setSaveStep({ status: 'creating_branch', message: 'Creando rama y actualizando archivos...' });

      const updateRes = await fetch('/api/github/update-versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          baseBranch: selectedBranch,
          settingsVersion: editedSettingsVersion,
          appJsonVersion: editedAppJsonVersion,
        }),
      });

      if (!updateRes.ok) {
        const errorData = await updateRes.json();
        throw new Error(errorData.error || 'Error al actualizar versiones');
      }

      const result = await updateRes.json();
      setSaveStep({ status: 'completed', prUrl: result.pullRequestUrl });
      showSuccess('Pull Request creado exitosamente');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar cambios';
      setSaveStep({ status: 'error', message: errorMessage });
      showError(errorMessage);
    }
  };

  const handleClose = () => {
    if (isSaving) return; // No cerrar mientras se guarda
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Versión Repositorio CI/CD
          </h2>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <LoadingSpinner text="Cargando versiones..." />
          ) : error ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : versionData ? (
            <div className="space-y-6">
              
              {/* Info Banner */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">Sincronización de versiones</p>
                    <p>Las versiones en <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">settings.json</code> y <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">app.json</code> deben estar sincronizadas.</p>
                  </div>
                </div>
              </div>

              {/* Última Release */}
              {latestRelease && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Última Release
                    </label>
                    <button
                      onClick={applyRecommendedSettings}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Ajustes recomendados
                    </button>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 010 2.474l-5.026 5.026a1.75 1.75 0 01-2.474 0l-6.25-6.25A1.75 1.75 0 011 7.775zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 00.354 0l5.025-5.025a.25.25 0 000-.354l-6.25-6.25a.25.25 0 00-.177-.073H2.75a.25.25 0 00-.25.25v5.025zM6 5a1 1 0 110 2 1 1 0 010-2z" />
                    </svg>
                    {latestRelease}
                  </div>
                </div>
              )}

              {/* Settings Version */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  .AL-Go/settings.json (repoVersion)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={settingsParts.major}
                    onChange={(e) => setSettingsParts({ ...settingsParts, major: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="0"
                    disabled={isSaving}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-gray-500 dark:text-gray-400 text-xl">.</span>
                  <input
                    type="text"
                    value={settingsParts.minor}
                    onChange={(e) => setSettingsParts({ ...settingsParts, minor: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="0"
                    disabled={isSaving}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Formato: X.X (major.minor)
                </div>
              </div>

              {/* App.json Version */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  app.json (version)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={appJsonParts.major}
                    onChange={(e) => setAppJsonParts({ ...appJsonParts, major: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="0"
                    disabled={isSaving}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-gray-500 dark:text-gray-400 text-xl">.</span>
                  <input
                    type="text"
                    value={appJsonParts.minor}
                    onChange={(e) => setAppJsonParts({ ...appJsonParts, minor: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="0"
                    disabled={isSaving}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-gray-500 dark:text-gray-400 text-xl">.</span>
                  <input
                    type="text"
                    value={appJsonParts.build}
                    onChange={(e) => setAppJsonParts({ ...appJsonParts, build: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="0"
                    disabled={isSaving}
                    className={`w-20 px-3 py-2 border rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                      appJsonParts.build && appJsonParts.build !== '0'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-300'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  />
                  <span className="text-gray-500 dark:text-gray-400 text-xl">.</span>
                  <input
                    type="text"
                    value={appJsonParts.revision}
                    onChange={(e) => setAppJsonParts({ ...appJsonParts, revision: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="0"
                    disabled={isSaving}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                {appJsonParts.build && appJsonParts.build !== '0' && (
                  <div className="mt-2 flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>El tercer número está reservado para el número de compilación de GitHub y debe ser siempre 0</span>
                  </div>
                )}
              </div>

              {/* Save Progress */}
              {saveStep.status !== 'idle' && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  {saveStep.status === 'creating_branch' && (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{saveStep.message}</span>
                    </div>
                  )}

                  {saveStep.status === 'completed' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          Pull Request creado exitosamente
                        </span>
                      </div>
                      <a
                        href={saveStep.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md transition-colors"
                      >
                        Ver PR
                      </a>
                    </div>
                  )}

                  {saveStep.status === 'error' && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-red-600 dark:text-red-400">{saveStep.message}</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          {/* Branch Selector - izquierda */}
          <div className="flex items-center gap-2">
            {isLoadingBranches ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs">Cargando ramas...</span>
              </div>
            ) : (
              <>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rama base:
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  disabled={isSaving}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          {/* Botones - derecha */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveStep.status === 'completed' ? 'Cerrar' : 'Cancelar'}
            </button>
            {saveStep.status !== 'completed' && (
              <button
                onClick={handleSave}
                disabled={!hasChanges() || isSaving || isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Crear Pull Request'
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
