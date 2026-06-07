export default function CourseDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Hero banner skeleton */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <div className="flex gap-2 mb-4">
                <div className="h-4 bg-gray-600 rounded w-16" />
                <div className="h-4 bg-gray-600 rounded w-4" />
                <div className="h-4 bg-gray-600 rounded w-32" />
              </div>
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-600 rounded-full w-20" />
                <div className="h-6 bg-gray-600 rounded-full w-16" />
              </div>
              {/* Titre */}
              <div className="h-9 bg-gray-600 rounded-lg w-full mb-2" />
              <div className="h-9 bg-gray-600 rounded-lg w-3/4 mb-4" />
              {/* Description */}
              <div className="h-4 bg-gray-600 rounded w-full mb-2" />
              <div className="h-4 bg-gray-600 rounded w-5/6 mb-2" />
              <div className="h-4 bg-gray-600 rounded w-4/5 mb-6" />
              {/* Stats */}
              <div className="flex gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-5 bg-gray-600 rounded w-20" />
                ))}
              </div>
            </div>
            {/* Card latérale */}
            <div className="bg-gray-700 rounded-2xl overflow-hidden">
              <div className="h-48 bg-gray-600 w-full" />
              <div className="p-5">
                <div className="h-8 bg-gray-600 rounded w-24 mb-4" />
                <div className="h-12 bg-gray-600 rounded-xl w-full mb-3" />
                <div className="h-4 bg-gray-600 rounded w-full mb-2" />
                <div className="h-4 bg-gray-600 rounded w-4/5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
          <div className="lg:col-span-2 space-y-6">
            {/* Section objectifs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                ))}
              </div>
            </div>
            {/* Section modules */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-xl mb-3" />
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
