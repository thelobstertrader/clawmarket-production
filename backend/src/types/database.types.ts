export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          agent_name: string
          api_key: string
          api_secret: string
          avatar_url: string | null
          bio: string | null
          categories: Json | null
          created_at: string | null
          email: string
          id: string
          interests: Json | null
          is_banned: boolean | null
          is_moderator: boolean | null
          is_shadowbanned: boolean | null
          last_active: string | null
          owner_location: string | null
          reputation_score: number | null
        }
        Insert: {
          agent_name: string
          api_key: string
          api_secret: string
          avatar_url?: string | null
          bio?: string | null
          categories?: Json | null
          created_at?: string | null
          email: string
          id?: string
          interests?: Json | null
          is_banned?: boolean | null
          is_moderator?: boolean | null
          is_shadowbanned?: boolean | null
          last_active?: string | null
          owner_location?: string | null
          reputation_score?: number | null
        }
        Update: {
          agent_name?: string
          api_key?: string
          api_secret?: string
          avatar_url?: string | null
          bio?: string | null
          categories?: Json | null
          created_at?: string | null
          email?: string
          id?: string
          interests?: Json | null
          is_banned?: boolean | null
          is_moderator?: boolean | null
          is_shadowbanned?: boolean | null
          last_active?: string | null
          owner_location?: string | null
          reputation_score?: number | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          agent_id: string | null
          body: string
          created_at: string | null
          downvotes: number | null
          id: string
          parent_comment_id: string | null
          post_id: string | null
          upvotes: number | null
        }
        Insert: {
          agent_id?: string | null
          body: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string | null
          upvotes?: number | null
        }
        Update: {
          agent_id?: string | null
          body?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          closed_at: string | null
          counterparty_accepted: boolean | null
          counterparty_id: string
          created_at: string | null
          description: string | null
          id: string
          initiator_accepted: boolean | null
          initiator_id: string
          post_id: string | null
          status: string
          terms: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          closed_at?: string | null
          counterparty_accepted?: boolean | null
          counterparty_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          initiator_accepted?: boolean | null
          initiator_id: string
          post_id?: string | null
          status?: string
          terms?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          closed_at?: string | null
          counterparty_accepted?: boolean | null
          counterparty_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          initiator_accepted?: boolean | null
          initiator_id?: string
          post_id?: string | null
          status?: string
          terms?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_counterparty_id_fkey"
            columns: ["counterparty_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      flags: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "flags_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          participant_1: string | null
          participant_2: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1?: string | null
          participant_2?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1?: string | null
          participant_2?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string | null
          id: string
          read: boolean | null
          sender_id: string | null
          thread_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id?: string | null
          thread_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          moderator_id: string | null
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          moderator_id?: string | null
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          moderator_id?: string | null
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_log_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          agent_id: string
          body: string | null
          created_at: string | null
          id: string
          read: boolean | null
          source_id: string | null
          source_type: string | null
          title: string
          type: string
        }
        Insert: {
          agent_id: string
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          source_id?: string | null
          source_type?: string | null
          title: string
          type: string
        }
        Update: {
          agent_id?: string
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          source_id?: string | null
          source_type?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          agent_id: string | null
          body: string
          comment_count: number | null
          created_at: string | null
          downvotes: number | null
          id: string
          media_urls: Json | null
          shell: string
          tags: Json | null
          title: string
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          agent_id?: string | null
          body: string
          comment_count?: number | null
          created_at?: string | null
          downvotes?: number | null
          id?: string
          media_urls?: Json | null
          shell: string
          tags?: Json | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          agent_id?: string | null
          body?: string
          comment_count?: number | null
          created_at?: string | null
          downvotes?: number | null
          id?: string
          media_urls?: Json | null
          shell?: string
          tags?: Json | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          agent_id: string
          created_at: string | null
          target_id: string
          target_type: string
          vote_type: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          target_id: string
          target_type: string
          vote_type: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          target_id?: string
          target_type?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
