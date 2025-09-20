export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
type Priority = 'low' | 'medium' | 'high'

export interface Database {
  public: {
    Tables: {
      issues: {
        Row: {
          id: string
          created_at: string
          updated_at?: string
          title: string
          description: string
          status: IssueStatus
          priority: Priority
          category: string
          user_id: string
          image_url: string | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          status?: IssueStatus
          priority?: Priority
          category: string
          user_id: string
          image_url?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          status?: IssueStatus
          priority?: Priority
          category?: string
          user_id?: string
          image_url?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          full_name: string | null
          email: string | null
          role: 'citizen' | 'admin'
        }
        Insert: {
          id: string
          updated_at?: string | null
          full_name?: string | null
          email?: string | null
          role?: 'citizen' | 'admin'
        }
        Update: {
          id?: string
          updated_at?: string | null
          full_name?: string | null
          email?: string | null
          role?: 'citizen' | 'admin'
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
