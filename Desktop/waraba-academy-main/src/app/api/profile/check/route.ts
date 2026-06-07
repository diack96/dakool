import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET - Vérifier si le profil est complet
export async function GET (_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll () {
            return cookieStore.getAll();
          },
          setAll (cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Ignorer les erreurs de cookies côté serveur
            }
          },
        },
      },
    );

    // Vérifier l'authentification (getSession = JWT local, zéro appel réseau Auth)
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 },
      );
    }

    // Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, phone, location, avatar_url, welcome_email_sent')
      .eq('id', user.id)
      .maybeSingle();

    // Si le profil n'existe pas, retourner un profil vide plutôt qu'une erreur 404
    if (profileError || !profile) {
      return NextResponse.json({
        success: true,
        isComplete: false,
        completionPercentage: 0,
        missingRequired: ['Prénom', 'Nom', 'Email'],
        missingRecommended: ['Téléphone', 'Lieu de résidence'],
        profile: {
          firstName: null,
          lastName: null,
          email: user.email || null,
          phone: null,
          location: null,
          avatarUrl: null,
        },
      });
    }

    // Définir les champs requis et optionnels
    const requiredFields = ['first_name', 'last_name', 'email'];
    const recommendedFields = ['phone', 'location'];

    // Vérifier les champs requis
    const missingRequired: string[] = [];
    const missingRecommended: string[] = [];

    requiredFields.forEach((field) => {
      if (!profile[field as keyof typeof profile] || String(profile[field as keyof typeof profile]).trim() === '') {
        missingRequired.push(field);
      }
    });

    recommendedFields.forEach((field) => {
      if (!profile[field as keyof typeof profile] || String(profile[field as keyof typeof profile]).trim() === '') {
        missingRecommended.push(field);
      }
    });

    // Calculer le pourcentage de complétion
    const totalFields = requiredFields.length + recommendedFields.length;
    const completedFields = totalFields - missingRequired.length - missingRecommended.length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    // Le profil est complet si tous les champs requis sont remplis
    const isComplete = missingRequired.length === 0;

    // Mapper les noms de champs en français
    const fieldNames: Record<string, string> = {
      first_name: 'Prénom',
      last_name: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      location: 'Lieu de résidence',
    };

    return NextResponse.json({
      success: true,
      isComplete,
      completionPercentage,
      missingRequired: missingRequired.map(f => fieldNames[f] || f),
      missingRecommended: missingRecommended.map(f => fieldNames[f] || f),
      profile: {
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        avatarUrl: profile.avatar_url,
        welcome_email_sent: profile.welcome_email_sent ?? false,
      },
    });
  } catch (error: unknown) {
    console.error('Erreur serveur lors de la vérification du profil', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}
