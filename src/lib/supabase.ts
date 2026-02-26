import { createClient } from "@supabase/supabase-js";

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our timeline structure
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          updated_at?: string;
        };
      };
      timelines: {
        Row: {
          id: string;
          user_id: string;
          baby_name: string;
          birth_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          baby_name: string;
          birth_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          baby_name?: string;
          birth_date?: string;
          updated_at?: string;
        };
      };
      milestones: {
        Row: {
          id: string;
          timeline_id: string;
          title: string;
          description: string;
          milestone_date: string;
          category: string | null;
          photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          timeline_id: string;
          title: string;
          description: string;
          milestone_date: string;
          category?: string | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          milestone_date?: string;
          category?: string | null;
          photo_url?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
