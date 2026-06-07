import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  Star,
  BookOpen,
  TrendingUp,
  Calendar,
  Code,
  Palette,
  Heart,
  Cpu,
} from 'lucide-react';
import { Course } from '@/types/course';
import Image from 'next/image';

interface CourseManagementProps {
  courses: Course[];
  onEditCourse: (_course: Course) => void;
  onDeleteCourse: (_courseId: string) => Promise<void>;
  onViewCourse: (_course: Course) => void;
}

export default function CourseManagement ({
  courses,
  onEditCourse,
  onDeleteCourse,
  onViewCourse,
}: CourseManagementProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'enrollments' | 'rating'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = [
    'Développement Web',
    'Design',
    'Marketing',
    'Business',
    'Lifestyle',
    'Technologie',
  ];

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'draft', label: 'Brouillon' },
    { value: 'archived', label: 'Archivé' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Nom' },
    { value: 'date', label: 'Date' },
    { value: 'enrollments', label: 'Inscriptions' },
    { value: 'rating', label: 'Note' },
  ];

  const filteredAndSortedCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || course.category.name === selectedCategory;
      // Mapper selectedStatus vers CourseStatus
      const statusMap: Record<'all' | 'active' | 'draft' | 'archived', 'all' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'> = {
        'all': 'all',
        'active': 'PUBLISHED',
        'draft': 'DRAFT',
        'archived': 'ARCHIVED'
      };
      const mappedStatus = statusMap[selectedStatus];
      const matchesStatus = selectedStatus === 'all' || (mappedStatus !== 'all' && course.status === mappedStatus);

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
      case 'name':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'enrollments':
        comparison = ((a as any).enrollmentCount || 0) - ((b as any).enrollmentCount || 0);
        break;
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSelectAll = () => {
    if (selectedCourses.size === filteredAndSortedCourses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(filteredAndSortedCourses.map(course => course.id)));
    }
  };

  const handleSelectCourse = (courseId: string) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedCourses.size === 0) return;

    // Vérification directe sans confirmation
    setIsDeleting(true);

    try {
      await Promise.all(
        Array.from(selectedCourses).map(courseId => onDeleteCourse(courseId)),
      );
      setSelectedCourses(new Set());
    } catch {
      // Gestion silencieuse des erreurs
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Actif' },
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Brouillon' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Archivé' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'Développement Web': Code,
      'Design': Palette,
      'Marketing': TrendingUp,
      'Business': Users,
      'Lifestyle': Heart,
      'Technologie': Cpu,
    };

    const IconComponent = iconMap[categoryName] || BookOpen;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des cours</h2>
          <p className="text-gray-600 mt-1">
            Gérez vos cours, suivez les performances et optimisez l&apos;expérience d&apos;apprentissage
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {selectedCourses.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>
                {isDeleting ? 'Suppression...' : `Supprimer (${selectedCourses.size})`}
              </span>
            </button>
          )}

          <button
            onClick={() => router.push('/admin/courses/new')}
            className="group inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold text-base shadow-xl hover:bg-gray-50 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <Plus className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
            Nouveau cours
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Recherche */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un cours..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'draft' | 'archived')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Tri */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trier par
            </label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'enrollments' | 'rating')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des cours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCourses.size === filteredAndSortedCourses.length && filteredAndSortedCourses.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscriptions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedCourses.has(course.id)}
                      onChange={() => handleSelectCourse(course.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <Image
                          className="h-12 w-12 rounded-lg object-cover"
                          src={course.thumbnail || course.image || '/images/course-placeholder.jpg'}
                          alt={course.title}
                          width={48}
                          height={48}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                          {course.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {course.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(course.category.name)}
                      <span className="text-sm text-gray-900">{course.category.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(course.status || 'draft')}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {(course as any).enrollmentCount || 0}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-900">
                        {course.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onViewCourse(course)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Voir le cours"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditCourse(course)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Modifier le cours"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Supprimer le cours"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun cours trouvé
            </h3>
            <p className="text-gray-500 mb-4">
              Essayez de modifier vos critères de recherche ou créez un nouveau cours
            </p>
            <button
              onClick={() => router.push('/admin/courses/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer un cours
            </button>
          </div>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total des cours</p>
              <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total des inscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {courses.reduce((total, course) => total + ((course as any).enrollmentCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Note moyenne</p>
              <p className="text-2xl font-semibold text-gray-900">
                {courses.length > 0
                  ? (courses.reduce((total, course) => total + course.rating, 0) / courses.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cours actifs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {courses.filter(course => course.status === 'PUBLISHED').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
