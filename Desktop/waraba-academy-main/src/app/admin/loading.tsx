export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* En-tête skeleton */}
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64" />
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32" />
        </div>

        {/* Cartes statistiques skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden animate-pulse">
          {/* Table header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-36" />
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-28" />
          </div>
          {/* Lignes */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 dark:border-gray-700/50">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-1" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28" />
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
