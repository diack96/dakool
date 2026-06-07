export default function DashboardProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* En-tête skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-40 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64" />
        </div>

        {/* Avatar + info skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6 animate-pulse">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36" />
            </div>
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-28" />
          </div>

          {/* Champs du formulaire */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Section mot de passe skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
