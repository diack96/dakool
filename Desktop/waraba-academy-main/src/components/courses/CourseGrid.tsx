
import { BookOpen } from 'lucide-react';
import { Course } from '@/types/course';
import CourseCard from './CourseCard';

interface CourseGridProps {
  courses: Course[];
  isLoading: boolean;
  onClearFilters: () => void;
}

export default function CourseGrid ({ courses, isLoading, onClearFilters }: CourseGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun cours trouvé
        </h3>
        <p className="text-gray-600 mb-6">
          Essayez de modifier vos critères de recherche ou de réinitialiser les filtres
        </p>
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Réinitialiser les filtres
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course, index) => (
        <CourseCard key={course.id} course={course} priority={index < 3} />
      ))}
    </div>
  );
}
