"use client";

import type { Application } from "@/modules/applications/types";

interface ApplicationCardProps {
  application: Application;
  onClick: (application: Application) => void;
}

export default function ApplicationCard({ application, onClick }: ApplicationCardProps) {
  return (
    <div
      onClick={() => onClick(application)}
      className="group relative cursor-pointer rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {application.name}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {application.publisher}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
            {application.logoBase64 ? (
              <img 
                src={application.logoBase64} 
                alt={`${application.name} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            )}
          </div>
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      {/* GitHub Repo */}
      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1.5 min-w-0">
        <svg
          className="w-3 h-3 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
        {application.githubUrl ? (
          <a
            href={application.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="truncate font-mono text-xs hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
          >
            {application.githubRepoName}
          </a>
        ) : (
          <span className="truncate font-mono text-xs">
            {application.githubRepoName}
          </span>
        )}
      </div>

      {/* Latest Release */}
      {application.latestReleaseVersion && (
        <div className="flex items-center gap-1.5 text-sm mb-1.5">
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {application.latestReleaseVersion}
          </span>
          {application.latestReleaseDate && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(application.latestReleaseDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          )}
        </div>
      )}

      {/* Instalaciones, clientes y obsoletas */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {typeof application.totalCustomers === 'number' && application.totalCustomers > 0 && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {application.totalCustomers} {application.totalCustomers === 1 ? 'cliente' : 'clientes'}
          </span>
        )}
        {typeof application.totalInstallations === 'number' && application.totalInstallations > 0 && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            {application.totalInstallations} {application.totalInstallations === 1 ? 'instalación' : 'instalaciones'}
          </span>
        )}
        {typeof application.outdatedInstallations === 'number' && application.outdatedInstallations > 0 && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium" title={`${application.outdatedInstallations} instalaciones con versión diferente a ${application.latestReleaseVersion}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {application.outdatedInstallations} obsoletas
          </span>
        )}
      </div>
    </div>
  );
}
