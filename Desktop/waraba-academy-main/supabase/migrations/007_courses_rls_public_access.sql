-- Migration 007: Politiques RLS pour permettre l'accès public aux cours publiés
-- Cette migration permet aux utilisateurs non authentifiés de lire les cours publiés

-- Activer RLS sur la table courses si ce n'est pas déjà fait
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Supprimer la politique existante si elle existe (pour éviter les doublons)
DROP POLICY IF EXISTS "Public can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Courses are publicly readable if published" ON public.courses;

-- Créer une politique qui permet à tous (public) de lire les cours publiés
CREATE POLICY "Public can view published courses"
ON public.courses
FOR SELECT
TO public
USING (is_published = true);

-- Permettre aux utilisateurs authentifiés de voir tous les cours (publiés et non publiés)
-- Cela permet aux instructeurs et admins de voir leurs propres cours même s'ils ne sont pas publiés
DROP POLICY IF EXISTS "Authenticated users can view all courses" ON public.courses;

CREATE POLICY "Authenticated users can view all courses"
ON public.courses
FOR SELECT
TO authenticated
USING (true);

-- Permettre aux utilisateurs authentifiés de créer des cours (instructeurs et admins)
DROP POLICY IF EXISTS "Instructors and admins can create courses" ON public.courses;

CREATE POLICY "Instructors and admins can create courses"
ON public.courses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('instructor', 'admin')
  )
);

-- Permettre aux instructeurs et admins de modifier leurs cours
DROP POLICY IF EXISTS "Instructors and admins can update courses" ON public.courses;

CREATE POLICY "Instructors and admins can update courses"
ON public.courses
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('instructor', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('instructor', 'admin')
  )
);

-- Permettre aux admins de supprimer des cours
DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;

CREATE POLICY "Admins can delete courses"
ON public.courses
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Commentaire pour documenter
COMMENT ON POLICY "Public can view published courses" ON public.courses IS 
'Permet à tous les utilisateurs (authentifiés ou non) de lire les cours publiés (is_published = true)';
