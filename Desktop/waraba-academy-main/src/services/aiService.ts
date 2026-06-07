export interface LearningProfile {
  userId: string;
  interests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  preferredLanguages: string[];
  timeAvailability: number;
  goals: string[];
  completedCourses: string[];
  currentProgress: Record<string, number>;
}

export interface CourseRecommendation {
  courseId: string;
  title: string;
  confidence: number;
  reason: string;
  estimatedDuration: number;
  prerequisites: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface PersonalizedLearningPath {
  userId: string;
  pathId: string;
  title: string;
  description: string;
  courses: CourseRecommendation[];
  estimatedTotalDuration: number;
  milestones: string[];
  adaptativeAdjustments: string[];
}

export interface AIResponse {
  content: string;
  suggestions: string[];
  nextSteps: string[];
  confidence: number;
}

async function callAI(prompt: string, max_tokens = 500, temperature = 0.7): Promise<string | null> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, max_tokens, temperature }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.content ?? null;
  } catch {
    return null;
  }
}

export class AIService {
  private static instance: AIService;
  private learningProfiles: Map<string, LearningProfile> = new Map();

  static getInstance(): AIService {
    if (!AIService.instance) AIService.instance = new AIService();
    return AIService.instance;
  }

  async createLearningProfile(profile: LearningProfile): Promise<LearningProfile> {
    this.learningProfiles.set(profile.userId, profile);
    const prompt = `Analyser ce profil d'apprenant et fournir des recommandations :
Niveau : ${profile.skillLevel} | Style : ${profile.learningStyle}
Intérêts : ${profile.interests.join(', ')} | Objectifs : ${profile.goals.join(', ')}
Temps : ${profile.timeAvailability}h/semaine | Cours complétés : ${profile.completedCourses.length}`;
    await callAI(prompt, 400);
    return profile;
  }

  async generateCourseRecommendations(userId: string, context?: string): Promise<CourseRecommendation[]> {
    const profile = this.learningProfiles.get(userId);
    if (!profile) throw new Error('Profil non trouvé');
    const prompt = `Recommander des cours pour : niveau ${profile.skillLevel}, intérêts ${profile.interests.join(', ')}, objectifs ${profile.goals.join(', ')}. Contexte : ${context || 'Général'}`;
    await callAI(prompt, 600, 0.8);
    return this.getFallbackRecommendations(profile);
  }

  async createPersonalizedLearningPath(userId: string, goal: string, timeframe: number): Promise<PersonalizedLearningPath> {
    const profile = this.learningProfiles.get(userId);
    if (!profile) throw new Error('Profil non trouvé');
    const prompt = `Créer un parcours d'apprentissage : objectif ${goal}, délai ${timeframe} semaines, niveau ${profile.skillLevel}, ${profile.timeAvailability}h/semaine`;
    await callAI(prompt, 500);
    return this.getFallbackLearningPath(userId, goal);
  }

  async chatWithAI(userId: string, message: string, context?: string): Promise<AIResponse> {
    const profile = this.learningProfiles.get(userId);
    const prompt = `Tu es un assistant Waraba Academy (formation tech africaine).
Profil : niveau ${profile?.skillLevel || 'inconnu'}, intérêts ${profile?.interests?.join(', ') || 'généraux'}
Contexte : ${context || 'Général'} | Message : ${message}
Répondre avec encouragement, conseils pratiques et suggestions d'actions.`;
    const content = await callAI(prompt, 400, 0.8);
    return {
      content: content || 'Je suis votre assistant d\'apprentissage ! Comment puis-je vous aider ?',
      suggestions: ['Explorer les cours disponibles', 'Définir vos objectifs', 'Rejoindre un groupe d\'étude'],
      nextSteps: ['Commencer par un cours de base', 'Évaluer votre niveau', 'Planifier votre temps'],
      confidence: content ? 85 : 70,
    };
  }

  async analyzeLearningPerformance(userId: string, performanceData: unknown): Promise<{ analysis: string; timestamp: string }> {
    const profile = this.learningProfiles.get(userId);
    const prompt = `Analyser ces performances : profil ${profile?.skillLevel} - ${profile?.learningStyle}, données : ${JSON.stringify(performanceData)}`;
    const content = await callAI(prompt, 500, 0.6);
    return { analysis: content || 'Analyse non disponible.', timestamp: new Date().toISOString() };
  }

  getLearningProfile(userId: string): LearningProfile | undefined {
    return this.learningProfiles.get(userId);
  }

  updateLearningProfile(userId: string, updates: Partial<LearningProfile>): void {
    const current = this.learningProfiles.get(userId);
    if (current) this.learningProfiles.set(userId, { ...current, ...updates });
  }

  deleteLearningProfile(userId: string): boolean {
    return this.learningProfiles.delete(userId);
  }

  private getFallbackRecommendations(profile: LearningProfile): CourseRecommendation[] {
    const recs: CourseRecommendation[] = [{
      courseId: 'react-advanced', title: 'React Avancé avec Hooks et Context',
      confidence: 95, reason: 'Adapté à votre niveau', estimatedDuration: 20,
      prerequisites: ['React Basics', 'JavaScript ES6+'], difficulty: 'intermediate',
    }];
    if (profile.skillLevel === 'beginner') recs.unshift({
      courseId: 'web-fundamentals', title: 'Fondamentaux du Web',
      confidence: 90, reason: 'Base solide pour débuter', estimatedDuration: 15,
      prerequisites: [], difficulty: 'beginner',
    });
    return recs;
  }

  private getFallbackLearningPath(userId: string, goal: string): PersonalizedLearningPath {
    return {
      userId, pathId: `path-${Date.now()}`,
      title: `Parcours vers : ${goal}`, description: 'Parcours recommandé',
      courses: [], estimatedTotalDuration: 30,
      milestones: ['Évaluation des compétences', 'Apprentissage des fondamentaux', 'Projets pratiques', 'Évaluation finale'],
      adaptativeAdjustments: ['Suivi de la progression', 'Ajustements selon les difficultés'],
    };
  }
}

export default AIService;
