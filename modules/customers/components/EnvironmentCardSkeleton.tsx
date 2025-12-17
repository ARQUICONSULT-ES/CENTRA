export function EnvironmentCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
      <div className="space-y-3">
        {/* Header con imagen y nombre skeleton */}
        <div className="flex items-center gap-2">
          {/* Imagen skeleton */}
          <div className="flex-shrink-0 w-10 h-10 rounded-md bg-gray-200 dark:bg-gray-700" />

          {/* Nombre skeleton */}
          <div className="flex-1 min-w-0 pr-20 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>

        {/* Status y Apps Count skeleton */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="space-y-1 flex-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="space-y-1 flex-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6" />
            </div>
          </div>
        </div>

        {/* Versiones skeleton */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-1.5">
            <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-700 rounded mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-700 rounded mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EnvironmentListSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <EnvironmentCardSkeleton key={i} />
      ))}
    </div>
  );
}
