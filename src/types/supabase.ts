export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          status?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          status?: string
        }
      }
      chapters: {
        Row: {
          id: string
          book_id: string
          author_id: string
          title: string
          content: string | null
          order_index: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          book_id: string
          author_id: string
          title: string
          content?: string | null
          order_index?: number | null
        }
        Update: {
          id?: string
          book_id?: string
          author_id?: string
          title?: string
          content?: string | null
          order_index?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
