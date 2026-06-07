export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* En-tête skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        </div>

        {/* Cartes de stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
            </div>
          ))}
        </div>

        {/* Section cours en cours skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
