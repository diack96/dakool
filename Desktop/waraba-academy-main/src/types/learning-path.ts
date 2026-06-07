export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  thumbnail: string | null;
  level: 'all' | 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  estimated_duration: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Relations enrichies
  courses?: LearningPathCourse[];
  courses_count?: number;
  enrolled_count?: number;
}

export interface LearningPathCourse {
  id: string;
  learning_path_id: string;
  course_id: string;
  course_order: number;
  created_at: string;
  // Données du cours joint
  course?: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    image_url: string | null;
    level: string;
    duration: number | null;
    price: number | null;
    is_free: boolean;
    total_students?: number;
    total_lessons?: number;
    rating?: number;
  };
}

export interface UserLearningPathProgress {
  id: string;
  user_id: string;
  learning_path_id: string;
  progress_percentage: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningPathFormData {
  title: string;
  slug: string;
  description: string;
  short_description: string;
  thumbnail: string;
  level: 'all' | 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
}
