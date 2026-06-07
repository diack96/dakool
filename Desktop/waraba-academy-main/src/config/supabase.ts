/**
 * Configuration Supabase accessible côté client
 * 
 * ⚠️ SÉCURITÉ: Utilise uniquement des variables d'environnement
 * Les valeurs ne doivent JAMAIS être hardcodées dans le code source
 */
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

// Validation au runtime pour détecter les variables manquantes
if (typeof window !== 'undefined') {
  const hasUrl = !!supabaseConfig.url;
  const hasKey = !!supabaseConfig.anonKey;
  const isValidUrl = supabaseConfig.url.startsWith('https://');

  if (!hasUrl || !hasKey) {
    console.error(
      '❌ ERREUR CRITIQUE: Variables Supabase manquantes!\n' +
      'Veuillez configurer NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans votre fichier .env.local\n' +
      'Consultez GUIDE_FIX_SUPABASE_CONNECTION.md pour plus d\'aide.'
    );
  } else if (!isValidUrl) {
    console.warn(
      '⚠️  ATTENTION: NEXT_PUBLIC_SUPABASE_URL doit commencer par https://\n' +
      'URL actuelle:', supabaseConfig.url
    );
  } else {
    console.log('✅ Configuration Supabase chargée correctement');
  }
}
