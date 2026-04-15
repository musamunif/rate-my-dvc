export interface Professor {
  id: string;
  name: string;
  department: string;
  courses: string;
  created_at: string;
}

export interface ProfessorWithStats extends Professor {
  avg_rating: number;
  avg_difficulty: number;
  would_take_again_pct: number;
  review_count: number;
}

export interface Review {
  id: string;
  professor_id: string;
  rating: number;
  difficulty: number;
  course: string;
  grade: string | null;
  would_take_again: boolean;
  comment: string;
  created_at: string;
}

export interface AiSummary {
  id: string;
  professor_id: string;
  teaching_style: string;
  difficulty_summary: string;
  who_thrives: string;
  tips: string;
  overall_rating: number;
  review_count: number;
  last_updated: string;
}
