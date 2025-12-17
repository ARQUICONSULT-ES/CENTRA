export function CustomerCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden animate-pulse">
      <div className="p-4 flex items-start gap-3">
        {/* Imagen skeleton */}
        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700" />

        {/* Información skeleton */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Nombre skeleton */}
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          
          {/* Contadores skeleton */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="space-y-1 flex-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="space-y-1 flex-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Menú skeleton */}
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export function CustomerListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CustomerCardSkeleton key={i} />
      ))}
    </div>
  );
}
