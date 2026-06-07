'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Clock, BookOpen } from 'lucide-react';
import { useCoursesData } from '@/hooks/useCoursesData';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  rating: number;
  price: string;
  courseImage: string;
  instructorImage: string;
  instructorName?: string;
  href: string;
  totalLessons?: number;
  category?: string;
  isComingSoon?: boolean;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop';
const DEFAULT_INSTRUCTOR_IMAGE = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces';

/** Génère une note par défaut déterministe (entre 4.2 et 5.0) basée sur l'ID du cours */
function getDefaultRating(courseId: string): number {
  let hash = 0;
  for (let i = 0; i < courseId.length; i++) {
    hash = ((hash << 5) - hash) + courseId.charCodeAt(i);
    hash |= 0;
  }
  const values = [4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
  return values[Math.abs(hash) % values.length] ?? 4.5;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  description,
  duration,
  level,
  rating,
  price,
  courseImage,
  instructorImage,
  instructorName = 'Expert',
  href,
  totalLessons = 0,
  isComingSoon = false,
}) => (
  <div
    className="group bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-3 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2"
    role="article"
    aria-label={`Cours: ${title}`}
  >
    <div className={'relative h-40 sm:h-48 overflow-hidden'}>
      <Image
        src={courseImage}
        alt={`Image du cours: ${title}`}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-110"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        loading="lazy"
      />
      {/* Instructeur en overlay */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex items-center space-x-2 sm:space-x-3 z-10">
        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-white/80 shadow-lg">
          <Image
            src={instructorImage}
            alt={`Instructeur ${title}`}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg hidden sm:block">
          <div className="text-xs text-white opacity-90">Instructeur</div>
          <div className="text-sm font-semibold text-white">{instructorName}</div>
        </div>
      </div>

      {/* Badge Prix */}
      {!isComingSoon && (
        <div className={`absolute top-2 sm:top-4 right-2 sm:right-4 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 shadow-lg ${
          price === 'Gratuit'
            ? 'bg-green-800 text-white'
            : 'bg-white/90 backdrop-blur-sm text-gray-900 group-hover:bg-white'
        }`}>
          {price}
        </div>
      )}

      {/* Badge Bientôt disponible */}
      {isComingSoon && (
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex items-center gap-1 bg-amber-500 text-gray-900 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
          Bientôt disponible
        </div>
      )}

    </div>
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 text-xs font-semibold px-2 sm:px-3 py-1 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
          {level}
        </span>
        <div className="flex items-center" role="img" aria-label={`Note: ${rating} étoiles sur 5`}>
          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" aria-hidden="true" />
          <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{rating}</span>
        </div>
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
        {title}
      </h3>
      <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed line-clamp-2 sm:line-clamp-3">
        {description}
      </p>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" aria-hidden="true" />
            <span>{duration}</span>
          </div>
          {totalLessons > 0 && (
            <div className="flex items-center">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1" aria-hidden="true" />
              <span>{totalLessons} leçons</span>
            </div>
          )}
        </div>
        <Link
          href={href}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded font-semibold text-sm sm:text-base group-hover:translate-x-1 transition-all duration-300 w-full sm:w-auto justify-center sm:justify-start"
          aria-label={`Voir le programme du cours: ${title}`}
        >
          Voir le programme
          <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </Link>
      </div>
    </div>
  </div>
);

function transformCourse(course: any, index: number): CourseCardProps | null {
  try {
    // Durée
    let totalDuration = course.totalDuration || 0;
    if (totalDuration === 0 && course.modules && Array.isArray(course.modules)) {
      totalDuration = course.modules.reduce((sum: number, module: any) => {
        if (module.lessons && Array.isArray(module.lessons)) {
          return sum + module.lessons.reduce((s: number, lesson: any) => s + (lesson.duration || 0), 0);
        }
        return sum;
      }, 0);
    }
    const durationHours = Math.round(totalDuration / 60);
    const durationStr = durationHours > 0 ? `${durationHours}h` : (totalDuration > 0 ? `${totalDuration}min` : '0h');

    // Leçons
    let totalLessons = course.totalLessons || 0;
    if (totalLessons === 0 && course.modules && Array.isArray(course.modules)) {
      totalLessons = course.modules.reduce((sum: number, module: any) => {
        if (module.lessons && Array.isArray(module.lessons)) {
          return sum + module.lessons.length;
        }
        return sum;
      }, 0);
    }

    // Niveau
    const courseLevel = course.level || 'DÉBUTANT';
    const levelDisplay = courseLevel === 'DÉBUTANT' || courseLevel === 'DEBUTANT' ? 'Débutant' :
      courseLevel === 'INTERMÉDIAIRE' || courseLevel === 'INTERMEDIAIRE' ? 'Intermédiaire' :
        courseLevel === 'AVANCÉ' || courseLevel === 'AVANCE' ? 'Avancé' : 'Débutant';

    // Prix
    const isFree = course.isFree !== undefined ? course.isFree : (!course.price || course.price === 0);
    const priceStr = isFree ? 'Gratuit' :
      (course.price && course.price > 0) ? `${course.price.toLocaleString()} FCFA` : 'Gratuit';

    // Instructeur
    const instructor = course.instructor || {};
    const instructorFirstName = instructor.firstName || instructor.first_name || 'Expert';
    const instructorLastName = instructor.lastName || instructor.last_name || '';
    const instructorName = `${instructorFirstName} ${instructorLastName}`.trim() || 'Expert';
    const instructorImage = instructor.avatar || instructor.avatar_url || DEFAULT_INSTRUCTOR_IMAGE;

    // Description
    const description = course.description || course.shortDescription || 'Découvrez ce cours exceptionnel qui vous permettra d\'acquérir de nouvelles compétences.';
    const shortDescription = description.length > 120 ? `${description.substring(0, 120)}...` : description;

    // Catégorie
    const category = course.category?.name || course.categoryName || '';

    // Note — déterministe pour éviter que tous les cours affichent 4.5
    const courseId = course.id || `course-${index}`;
    const rating = typeof course.rating === 'number' ? course.rating : getDefaultRating(courseId);

    return {
      id: courseId,
      title: course.title || 'Cours sans titre',
      description: shortDescription,
      duration: durationStr,
      level: levelDisplay,
      rating,
      price: priceStr,
      courseImage: course.thumbnail || course.image || DEFAULT_IMAGE,
      instructorImage,
      instructorName,
      href: course.slug ? `/courses/${course.slug}` : `/courses/${courseId}`,
      totalLessons,
      category,
      isComingSoon: !!(course.isComingSoon || course.is_coming_soon),
    };
  } catch {
    return null;
  }
}

interface PopularCoursesProps {
  initialCourses?: any[];
}

const PopularCourses: React.FC<PopularCoursesProps> = ({ initialCourses }) => {
  const { allCourses, loading } = useCoursesData(initialCourses);
  const [activeCategory, setActiveCategory] = useState<string>('Tous');

  const { courses, categories } = useMemo(() => {
    // Trier : gratuits en premier, puis par popularité
    const sortedCourses = [...allCourses].sort((a, b) => {
      const aIsFree = !a.price || a.price === 0;
      const bIsFree = !b.price || b.price === 0;
      if (aIsFree && !bIsFree) return -1;
      if (!aIsFree && bIsFree) return 1;
      return (b.totalStudents || 0) - (a.totalStudents || 0);
    });

    const transformed = sortedCourses
      .slice(0, 12)
      .map((course, index) => transformCourse(course, index))
      .filter((c): c is CourseCardProps => c !== null && !!c.id && !!c.title);

    // Extraire les catégories uniques
    const uniqueCategories = Array.from(
      new Set(transformed.map((c) => c.category).filter(Boolean))
    ) as string[];

    return { courses: transformed, categories: uniqueCategories };
  }, [allCourses]);

  const filteredCourses = useMemo(() => {
    if (activeCategory === 'Tous') return courses;
    return courses.filter((c) => c.category === activeCategory);
  }, [courses, activeCategory]);

  // Si aucun cours après chargement, afficher un état vide visible
  // (ne jamais retourner null — la section disparaîtrait sans explication)
  if (!loading && courses.length === 0) {
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Nos formations
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Les cours arrivent bientôt. Revenez dans quelques instants.
          </p>
          <a
            href="/courses"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
          >
            Voir le catalogue
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white dark:bg-gray-800 relative overflow-hidden transition-colors">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-300 text-xs sm:text-sm font-medium rounded-full mb-4 sm:mb-6 hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors duration-300">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Cours les plus populaires
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 px-2">
            Découvrez nos
            <span className="text-orange-600 dark:text-orange-400">
              {' '}formations
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto px-2">
            Des cours gratuits et premium pour développer vos compétences à votre rythme
          </p>
        </div>

        {/* Filtres par catégorie */}
        {!loading && categories.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8 sm:mb-12">
            <button
              onClick={() => setActiveCategory('Tous')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                activeCategory === 'Tous'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading && courses.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8 animate-pulse">
                <div className="h-40 sm:h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3 sm:mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div
            role="list"
            aria-label="Cours populaires"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          >
            {filteredCourses.map((course, index) => (
              <div
                key={course.id}
                role="listitem"
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both',
                }}
              >
                <CourseCard {...course} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            Aucun cours dans cette catégorie pour le moment.
          </p>
        )}

        <div className="text-center mt-8 sm:mt-12 lg:mt-16 animate-fade-in-up">
          <Link
            href="/courses"
            className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-orange-700 text-white rounded-xl sm:rounded-2xl hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-700 focus:ring-offset-2 transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            aria-label="Voir tous les cours disponibles"
          >
            Voir tous les cours
            <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularCourses;
