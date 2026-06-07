'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface CoursesDataState {
  allCourses: any[];
  loading: boolean;
  error: string | null;
}

// Cache partagé au niveau du module pour éviter les double-fetch
let cachedCourses: any[] | null = null;
let fetchPromise: Promise<any[]> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60_000; // 60 secondes

async function fetchCoursesOnce(): Promise<any[]> {
  const now = Date.now();

  // Retourner le cache s'il est encore frais
  if (cachedCourses && now - lastFetchTime < CACHE_DURATION) {
    return cachedCourses;
  }

  // Si un fetch est déjà en cours, le réutiliser
  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const { CourseService } = await import('@/services/courseService');
      const courses = await CourseService.getCourses();

      if (courses && Array.isArray(courses) && courses.length > 0) {
        cachedCourses = courses;
        lastFetchTime = Date.now();
        return courses;
      }
      return [];
    } catch {
      return cachedCourses || [];
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export function useCoursesData(initialData?: any[]) {
  const [state, setState] = useState<CoursesDataState>(() => {
    // Si des données initiales sont fournies (SSR), les utiliser directement
    if (initialData && initialData.length > 0) {
      // Pré-remplir le cache module pour éviter tout re-fetch
      if (!cachedCourses) {
        cachedCourses = initialData;
        lastFetchTime = Date.now();
      }
      return { allCourses: initialData, loading: false, error: null };
    }
    // Ne PAS utiliser cachedCourses ici : c'est une variable module-level partagée
    // entre les renders SSR (côté serveur, persiste entre requêtes) mais absente
    // côté client (fresh browser). Utiliser cachedCourses ici causerait un mismatch
    // d'hydratation React #418 si le cache serveur est non-vide mais le client est vide.
    // Le useEffect ci-dessous récupère le cache après le montage.
    return { allCourses: [], loading: true, error: null };
  });
  const mountedRef = useRef(true);

  const loadCourses = useCallback(async (isRefresh = false) => {
    if (!isRefresh && !mountedRef.current) return;

    // Ne pas montrer le loading spinner lors d'un refresh silencieux
    if (!isRefresh) {
      setState((prev) => ({ ...prev, loading: true }));
    }

    try {
      const courses = await fetchCoursesOnce();
      if (mountedRef.current) {
        setState({ allCourses: courses, loading: false, error: null });
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err?.message || 'Erreur lors du chargement',
        }));
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Si des données initiales ont été fournies, pas de fetch immédiat
    if (initialData && initialData.length > 0) {
      // Refresh silencieux après 5 minutes seulement
      const interval = setInterval(() => {
        if (mountedRef.current) loadCourses(true);
      }, 300_000);
      return () => {
        mountedRef.current = false;
        clearInterval(interval);
      };
    }

    // Si le cache module est déjà rempli (navigation SPA), l'utiliser immédiatement
    // sans déclencher un fetch réseau visible (isRefresh=true = pas de spinner).
    if (cachedCourses && cachedCourses.length > 0) {
      setState({ allCourses: cachedCourses, loading: false, error: null });
    } else {
      loadCourses(false);
    }

    // Silent refresh every 5 minutes
    const interval = setInterval(() => {
      loadCourses(true);
    }, 300_000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadCourses]);

  return state;
}
