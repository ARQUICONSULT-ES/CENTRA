"use client";

export default function ApplicationCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1.5"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* GitHub Repo */}
      <div className="flex items-center gap-1 mb-1.5">
        <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>

      {/* Latest Release */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>

      {/* Badges (clientes, instalaciones, obsoletas) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-22"></div>
      </div>
    </div>
  );
}
