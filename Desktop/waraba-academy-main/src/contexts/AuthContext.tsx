'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { supabaseConfig } from '@/config/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: any) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider ({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Créer le client Supabase pour le navigateur — memoized to avoid recreating on every render
  const supabase = useMemo(() => createBrowserClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey,
  ), []);

  // Track whether avatar sync has already run this session to avoid repeated calls
  const avatarSyncedRef = useRef<string | null>(null);

  // Fonction pour synchroniser l'avatar_url depuis la table profiles vers user_metadata
  // currentUser est passé en paramètre pour éviter un getUser() réseau supplémentaire
  const syncAvatarFromProfile = useCallback(async (userId: string, currentUser?: User): Promise<void> => {
    // Only sync once per user per session
    if (avatarSyncedRef.current === userId) return;
    avatarSyncedRef.current = userId;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) return;

      const profileData = profile as { avatar_url: string | null } | null;
      const currentAvatarUrl = currentUser?.user_metadata?.avatar_url;

      // Appeler updateUser() uniquement si l'avatar est non-vide ET différent
      // Évite l'event USER_UPDATED → onAuthStateChange → re-renders inutiles
      if (profileData?.avatar_url && currentAvatarUrl !== profileData.avatar_url) {
        await supabase.auth.updateUser({
          data: { avatar_url: profileData.avatar_url },
        });
      }
    } catch {
      // Reset so it can retry next time
      avatarSyncedRef.current = null;
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    // Récupérer la session initiale
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Ne pas bloquer le chargement - synchroniser l'avatar en arrière-plan
          setLoading(false);

          // Synchroniser l'avatar_url depuis profiles en arrière-plan (non-bloquant)
          if (session?.user?.id) {
            syncAvatarFromProfile(session.user.id, session.user).catch(err => {
              console.error('Erreur lors de la synchronisation en arrière-plan:', err);
            });
          }
        }
      } catch (error) {
        console.error('Erreur inattendue lors de la récupération de la session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (mounted) {
          if (event === 'SIGNED_OUT' || newSession === null) {
            // Bloquer tout sync d'avatar résiduel
            avatarSyncedRef.current = '__signed_out__';
            setSession(null);
            setUser(null);
            setLoading(false);
          } else if (newSession) {
            // Ne pas restaurer la session si une déconnexion est en cours
            if (avatarSyncedRef.current === '__signed_out__') return;
            // Comparer avant de mettre à jour pour éviter les re-renders en cascade
            // sur TOKEN_REFRESHED (nouvelle référence objet mais données identiques)
            setSession(prev =>
              prev?.access_token !== newSession.access_token ? newSession : prev
            );
            setUser(prev =>
              prev?.id !== newSession.user.id || prev?.updated_at !== newSession.user.updated_at
                ? newSession.user
                : prev
            );
            setLoading(false);

            // Sync avatar only on explicit sign-in (not token refresh)
            if (event === 'SIGNED_IN' && newSession.user.id) {
              syncAvatarFromProfile(newSession.user.id, newSession.user).catch(() => {});
            }
          }
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, syncAvatarFromProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erreur de connexion:', error);
        return {
          success: false,
          error: getErrorMessage(error),
        };
      }

      if (data.user && data.session) {
        // Synchroniser l'avatar_url depuis profiles en arrière-plan (non-bloquant)
        if (data.user.id) {
          syncAvatarFromProfile(data.user.id, data.user).catch(err => {
            console.error('Erreur lors de la synchronisation en arrière-plan:', err);
          });
        }
        
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Erreur inattendue lors de la connexion',
        };
      }
    } catch (error) {
      console.error('Erreur inattendue lors de la connexion:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback',
        },
      });

      if (error) {
        console.error('Erreur d\'inscription:', error);
        return {
          success: false,
          error: getErrorMessage(error),
        };
      }

      if (data.user && !data.session) {
        // Inscription réussie, email de confirmation envoyé
        return { success: true, requiresEmailConfirmation: true };
      } else if (data.user && data.session) {
        // Inscription réussie et utilisateur connecté automatiquement
        return { success: true, requiresEmailConfirmation: false };
      } else {
        return {
          success: false,
          error: 'Erreur inattendue lors de l\'inscription',
        };
      }
    } catch (error) {
      console.error('Erreur inattendue lors de l\'inscription:', error);
      return {
        success: false,
        error: 'Erreur d\'inscription au serveur',
      };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback`
        : '/auth/callback';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Erreur de connexion Google:', error);
        return {
          success: false,
          error: getErrorMessage(error),
        };
      }

      // La redirection vers Google se fait automatiquement via Supabase
      // Le navigateur sera redirigé vers Google pour l'authentification
      return { success: true };
    } catch (error) {
      console.error('Erreur inattendue lors de la connexion Google:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  };

  const signOut = async () => {
    try {
      // Bloquer tout sync d'avatar en cours pour éviter la race condition
      avatarSyncedRef.current = '__signed_out__';

      // 1. Déconnexion côté client (efface localStorage + cookies client)
      await supabase.auth.signOut({ scope: 'global' });

      // 2. Effacer manuellement tous les items Supabase restants
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) localStorage.removeItem(key);
        });
        document.cookie.split(';').forEach(c => {
          const name = c.trim().split('=')[0] ?? '';
          if (name.startsWith('sb-')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
        });
      }

      setUser(null);
      setSession(null);

      return { success: true };
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
      setUser(null);
      setSession(null);
      return {
        success: false,
        error: 'Erreur de déconnexion au serveur',
      };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=/auth/reset-password`
          : '/auth/callback?next=/auth/reset-password',
      });

      if (error) {
        console.error('Erreur de réinitialisation du mot de passe:', error);
        return {
          success: false,
          error: getErrorMessage(error),
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur inattendue lors de la réinitialisation:', error);
      return {
        success: false,
        error: 'Erreur de réinitialisation au serveur',
      };
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        console.error('Erreur de mise à jour du profil:', error);
        return {
          success: false,
          error: getErrorMessage(error),
        };
      }

      // Mettre à jour l'état local avec les nouvelles données
      // onAuthStateChange (USER_UPDATED) synchronisera session automatiquement
      if (data.user) {
        setUser(data.user);
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur inattendue lors de la mise à jour:', error);
      return {
        success: false,
        error: 'Erreur de mise à jour au serveur',
      };
    }
  };

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: refreshed }, error } = await supabase.auth.getSession();

      if (error) return;

      if (refreshed) {
        setSession(refreshed);
        setUser(refreshed.user);
      } else {
        setSession(null);
        setUser(null);
      }
    } catch {
      // silently fail
    }
  }, [supabase]);

  // Fonction utilitaire pour traduire les messages d'erreur
  const getErrorMessage = (error: AuthError): string => {
    // Vérifier les erreurs spécifiques OAuth
    if (error.message?.includes('provider is not enabled') || 
        error.message?.includes('Unsupported provider') ||
        (error as any).error_code === 'validation_failed') {
      return 'Le provider Google n\'est pas activé. Veuillez l\'activer dans le dashboard Supabase (Authentication > Providers > Google).';
    }

    switch (error.message) {
    case 'Invalid login credentials':
      return 'Email ou mot de passe incorrect';
    case 'Email not confirmed':
      return 'Veuillez confirmer votre email avant de vous connecter';
    case 'User already registered':
      return 'Un compte avec cet email existe déjà';
    case 'Password should be at least 6 characters':
      return 'Le mot de passe doit contenir au moins 6 caractères';
    case 'Unable to validate email address: invalid format':
      return 'Format d\'email invalide';
    case 'Signup is disabled':
      return 'L\'inscription est temporairement désactivée';
    case 'Too many requests':
      return 'Trop de tentatives. Veuillez réessayer plus tard';
    default:
      return error.message || 'Une erreur est survenue';
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth () {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
