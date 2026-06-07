export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          full_name: string;
          role: 'student' | 'instructor' | 'admin';
          avatar_url?: string;
          bio?: string;
          phone?: string;
          location?: string;
          onboarding_completed: boolean;
          first_course_id?: string;
          welcome_email_sent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          full_name: string;
          role?: 'student' | 'instructor' | 'admin';
          avatar_url?: string;
          bio?: string;
          phone?: string;
          location?: string;
          onboarding_completed?: boolean;
          first_course_id?: string;
          welcome_email_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          full_name?: string;
          role?: 'student' | 'instructor' | 'admin';
          avatar_url?: string;
          bio?: string;
          phone?: string;
          location?: string;
          onboarding_completed?: boolean;
          first_course_id?: string;
          welcome_email_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description?: string;
          slug: string;
          image_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          slug: string;
          image_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          slug?: string;
          image_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          instructor_id: string;
          category_id: string;
          price: number;
          image_url?: string;
          duration?: number;
          level?: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          instructor_id: string;
          category_id: string;
          price: number;
          image_url?: string;
          duration?: number;
          level?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          instructor_id?: string;
          category_id?: string;
          price?: number;
          image_url?: string;
          duration?: number;
          level?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          content: string;
          video_url?: string;
          duration?: number;
          order: number;
          is_free: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description: string;
          content: string;
          video_url?: string;
          duration?: number;
          order?: number;
          is_free?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string;
          content?: string;
          video_url?: string;
          duration?: number;
          order?: number;
          is_free?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          status: 'pending' | 'active' | 'completed' | 'cancelled';
          enrolled_at: string;
          completed_at?: string;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          status?: 'pending' | 'active' | 'completed' | 'cancelled';
          enrolled_at?: string;
          completed_at?: string;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          status?: 'pending' | 'active' | 'completed' | 'cancelled';
          enrolled_at?: string;
          completed_at?: string;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          lesson_id: string;
          is_completed: boolean;
          completed_at?: string;
          progress_percentage: number;
          time_spent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          lesson_id: string;
          is_completed?: boolean;
          completed_at?: string;
          progress_percentage?: number;
          time_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          lesson_id?: string;
          is_completed?: boolean;
          completed_at?: string;
          progress_percentage?: number;
          time_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description?: string;
          passing_score: number;
          time_limit?: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string;
          passing_score?: number;
          time_limit?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string;
          passing_score?: number;
          time_limit?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question_text: string;
          question_type: 'multiple_choice' | 'true_false' | 'text';
          points: number;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question_text: string;
          question_type: 'multiple_choice' | 'true_false' | 'text';
          points?: number;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          question_text?: string;
          question_type?: 'multiple_choice' | 'true_false' | 'text';
          points?: number;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_answers: {
        Row: {
          id: string;
          question_id: string;
          answer_text: string;
          is_correct: boolean;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          answer_text: string;
          is_correct?: boolean;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          answer_text?: string;
          is_correct?: boolean;
          order_index?: number;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'success' | 'warning' | 'error';
          is_read: boolean;
          read_at?: string;
          action_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          is_read?: boolean;
          read_at?: string;
          action_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          is_read?: boolean;
          read_at?: string;
          action_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          amount: number;
          currency: string;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method?: string;
          transaction_id?: string;
          gateway_response?: any;
          paid_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          amount: number;
          currency?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method?: string;
          transaction_id?: string;
          gateway_response?: any;
          paid_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method?: string;
          transaction_id?: string;
          gateway_response?: any;
          paid_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_reviews: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          rating: number;
          comment?: string;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          rating: number;
          comment?: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          rating?: number;
          comment?: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          description?: string;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          min_purchase: number;
          max_discount?: number;
          usage_limit?: number;
          usage_count: number;
          is_active: boolean;
          starts_at: string;
          expires_at?: string;
          applicable_courses: string[];
          created_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          min_purchase?: number;
          max_discount?: number;
          usage_limit?: number;
          usage_count?: number;
          is_active?: boolean;
          starts_at?: string;
          expires_at?: string;
          applicable_courses?: string[];
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          description?: string;
          discount_type?: 'percentage' | 'fixed';
          discount_value?: number;
          min_purchase?: number;
          max_discount?: number;
          usage_limit?: number;
          usage_count?: number;
          is_active?: boolean;
          starts_at?: string;
          expires_at?: string;
          applicable_courses?: string[];
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      coupon_usages: {
        Row: {
          id: string;
          coupon_id: string;
          user_id: string;
          payment_id?: string;
          course_id?: string;
          discount_amount: number;
          used_at: string;
        };
        Insert: {
          id?: string;
          coupon_id: string;
          user_id: string;
          payment_id?: string;
          course_id?: string;
          discount_amount: number;
          used_at?: string;
        };
        Update: {
          id?: string;
          coupon_id?: string;
          user_id?: string;
          payment_id?: string;
          course_id?: string;
          discount_amount?: number;
          used_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

