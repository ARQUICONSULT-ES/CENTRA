"use client";

import { forwardRef, useImperativeHandle } from "react";
import { RepoCard } from "./RepoCard";
import type { RepoListProps, RepoListHandle } from "@/modules/repos/types";
import { useRepoExtraInfo } from "@/modules/repos/hooks/useRepoExtraInfo";

export const RepoList = forwardRef<RepoListHandle, RepoListProps>(({ repos, allRepos }, ref) => {
  const { extraInfo, isLoadingReleases, isLoadingWorkflows, loadWorkflows } = useRepoExtraInfo(repos);

  // Exponer la función y el estado al componente padre
  useImperativeHandle(ref, () => ({
    fetchWorkflows: loadWorkflows,
    isLoadingWorkflows,
  }));

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {repos.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            preloadedInfo={extraInfo[repo.full_name]}
            skipIndividualFetch={true}
            isLoadingRelease={isLoadingReleases}
            allRepos={allRepos}
          />
        ))}
      </div>
    </div>
  );
});

RepoList.displayName = "RepoList";
