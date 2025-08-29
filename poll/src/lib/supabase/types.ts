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
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      poll_bookmarks: {
        Row: {
          id: string
          user_id: string
          poll_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          poll_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          poll_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_bookmarks_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      poll_comments: {
        Row: {
          id: string
          poll_id: string
          user_id: string
          content: string
          parent_id: string | null
          created_at: string
          updated_at: string
          is_edited: boolean
        }
        Insert: {
          id?: string
          poll_id: string
          user_id: string
          content: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
          is_edited?: boolean
        }
        Update: {
          id?: string
          poll_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
          is_edited?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "poll_comments_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "poll_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      poll_options: {
        Row: {
          id: string
          poll_id: string
          text: string
          description: string | null
          image_url: string | null
          position: number
          vote_count: number
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          text: string
          description?: string | null
          image_url?: string | null
          position?: number
          vote_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          text?: string
          description?: string | null
          image_url?: string | null
          position?: number
          vote_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          }
        ]
      }
      polls: {
        Row: {
          id: string
          title: string
          description: string | null
          creator_id: string
          category_id: string | null
          status: "draft" | "active" | "closed" | "archived"
          vote_type: "single" | "multiple"
          allow_anonymous: boolean
          allow_multiple_votes: boolean
          expires_at: string | null
          created_at: string
          updated_at: string
          total_votes: number
          is_featured: boolean
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          creator_id: string
          category_id?: string | null
          status?: "draft" | "active" | "closed" | "archived"
          vote_type?: "single" | "multiple"
          allow_anonymous?: boolean
          allow_multiple_votes?: boolean
          expires_at?: string | null
          created_at?: string
          updated_at?: string
          total_votes?: number
          is_featured?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          creator_id?: string
          category_id?: string | null
          status?: "draft" | "active" | "closed" | "archived"
          vote_type?: "single" | "multiple"
          allow_anonymous?: boolean
          allow_multiple_votes?: boolean
          expires_at?: string | null
          created_at?: string
          updated_at?: string
          total_votes?: number
          is_featured?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "polls_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polls_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
          email_verified: boolean
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          email_verified?: boolean
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          email_verified?: boolean
          is_active?: boolean
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      votes: {
        Row: {
          id: string
          poll_id: string
          option_id: string
          user_id: string | null
          voter_ip: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_id: string
          user_id?: string | null
          voter_ip?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_id?: string
          user_id?: string | null
          voter_ip?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      poll_analytics: {
        Row: {
          id: string | null
          title: string | null
          creator_id: string | null
          category_id: string | null
          category_name: string | null
          status: "draft" | "active" | "closed" | "archived" | null
          created_at: string | null
          total_votes: number | null
          unique_voters: number | null
          comment_count: number | null
          creator_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polls_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polls_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_stats: {
        Row: {
          id: string | null
          full_name: string | null
          email: string | null
          created_at: string | null
          polls_created: number | null
          votes_cast: number | null
          bookmarks_count: number | null
          total_votes_received: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      poll_status: "draft" | "active" | "closed" | "archived"
      vote_choice: "single" | "multiple"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific entity types
export type Profile = Tables<'profiles'>
export type Poll = Tables<'polls'>
export type PollOption = Tables<'poll_options'>
export type Vote = Tables<'votes'>
export type Category = Tables<'categories'>
export type PollComment = Tables<'poll_comments'>
export type PollBookmark = Tables<'poll_bookmarks'>

// Extended types with relationships
export type PollWithDetails = Poll & {
  creator: Profile
  category: Category | null
  options: PollOption[]
  _count?: {
    votes: number
    comments: number
  }
}

export type PollOptionWithVotes = PollOption & {
  votes?: Vote[]
  hasUserVoted?: boolean
}

export type ProfileWithStats = Profile & {
  _count?: {
    polls: number
    votes: number
    followers: number
    following: number
  }
}