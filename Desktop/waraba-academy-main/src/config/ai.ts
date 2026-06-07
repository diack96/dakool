// Configuration IA pour Waraba Academy
export const AI_CONFIG = {
  // Configuration OpenAI
  OPENAI: {
    API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'your-api-key-here',
    MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7,
    TIMEOUT: 30000, // 30 secondes
  },

  // Configuration Langchain
  LANGCHAIN: {
    TRACING: process.env.NODE_ENV === 'development',
    DEBUG: process.env.NODE_ENV === 'development',
  },

  // Configuration des prompts IA
  PROMPTS: {
    LEARNING_PROFILE_ANALYSIS: `
      Tu es un expert en pédagogie et apprentissage pour Waraba Academy, 
      une plateforme de formation tech africaine.
      
      Analyser ce profil d'apprenant et fournir des recommandations personnalisées :
      
      Profil :
      - Niveau : {skillLevel}
      - Style d'apprentissage : {learningStyle}
      - Intérêts : {interests}
      - Objectifs : {goals}
      - Temps disponible : {timeAvailability}h/semaine
      - Cours complétés : {completedCoursesCount}
      
      Fournir des recommandations pour :
      1. Améliorer le style d'apprentissage
      2. Optimiser le temps d'étude
      3. Définir des objectifs SMART
      4. Identifier les compétences manquantes
      5. Adapter le contenu au contexte africain
    `,

    COURSE_RECOMMENDATIONS: `
      Basé sur ce profil d'apprenant, recommander des cours pertinents :
      
      Profil :
      - Niveau actuel : {skillLevel}
      - Intérêts : {interests}
      - Objectifs : {goals}
      - Cours complétés : {completedCourses}
      - Contexte : {context}
      
      Recommander 5-8 cours avec :
      - Titre du cours
      - Niveau de difficulté
      - Raison de la recommandation
      - Durée estimée
      - Prérequis
      - Score de confiance (0-100)
      - Adaptation au marché africain
    `,

    LEARNING_PATH_CREATION: `
      Créer un parcours d'apprentissage personnalisé :
      
      Objectif : {goal}
      Délai : {timeframe} semaines
      Profil : {skillLevel} - {learningStyle}
      Temps disponible : {timeAvailability}h/semaine
      
      Créer un parcours avec :
      - Séquence de cours logique
      - Jalons et objectifs intermédiaires
      - Ajustements adaptatifs
      - Estimation du temps total
      - Stratégies pour le marché africain
    `,

    PERFORMANCE_ANALYSIS: `
      Analyser ces données de performance d'apprentissage :
      
      Profil : {skillLevel} - {learningStyle}
      Données : {performanceData}
      
      Fournir :
      - Analyse des forces et faiblesses
      - Recommandations d'amélioration
      - Stratégies d'optimisation
      - Prédictions de progression
      - Conseils adaptés au contexte africain
    `,

    AI_CHAT: `
      Tu es un assistant d'apprentissage IA pour Waraba Academy, 
      une plateforme de formation tech africaine.
      
      Profil de l'utilisateur :
      - Niveau : {skillLevel}
      - Intérêts : {interests}
      - Style d'apprentissage : {learningStyle}
      
      Contexte : {context}
      Message de l'utilisateur : {message}
      
      Répondre de manière :
      - Encouragement et motivation
      - Conseils pratiques et concrets
      - Suggestions d'actions immédiates
      - Liens avec la culture africaine quand c'est pertinent
      - Exemples du marché tech africain
      
      Fournir :
      - Réponse principale
      - 3 suggestions d'actions
      - Prochaines étapes recommandées
      - Score de confiance (0-100)
    `,
  },

  // Configuration des modèles de données
  MODELS: {
    LEARNING_PROFILE: {
      MIN_INTERESTS: 1,
      MAX_INTERESTS: 8,
      MIN_GOALS: 1,
      MAX_GOALS: 5,
      MIN_TIME_AVAILABILITY: 1,
      MAX_TIME_AVAILABILITY: 40,
    },

    COURSE_RECOMMENDATION: {
      MIN_CONFIDENCE: 70,
      MAX_RECOMMENDATIONS: 8,
      MIN_DURATION: 5,
      MAX_DURATION: 50,
    },

    LEARNING_PATH: {
      MIN_TIMEFRAME: 4,
      MAX_TIMEFRAME: 52,
      MIN_MILESTONES: 3,
      MAX_MILESTONES: 8,
    },
  },

  // Configuration des seuils et métriques
  THRESHOLDS: {
    PERFORMANCE: {
      EXCELLENT: 90,
      GOOD: 80,
      AVERAGE: 70,
      NEEDS_IMPROVEMENT: 60,
    },

    ENGAGEMENT: {
      HIGH: 80,
      MEDIUM: 60,
      LOW: 40,
    },

    CONFIDENCE: {
      HIGH: 85,
      MEDIUM: 70,
      LOW: 55,
    },
  },

  // Configuration des fallbacks
  FALLBACKS: {
    DEFAULT_SKILL_LEVEL: 'beginner',
    DEFAULT_LEARNING_STYLE: 'visual',
    DEFAULT_LANGUAGES: ['Français'],
    DEFAULT_TIME_AVAILABILITY: 10,
    DEFAULT_GOALS: ['Développer des compétences tech', 'Améliorer ma carrière'],
  },

  // Configuration des erreurs et messages
  MESSAGES: {
    ERRORS: {
      API_UNAVAILABLE: 'Service IA temporairement indisponible. Veuillez réessayer plus tard.',
      INVALID_PROFILE: 'Profil d\'apprentissage invalide. Veuillez vérifier vos informations.',
      ANALYSIS_FAILED: 'L\'analyse IA a échoué. Utilisation des recommandations par défaut.',
      TIMEOUT: 'L\'analyse IA prend plus de temps que prévu. Veuillez patienter.',
    },

    SUCCESS: {
      PROFILE_CREATED: 'Profil d\'apprentissage créé avec succès !',
      RECOMMENDATIONS_READY: 'Recommandations personnalisées générées !',
      LEARNING_PATH_CREATED: 'Parcours d\'apprentissage personnalisé créé !',
      ANALYSIS_COMPLETE: 'Analyse des performances terminée !',
    },

    INFO: {
      LOADING: 'Analyse en cours...',
      PROCESSING: 'Traitement des données...',
      GENERATING: 'Génération des recommandations...',
      OPTIMIZING: 'Optimisation du parcours...',
    },
  },

  // Configuration des tests et développement
  DEVELOPMENT: {
    MOCK_DATA: process.env.NODE_ENV === 'development',
    LOG_LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    ENABLE_ANALYTICS: true,
    SIMULATE_DELAYS: process.env.NODE_ENV === 'development',
  },
};

// Types pour la configuration
export interface AIConfig {
  OPENAI: {
    API_KEY: string;
    MODEL: string;
    MAX_TOKENS: number;
    TEMPERATURE: number;
    TIMEOUT: number;
  };
  LANGCHAIN: {
    TRACING: boolean;
    DEBUG: boolean;
  };
  PROMPTS: Record<string, string>;
  MODELS: Record<string, any>;
  THRESHOLDS: Record<string, any>;
  FALLBACKS: Record<string, any>;
  MESSAGES: Record<string, any>;
  DEVELOPMENT: Record<string, any>;
}

// Fonction utilitaire pour obtenir la configuration
export const getAIConfig = (): AIConfig => AI_CONFIG;

// Fonction pour valider la configuration
export const validateAIConfig = (): boolean => {
  const config = getAIConfig();

  if (!config.OPENAI.API_KEY || config.OPENAI.API_KEY === 'your-api-key-here') {
    console.warn('⚠️ Clé API OpenAI non configurée. Utilisation du mode fallback.');
    return false;
  }

  return true;
};

// Fonction pour obtenir un prompt formaté
export const getFormattedPrompt = (promptKey: string, variables: Record<string, any>): string => {
  const config = getAIConfig();
  let prompt = config.PROMPTS[promptKey] || '';

  // Remplacer les variables dans le prompt
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
  });

  return prompt;
};

export default AI_CONFIG;
