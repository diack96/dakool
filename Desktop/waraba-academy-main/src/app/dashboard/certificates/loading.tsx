export default function DashboardCertificatesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* En-tête skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-72" />
        </div>

        {/* Grille de certificats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm animate-pulse">
              {/* Aperçu certificat */}
              <div className="h-52 bg-gray-200 dark:bg-gray-700 w-full" />
              <div className="p-5">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
                <div className="flex gap-3">
                  <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1" />
                  <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
