import { createClient } from "@supabase/supabase-js"

export type Database = {
  public: {
    Tables: {
      cars: {
        Row: {
          id: string
          make: string
          model: string
          year: number
          price: number
          stock_quantity: number
          image_url: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          make: string
          model: string
          year: number
          price: number
          stock_quantity?: number
          image_url?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          make?: string
          model?: string
          year?: number
          price?: number
          stock_quantity?: number
          image_url?: string | null
          description?: string | null
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: "user" | "admin"
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "user" | "admin"
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "user" | "admin"
          phone?: string | null
          updated_at?: string
        }
      }
      founders: {
        Row: {
          id: string
          name: string
          position: string
          bio: string
          email: string
          phone: string
          image_path: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          position: string
          bio?: string
          email?: string
          phone?: string
          image_path?: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          position?: string
          bio?: string
          email?: string
          phone?: string
          image_path?: string
          display_order?: number
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          car_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          car_id: string
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          car_id?: string
          quantity?: number
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          car_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          car_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          car_id?: string
        }
      }
    }
  }
}

// Supabase configuration
const supabaseUrl = "https://mjnfcixxdofwtshzrpon.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qbmZjaXh4ZG9md3RzaHpycG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTI2MjUsImV4cCI6MjA3MDQ2ODYyNX0.p7UF_d_JGZ5PhVNWYlc73Q3ZGNOpQ5d8iuyOVMgRfVI"

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Export configuration status
export const isSupabaseConfigured = true

console.log("✅ Supabase client initialized successfully with your credentials")
