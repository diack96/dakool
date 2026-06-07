export default function CoursesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* En-tête skeleton */}
        <div className="text-center mb-10 animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mx-auto mb-3" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto" />
        </div>

        {/* Filtres skeleton */}
        <div className="flex flex-wrap gap-3 mb-8 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 bg-gray-200 dark:bg-gray-700 rounded-full w-24" />
          ))}
        </div>

        {/* Grille de cours skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm animate-pulse">
              {/* Image */}
              <div className="h-48 bg-gray-200 dark:bg-gray-700 w-full" />
              {/* Contenu */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                </div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                  <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
