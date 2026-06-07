'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowRight,
  ArrowLeft,
  Star,
  Users,
  BookOpen,
  Trophy,
  Mail,
} from 'lucide-react';

interface Enrollment {
  id: string;
  course: {
    id: string;
    title: string;
    slug?: string;
    category: string;
    instructor: string;
    certificate: boolean;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

function CourseSuccessContent({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const completedParam = searchParams.get('completed') === 'true';
  // certificateId can be passed directly from the quiz result (avoids an extra API call)
  const certIdFromUrl = searchParams.get('certificateId');
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [certificateId, setCertificateId] = useState<string | null>(certIdFromUrl);
  const [loading, setLoading] = useState(true);

  // Redirect immediately if ?completed=true is not present
  useEffect(() => {
    if (!completedParam) {
      router.replace(`/courses/${params.id}/learn`);
    }
  }, [completedParam, params.id, router]);

  useEffect(() => {
    if (!completedParam) return;

    const fetchEnrollmentData = async () => {
      try {
        setLoading(true);

        // Fetch enrollments to find one for this course with status=completed
        const enrollmentResponse = await fetch('/api/enrollments', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!enrollmentResponse.ok) {
          throw new Error('Erreur lors de la récupération des inscriptions');
        }

        const enrollmentData = await enrollmentResponse.json();

        if (!enrollmentData.success || !Array.isArray(enrollmentData.enrollments)) {
          throw new Error('Format de réponse invalide');
        }

        interface EnrollmentItem {
          id: string;
          course_id?: string;
          courses?: { id?: string; slug?: string };
          status?: string;
          user?: {
            first_name?: string;
            firstName?: string;
            last_name?: string;
            lastName?: string;
            email?: string;
          };
        }

        // ?completed=true is the primary guard (set only by quiz page on success).
        // Just check enrollment exists for this course — don't require status=completed
        // to avoid race conditions where the DB update hasn't propagated yet.
        const foundEnrollment = enrollmentData.enrollments.find(
          (e: EnrollmentItem) =>
            e.course_id === params.id ||
            (e.courses as any)?.id === params.id ||
            (e.courses as any)?.slug === params.id,
        );

        if (!foundEnrollment) {
          // No enrollment at all — redirect to dashboard
          router.replace('/dashboard');
          return;
        }

        // Fetch full course details (may fail if the course was deleted)
        let course: any = null;
        try {
          const courseResponse = await fetch(`/api/courses/${params.id}`, {
            credentials: 'include',
            cache: 'no-store',
          });
          if (courseResponse.ok) {
            const courseData = await courseResponse.json();
            if (courseData.success) {
              course = courseData.data?.course || courseData.course || null;
            }
          }
        } catch {
          // Course may have been deleted — fall through to enrollment fallback
        }

        // Fallback: use data already present in the enrollment join
        if (!course) {
          const ec = (foundEnrollment as any).courses;
          course = {
            id: ec?.id || params.id,
            title: ec?.title || 'Cours terminé',
            slug: ec?.slug || null,
            category: null,
            instructor: null,
            certificate: false,
          };
        }

        // Fetch certificate only if course is certifying and not already provided via URL param
        if (course.certificate && !certIdFromUrl) {
          try {
            const certResponse = await fetch('/api/certificates', {
              credentials: 'include',
              cache: 'no-store',
            });
            if (certResponse.ok) {
              const certData = await certResponse.json();
              // API wraps data in a `data` key via successResponse(); field is courseId (camelCase)
              const certList = certData.data?.certificates || certData.certificates;
              if (certData.success && Array.isArray(certList)) {
                const cert = certList.find(
                  (c: any) => (c.courseId || c.course_id) === course.id,
                );
                if (cert) setCertificateId(cert.id);
              }
            }
          } catch {
            // Certificate may not be available immediately
          }
        }

        // Resolve user name from auth context (most reliable source)
        const userMeta = user?.user_metadata ?? {};
        const firstName = userMeta.first_name || userMeta.firstName
          || (userMeta.full_name ? userMeta.full_name.split(' ')[0] : null)
          || foundEnrollment.user?.first_name || foundEnrollment.user?.firstName || 'Utilisateur';
        const lastName = userMeta.last_name || userMeta.lastName
          || (userMeta.full_name ? userMeta.full_name.split(' ').slice(1).join(' ') : null)
          || foundEnrollment.user?.last_name || foundEnrollment.user?.lastName || '';

        setEnrollment({
          id: foundEnrollment.id,
          course: {
            id: course.id,
            title: course.title,
            slug: course.slug,
            category: course.category?.name || course.categories?.name || 'Non catégorisé',
            instructor: course.instructor?.firstName && course.instructor?.lastName
              ? `${course.instructor.firstName} ${course.instructor.lastName}`
              : course.instructor_name || 'Expert',
            certificate: course.certificate === true,
          },
          user: {
            firstName,
            lastName,
            email: user?.email || foundEnrollment.user?.email || '',
          },
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur lors de la récupération des données:', error);
        }
        // Enrollment or auth error — redirect to dashboard rather than a
        // potentially deleted course page
        router.replace('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollmentData();
  }, [params.id, completedParam, router]);

  if (!completedParam || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!enrollment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 relative overflow-hidden pt-24">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <Trophy className="w-12 h-12 text-yellow-600" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bravo, cours terminé ! 🎉
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vous avez terminé le cours <span className="font-semibold text-blue-600">&quot;{enrollment.course.title}&quot;</span> avec succès !
          </p>
        </div>

        {/* Course Details Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 animate-fade-in-up stagger-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Résumé du cours</h2>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">
                <span className="font-medium">Cours :</span> {enrollment.course.title}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-orange-600" />
              <span className="text-gray-700">
                <span className="font-medium">Catégorie :</span> {enrollment.course.category}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-700">
                <span className="font-medium">Instructeur :</span> {enrollment.course.instructor}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">
                <span className="font-medium">Email :</span> {enrollment.user.email}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up stagger-2">
          {enrollment.course.certificate && (
            certificateId ? (
              <Link
                href={`/certificates/${certificateId}`}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-center py-4 px-6 rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-3"
              >
                <Trophy className="w-6 h-6" />
                <span>Voir mon certificat</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/dashboard/certificates"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-center py-4 px-6 rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-3"
              >
                <Trophy className="w-6 h-6" />
                <span>Mes certificats</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )
          )}
          <Link
            href="/dashboard"
            className="bg-white/80 backdrop-blur-xl text-gray-900 text-center py-4 px-6 rounded-2xl hover:bg-white transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-3 border border-gray-200"
          >
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>Tableau de bord</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Support */}
        <div className="bg-gradient-to-br from-blue-600 to-orange-600 rounded-3xl p-8 text-white text-center animate-fade-in-up stagger-3">
          <h2 className="text-2xl font-bold mb-4">Besoin d&apos;aide ?</h2>
          <p className="text-blue-100 mb-6">
            Notre équipe est là pour vous accompagner dans votre parcours d&apos;apprentissage
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              href="/contact"
              className="bg-white/20 backdrop-blur-xl text-white px-6 py-3 rounded-2xl hover:bg-white/30 transition-all duration-300 font-medium"
            >
              Contacter le support
            </Link>

            <Link
              href="/faq"
              className="bg-white/20 backdrop-blur-xl text-white px-6 py-3 rounded-2xl hover:bg-white/30 transition-all duration-300 font-medium"
            >
              Consulter la FAQ
            </Link>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 animate-fade-in-up stagger-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tableau de bord</span>
          </Link>
          <span className="hidden sm:block text-gray-300">|</span>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Retour à l&apos;accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CourseSuccessPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <CourseSuccessContent params={params} />
    </Suspense>
  );
}
