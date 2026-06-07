-- Migration 044: Ajout des colonnes color et is_active à la table categories
-- Ces colonnes sont utilisées par l'interface admin mais n'existaient pas dans le schéma initial

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#3B82F6',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Mettre à jour les catégories existantes avec les valeurs par défaut
UPDATE public.categories
SET
  color = '#3B82F6'
WHERE color IS NULL;

UPDATE public.categories
SET
  is_active = true
WHERE is_active IS NULL;
