export default function DashboardCoursesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* En-tête skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-56 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" />
        </div>

        {/* Onglets skeleton */}
        <div className="flex gap-2 mb-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 bg-gray-200 dark:bg-gray-700 rounded-full w-28" />
          ))}
        </div>

        {/* Grille de cours skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm animate-pulse">
              <div className="h-44 bg-gray-200 dark:bg-gray-700 w-full" />
              <div className="p-5">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-4" />
                {/* Barre de progression */}
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full mb-2" />
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
