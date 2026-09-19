/**
 * Generated from the live Supabase project's actual schema
 * (`mcp__supabase__generate_typescript_types`, Prompt 110) — do not hand-edit.
 * Regenerate after any schema migration so this file never silently drifts
 * from the real database.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      applications: {
        Row: {
          applicant_email: string | null;
          applicant_name: string | null;
          applicant_phone: string | null;
          child_id: string | null;
          created_at: string;
          id: string;
          learning_interests: string[];
          message: string | null;
          parent_id: string;
          reference_number: string | null;
          status: string;
          status_history: Json;
          submitted_at: string | null;
          updated_at: string;
        };
        Insert: {
          applicant_email?: string | null;
          applicant_name?: string | null;
          applicant_phone?: string | null;
          child_id?: string | null;
          created_at?: string;
          id?: string;
          learning_interests?: string[];
          message?: string | null;
          parent_id: string;
          reference_number?: string | null;
          status?: string;
          status_history?: Json;
          submitted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          applicant_email?: string | null;
          applicant_name?: string | null;
          applicant_phone?: string | null;
          child_id?: string | null;
          created_at?: string;
          id?: string;
          learning_interests?: string[];
          message?: string | null;
          parent_id?: string;
          reference_number?: string | null;
          status?: string;
          status_history?: Json;
          submitted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_child_id_fkey";
            columns: ["child_id"];
            isOneToOne: false;
            referencedRelation: "child_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      child_profiles: {
        Row: {
          account_status: string;
          age_years: number;
          avatar: string;
          created_at: string;
          favorite_category: string | null;
          id: string;
          name: string;
          parent_id: string;
        };
        Insert: {
          account_status?: string;
          age_years: number;
          avatar: string;
          created_at?: string;
          favorite_category?: string | null;
          id?: string;
          name: string;
          parent_id: string;
        };
        Update: {
          account_status?: string;
          age_years?: number;
          avatar?: string;
          created_at?: string;
          favorite_category?: string | null;
          id?: string;
          name?: string;
          parent_id?: string;
        };
        Relationships: [];
      };
      teacher_profiles: {
        Row: {
          account_status: string;
          age_groups_taught: string[];
          bio: string | null;
          certifications: string | null;
          country_region: string;
          created_at: string;
          education: string | null;
          email: string;
          expertise: string[];
          headline: string | null;
          id: string;
          languages: string[];
          moderation_status: string;
          name: string;
          photo: string | null;
          slug: string;
          subjects: string[];
          teaching_interests: string[];
          verified: boolean;
          visibility: string;
          years_experience: number | null;
        };
        Insert: {
          account_status?: string;
          age_groups_taught?: string[];
          bio?: string | null;
          certifications?: string | null;
          country_region: string;
          created_at?: string;
          education?: string | null;
          email: string;
          expertise?: string[];
          headline?: string | null;
          id: string;
          languages?: string[];
          moderation_status?: string;
          name: string;
          photo?: string | null;
          slug: string;
          subjects?: string[];
          teaching_interests?: string[];
          verified?: boolean;
          visibility?: string;
          years_experience?: number | null;
        };
        Update: {
          account_status?: string;
          age_groups_taught?: string[];
          bio?: string | null;
          certifications?: string | null;
          country_region?: string;
          created_at?: string;
          education?: string | null;
          email?: string;
          expertise?: string[];
          headline?: string | null;
          id?: string;
          languages?: string[];
          moderation_status?: string;
          name?: string;
          photo?: string | null;
          slug?: string;
          subjects?: string[];
          teaching_interests?: string[];
          verified?: boolean;
          visibility?: string;
          years_experience?: number | null;
        };
        Relationships: [];
      };
    };
    Views: {
      public_teacher_profiles: {
        Row: {
          age_groups_taught: string[] | null;
          bio: string | null;
          certifications: string | null;
          country_region: string | null;
          created_at: string | null;
          education: string | null;
          expertise: string[] | null;
          headline: string | null;
          id: string | null;
          languages: string[] | null;
          moderation_status: string | null;
          name: string | null;
          photo: string | null;
          slug: string | null;
          subjects: string[] | null;
          teaching_interests: string[] | null;
          verified: boolean | null;
          visibility: string | null;
          years_experience: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type DefaultSchema = Database["public"];

/** Row type for a table or view — `Tables<"child_profiles">`, `Tables<"public_teacher_profiles">`. */
export type Tables<T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])> = (DefaultSchema["Tables"] &
  DefaultSchema["Views"])[T] extends { Row: infer R }
  ? R
  : never;

/** Insert type for a table — `TablesInsert<"applications">`. */
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T] extends {
  Insert: infer I;
}
  ? I
  : never;

/** Update type for a table — `TablesUpdate<"teacher_profiles">`. */
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T] extends {
  Update: infer U;
}
  ? U
  : never;
