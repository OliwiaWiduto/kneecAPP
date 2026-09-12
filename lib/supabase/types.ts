export type Profile = {
  id: string;
  display_name: string;
  xp: number;
  streak: number;
  last_play_date: string | null;
  completed_lessons: string[];
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          display_name?: string;
          xp?: number;
          streak?: number;
          last_play_date?: string | null;
          completed_lessons?: string[];
          updated_at?: string;
        };
        Update: {
          display_name?: string;
          xp?: number;
          streak?: number;
          last_play_date?: string | null;
          completed_lessons?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
