import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { errorResponse, CACHE_HEADERS } from '@/lib/api/apiUtils';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: string;
}

export interface OnboardingStatus {
  steps: OnboardingStep[];
  completedCount: number;
  totalSteps: number;
  allCompleted: boolean;
  percentComplete: number;
}

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  onboarding_completed: boolean | null;
}

// GET - Retourne le statut des 4 étapes d'onboarding
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) {
      return errorResponse('Non authentifié', { status: 401, code: 'UNAUTHORIZED' });
    }

    // Récupérer le profil utilisateur
    const { data: profileData } = await supabase
      .from('profiles')
      .select('first_name, last_name, onboarding_completed')
      .eq('id', user.id)
      .single();

    const profile = profileData as ProfileData | null;

    // Vérifier si le profil est complété (first_name + last_name renseignés)
    const profileCompleted = !!(
      profile?.first_name &&
      profile.first_name.trim() !== '' &&
      profile?.last_name &&
      profile.last_name.trim() !== ''
    );

    // Vérifier si l'utilisateur est inscrit à au moins un cours
    const { count: enrollmentCount } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['active', 'completed']);

    const hasEnrollment = (enrollmentCount ?? 0) > 0;

    // Vérifier si l'utilisateur a complété au moins une leçon
    const { count: progressCount } = await supabase
      .from('user_progress')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_completed', true);

    const hasCompletedLesson = (progressCount ?? 0) > 0;

    // Vérifier si l'utilisateur a obtenu au moins un certificat
    // Les certificats sont générés quand un cours est complété à 100%
    const { count: completedCoursesCount } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed');

    const hasCertificate = (completedCoursesCount ?? 0) > 0;

    // Construire les étapes
    const steps: OnboardingStep[] = [
      {
        id: 'profile',
        title: 'Profil complété',
        description: 'Renseignez votre nom et prénom',
        completed: profileCompleted,
        icon: 'UserCheck',
      },
      {
        id: 'enrollment',
        title: 'Premier cours inscrit',
        description: 'Inscrivez-vous à votre premier cours',
        completed: hasEnrollment,
        icon: 'BookOpen',
      },
      {
        id: 'lesson',
        title: 'Première leçon terminée',
        description: 'Complétez votre première leçon',
        completed: hasCompletedLesson,
        icon: 'PlayCircle',
      },
      {
        id: 'certificate',
        title: 'Premier certificat',
        description: 'Obtenez votre premier certificat',
        completed: hasCertificate,
        icon: 'Award',
      },
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const totalSteps = steps.length;
    const allCompleted = completedCount === totalSteps;
    const percentComplete = Math.round((completedCount / totalSteps) * 100);

    // Mettre à jour le statut onboarding_completed si tout est fait
    if (allCompleted && profile && !profile.onboarding_completed) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true } as never)
        .eq('id', user.id);
    }

    const status: OnboardingStatus = {
      steps,
      completedCount,
      totalSteps,
      allCompleted,
      percentComplete,
    };

    return NextResponse.json(
      { success: true, status },
      { headers: CACHE_HEADERS.PRIVATE_SHORT }
    );
  } catch (error) {
    console.error('Erreur onboarding status:', error);
    return errorResponse('Erreur interne du serveur', { status: 500 });
  }
}
