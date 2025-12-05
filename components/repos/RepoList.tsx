"use client";

import { useEffect, useState } from "react";
import { GitHubRepository } from "@/types/github";
import { RepoCard, RepoExtraInfo } from "./RepoCard";

interface RepoListProps {
  repos: GitHubRepository[];
}

export function RepoList({ repos }: RepoListProps) {
  const [extraInfo, setExtraInfo] = useState<Record<string, RepoExtraInfo>>({});
  const [isLoadingBatch, setIsLoadingBatch] = useState(true);

  useEffect(() => {
    if (repos.length === 0) {
      setIsLoadingBatch(false);
      return;
    }

    const fetchBatchInfo = async () => {
      try {
        // Preparar lista de repos para el batch
        const repoRequests = repos.map((repo) => {
          const [owner, repoName] = repo.full_name.split("/");
          return { owner, repo: repoName };
        });

        // Dividir en chunks de 100 repos (límite del endpoint)
        const chunks: typeof repoRequests[] = [];
        for (let i = 0; i < repoRequests.length; i += 100) {
          chunks.push(repoRequests.slice(i, i + 100));
        }

        // Procesar cada chunk
        const allResults: Record<string, RepoExtraInfo> = {};

        for (const chunk of chunks) {
          const res = await fetch("/api/github/batch-info", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ repos: chunk }),
          });

          if (res.ok) {
            const data = await res.json();
            Object.assign(allResults, data.data);
          }
        }

        setExtraInfo(allResults);
      } catch (error) {
        console.error("Error fetching batch info:", error);
      } finally {
        setIsLoadingBatch(false);
      }
    };

    fetchBatchInfo();
  }, [repos]);

  if (repos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No se encontraron repositorios
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Parece que no tienes repositorios aún.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Indicador de carga del batch */}
      {isLoadingBatch && (
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Cargando información de workflows y releases...
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {repos.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            preloadedInfo={extraInfo[repo.full_name]}
            skipIndividualFetch={true}
          />
        ))}
      </div>
    </div>
  );
}
