export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          role: "student" | "guardian" | "teacher" | "admin";
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: "student" | "guardian" | "teacher" | "admin";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      user_settings: {
        Row: {
          user_id: string;
          default_unlock_score_required: number;
          default_cooldown_minutes: number;
          strict_mode_default: boolean;
          notification_preferences: Json;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          default_unlock_score_required?: number;
          default_cooldown_minutes?: number;
          strict_mode_default?: boolean;
          notification_preferences?: Json;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_settings"]["Insert"]>;
      };
      study_sets: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          subject: string;
          source_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          subject: string;
          source_notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["study_sets"]["Insert"]>;
      };
      questions: {
        Row: {
          id: string;
          study_set_id: string;
          source_chunk_id: string | null;
          prompt: string;
          options: string[];
          answer_index: number;
          difficulty: "easy" | "medium" | "hard";
          explanation: string | null;
        };
        Insert: {
          id?: string;
          study_set_id: string;
          source_chunk_id?: string | null;
          prompt: string;
          options: string[];
          answer_index: number;
          difficulty?: "easy" | "medium" | "hard";
          explanation?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["questions"]["Insert"]>;
      };
      study_sources: {
        Row: {
          id: string;
          study_set_id: string;
          user_id: string;
          file_name: string;
          file_path: string | null;
          mime_type: string;
          status: "uploaded" | "processing" | "ready" | "failed";
          created_at: string;
        };
        Insert: {
          id?: string;
          study_set_id: string;
          user_id: string;
          file_name: string;
          file_path?: string | null;
          mime_type: string;
          status?: "uploaded" | "processing" | "ready" | "failed";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["study_sources"]["Insert"]>;
      };
      source_chunks: {
        Row: {
          id: string;
          source_id: string;
          chunk_index: number;
          content: string;
          page_number: number | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          source_id: string;
          chunk_index: number;
          content: string;
          page_number?: number | null;
          metadata?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["source_chunks"]["Insert"]>;
      };
      focus_sessions: {
        Row: {
          id: string;
          user_id: string;
          study_set_id: string;
          duration_minutes: number;
          unlock_score_required: number;
          status: "scheduled" | "locked" | "unlocked" | "failed";
          started_at: string;
          ended_at: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          study_set_id: string;
          duration_minutes: number;
          unlock_score_required: number;
          status?: "scheduled" | "locked" | "unlocked" | "failed";
          started_at?: string;
          ended_at?: string | null;
          metadata?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["focus_sessions"]["Insert"]>;
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          focus_session_id: string | null;
          study_set_id: string;
          required_correct: number;
          correct_count: number;
          status: "passed" | "failed";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          focus_session_id?: string | null;
          study_set_id: string;
          required_correct: number;
          correct_count?: number;
          status: "passed" | "failed";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_attempts"]["Insert"]>;
      };
      question_attempts: {
        Row: {
          id: string;
          quiz_attempt_id: string;
          question_id: string;
          selected_answer_index: number;
          is_correct: boolean;
          answered_at: string;
        };
        Insert: {
          id?: string;
          quiz_attempt_id: string;
          question_id: string;
          selected_answer_index: number;
          is_correct: boolean;
          answered_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["question_attempts"]["Insert"]>;
      };
    };
  };
};
