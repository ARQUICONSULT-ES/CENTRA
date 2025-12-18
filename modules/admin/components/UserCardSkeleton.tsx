"use client";

export default function UserCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Avatar skeleton */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}
