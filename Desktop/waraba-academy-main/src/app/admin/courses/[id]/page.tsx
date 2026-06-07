import AdminGuard from '@/components/admin/AdminGuard';
import Link from 'next/link';
import { BookOpen, Users, Clock, Star, ArrowLeft, Edit3, Target, FileText, Award, Layers, Eye, FolderOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { AdminCourse } from '@/types';

async function fetchCourse (id: string): Promise<AdminCourse | null> {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const baseUrl = isDevelopment
      ? (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
      : (process.env.NEXT_PUBLIC_APP_URL || '');

    const apiUrl = baseUrl ? `${baseUrl}/api/admin/courses/${id}` : `/api/admin/courses/${id}`;

    const res = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    if (!data.success || !data.course) {
      return null;
    }

    return { ...data.course } as AdminCourse;
  } catch {
    return null;
  }
}

export default async function AdminCourseViewPage ({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await fetchCourse(id);

  if (!course) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Cours introuvable</h1>
            <p className="text-gray-600 mb-4">
              Le cours avec l&apos;ID &quot;{id}&quot; n&apos;a pas pu être chargé.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Vérifiez que le cours existe dans la base de données et que vous avez les permissions nécessaires.
            </p>
            <Link
              href="/admin/courses"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la liste des cours
            </Link>
          </div>
        </div>
      </AdminGuard>
    );
  }

  const syllabus = course.syllabus ? JSON.parse(course.syllabus) : [];

  const statusBadge = course.status === 'published'
    ? 'bg-green-100 text-green-800'
    : course.status === 'draft'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-gray-100 text-gray-800';

  const levelBadge = course.level === 'beginner'
    ? 'bg-green-100 text-green-800'
    : course.level === 'intermediate'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800';

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link href="/admin/courses" className="p-2 text-gray-400 hover:text-gray-600">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                  <p className="text-gray-600">Aperçu du cours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/courses/${course.id}/preview`}
                  className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Prévisualiser
                </Link>
                <Link
                  href={`/admin/courses/${course.id}/resources`}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Ressources
                </Link>
                <Link
                  href={`/admin/courses/${course.id}/lessons`}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Leçons
                </Link>
                <Link
                  href={`/admin/courses/${course.id}/edit`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modifier
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge}`}>
                    {course.status === 'published' ? 'Publié' : course.status === 'draft' ? 'Brouillon' : 'Archivé'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelBadge}`}>
                    {course.level === 'beginner' ? 'Débutant' : course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                  </span>
                  {course.category && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {course.category.name}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">{course.duration}</div>
              </div>

              <p className="text-gray-700 mb-6">{course.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <Users className="w-4 h-4 mr-2" /> {course.enrollmentCount} inscrits
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" /> {course.rating} ({course.reviewCount} avis)
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="w-4 h-4 mr-2" /> {course.duration}
                </div>
              </div>
            </Card>

            {syllabus.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" /> Programme (Syllabus)
                </h2>
                <div className="space-y-3">
                  {syllabus.map((m: any, i: number) => (
                    <div key={i} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">Module {i + 1}: {m.title}</div>
                        <div className="text-sm text-gray-500">{m.duration} • {m.lessons} leçons</div>
                      </div>
                      {m.description && (
                        <p className="text-sm text-gray-600 mt-1">{m.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {course.objectives?.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" /> Objectifs
                  </h3>
                  <ul className="space-y-2">
                    {course.objectives.map((o, idx) => (
                      <li key={idx} className="text-sm text-gray-700">• {o}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {course.materials?.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-blue-600" /> Matériaux
                  </h3>
                  <ul className="space-y-2">
                    {course.materials.map((m, idx) => (
                      <li key={idx} className="text-sm text-gray-700">• {m}</li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarification</h3>
              <div className="text-3xl font-bold text-gray-900">{course.price.toLocaleString()} FCFA</div>
              {course.originalPrice && course.originalPrice > course.price && (
                <div className="text-sm text-gray-500 line-through">{course.originalPrice.toLocaleString()} FCFA</div>
              )}
            </Card>

            {course.instructor && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructeur</h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{course.instructor.firstName} {course.instructor.lastName}</div>
                    <div className="text-sm text-gray-600">{course.instructor.email}</div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
