export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: string | null
          id: string
          ip_address: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_emails: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      ai_sessions: {
        Row: {
          book_id: string | null
          chapter_id: string | null
          created_at: string | null
          id: string
          input_prompt: string | null
          output_content: string | null
          provider: string | null
          user_id: string
        }
        Insert: {
          book_id?: string | null
          chapter_id?: string | null
          created_at?: string | null
          id?: string
          input_prompt?: string | null
          output_content?: string | null
          provider?: string | null
          user_id: string
        }
        Update: {
          book_id?: string | null
          chapter_id?: string | null
          created_at?: string | null
          id?: string
          input_prompt?: string | null
          output_content?: string | null
          provider?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_sessions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_sessions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      book_covers: {
        Row: {
          book_id: string
          created_at: string | null
          id: string
          image_id: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          id?: string
          image_id: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          id?: string
          image_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_covers_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
        ]
      }
      book_elements: {
        Row: {
          book_id: string
          content: string | null
          created_at: string
          enabled: boolean
          id: string
          order_index: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          book_id: string
          content?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          order_index?: number
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          book_id?: string
          content?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          order_index?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          owner_id: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          owner_id: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          owner_id?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chapters: {
        Row: {
          author_id: string
          book_id: string
          content: string | null
          created_at: string | null
          id: string
          order_index: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          book_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          book_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      failed_login_attempts: {
        Row: {
          attempt_time: string
          email: string
          id: string
          ip_address: string | null
          reason: string | null
          user_agent: string | null
        }
        Insert: {
          attempt_time?: string
          email: string
          id?: string
          ip_address?: string | null
          reason?: string | null
          user_agent?: string | null
        }
        Update: {
          attempt_time?: string
          email?: string
          id?: string
          ip_address?: string | null
          reason?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      images: {
        Row: {
          alt_text: string | null
          book_id: string | null
          chapter_id: string | null
          created_at: string | null
          file_size: number | null
          filename: string | null
          height: number | null
          id: string
          layout: string | null
          mime_type: string | null
          position_x: number | null
          position_y: number | null
          scale: number | null
          storage_path: string
          text_wrap: string | null
          updated_at: string
          url: string | null
          user_id: string | null
          width: number | null
          z_index: number | null
        }
        Insert: {
          alt_text?: string | null
          book_id?: string | null
          chapter_id?: string | null
          created_at?: string | null
          file_size?: number | null
          filename?: string | null
          height?: number | null
          id?: string
          layout?: string | null
          mime_type?: string | null
          position_x?: number | null
          position_y?: number | null
          scale?: number | null
          storage_path: string
          text_wrap?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string | null
          width?: number | null
          z_index?: number | null
        }
        Update: {
          alt_text?: string | null
          book_id?: string | null
          chapter_id?: string | null
          created_at?: string | null
          file_size?: number | null
          filename?: string | null
          height?: number | null
          id?: string
          layout?: string | null
          mime_type?: string | null
          position_x?: number | null
          position_y?: number | null
          scale?: number | null
          storage_path?: string
          text_wrap?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string | null
          width?: number | null
          z_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "images_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      table_of_contents: {
        Row: {
          auto_generated: boolean | null
          book_id: string
          chapter_id: string
          created_at: string | null
          id: string
          level: number | null
          page_number: number | null
          updated_at: string | null
        }
        Insert: {
          auto_generated?: boolean | null
          book_id: string
          chapter_id: string
          created_at?: string | null
          id?: string
          level?: number | null
          page_number?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_generated?: boolean | null
          book_id?: string
          chapter_id?: string
          created_at?: string | null
          id?: string
          level?: number | null
          page_number?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_of_contents_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_failed_login_attempts: {
        Args: { threshold?: number; user_email: string }
        Returns: boolean
      }
      citext: {
        Args: { "": boolean } | { "": string } | { "": unknown }
        Returns: string
      }
      citext_hash: {
        Args: { "": string }
        Returns: number
      }
      citextin: {
        Args: { "": unknown }
        Returns: string
      }
      citextout: {
        Args: { "": string }
        Returns: unknown
      }
      citextrecv: {
        Args: { "": unknown }
        Returns: string
      }
      citextsend: {
        Args: { "": string }
        Returns: string
      }
      get_admin_users_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          bio: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          last_sign_in_at: string
          name: string
          role: string
        }[]
      }
      get_security_overview: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          metric: string
          value: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_failed_login_attempt: {
        Args: {
          failure_reason?: string
          user_agent_string?: string
          user_email: string
          user_ip?: string
        }
        Returns: undefined
      }
      promote_user_to_admin: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      run_security_audit: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          check_name: string
          message: string
          recommendation: string
          status: string
        }[]
      }
      update_chapter_order: {
        Args: { chapter_id: string; new_order: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
