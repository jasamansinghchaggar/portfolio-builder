export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: Database["public"]["Enums"]["app_role"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["user_id"]
          },
        ]
      }
      portfolios: {
        Row: {
          id: string
          user_id: string
          username: string
          draft_content: Json
          published_content: Json | null
          published_media_ids: string[]
          status: Database["public"]["Enums"]["portfolio_status"]
          revision: number
          published_at: string | null
          last_saved_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          draft_content: Json
          published_content?: Json | null
          published_media_ids?: string[]
          status?: Database["public"]["Enums"]["portfolio_status"]
          revision?: number
          published_at?: string | null
          last_saved_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: never
        Relationships: [
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_media: {
        Row: {
          id: string
          user_id: string
          portfolio_id: string
          kind: Database["public"]["Enums"]["media_kind"]
          storage_path: string
          file_name: string
          mime_type: string
          size_bytes: number
          width: number | null
          height: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          portfolio_id: string
          kind?: Database["public"]["Enums"]["media_kind"]
          storage_path: string
          file_name: string
          mime_type: string
          size_bytes: number
          width?: number | null
          height?: number | null
          created_at?: string
        }
        Update: {
          kind?: Database["public"]["Enums"]["media_kind"]
          file_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_media_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_media_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reserved_usernames: {
        Row: { username: string }
        Insert: { username: string }
        Update: { username?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      username_available: {
        Args: { p_username: string }
        Returns: boolean
      }
      create_portfolio: {
        Args: { p_username: string; p_content: Json }
        Returns: { id: string; username: string; revision: number }[]
      }
      save_portfolio_draft: {
        Args: { p_portfolio_id: string; p_content: Json; p_revision: number }
        Returns: { revision: number; saved_at: string }[]
      }
      publish_portfolio: {
        Args: {
          p_portfolio_id: string
          p_content: Json
          p_published_content: Json
          p_media_ids: string[]
          p_revision: number
        }
        Returns: { revision: number; published_at: string }[]
      }
      unpublish_portfolio: {
        Args: { p_portfolio_id: string; p_revision: number }
        Returns: { revision: number }[]
      }
      change_portfolio_username: {
        Args: { p_portfolio_id: string; p_username: string }
        Returns: string
      }
      get_public_portfolio: {
        Args: { p_username: string }
        Returns: {
          username: string
          content: Json
          media: Json
          published_at: string | null
          updated_at: string
        }[]
      }
      get_public_media: {
        Args: { p_id: string }
        Returns: {
          storage_path: string
          mime_type: string
          file_name: string
          width: number | null
          height: number | null
        }[]
      }
      get_public_portfolios: {
        Args: Record<PropertyKey, never>
        Returns: { username: string; updated_at: string }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_media_public: {
        Args: { p_storage_path: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
      portfolio_status: "draft" | "published" | "unpublished"
      media_kind: "avatar" | "project" | "resume" | "general"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Portfolio = Database["public"]["Tables"]["portfolios"]["Row"]
export type PortfolioMedia = Database["public"]["Tables"]["portfolio_media"]["Row"]
export type PortfolioStatus = Database["public"]["Enums"]["portfolio_status"]
export type MediaKind = Database["public"]["Enums"]["media_kind"]
