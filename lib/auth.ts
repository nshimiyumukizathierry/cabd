import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface Profile {
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

export async function signUp(email: string, password: string, fullName?: string) {
  try {
    console.log("Starting sign up process for:", email)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      console.error("Sign up error:", error)
      throw error
    }

    console.log("Sign up successful:", data.user?.id)
    return data
  } catch (error) {
    console.error("Sign up process failed:", error)
    throw error
  }
}

export async function signIn(email: string, password: string) {
  try {
    console.log("Starting sign in process for:", email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Sign in error:", error)
      throw error
    }

    console.log("Sign in successful:", data.user?.id)
    return data
  } catch (error) {
    console.error("Sign in process failed:", error)
    throw error
  }
}

export async function signOut() {
  try {
    console.log("Starting sign out process...")

    // Clear any local storage or session data
    if (typeof window !== "undefined") {
      localStorage.removeItem("supabase.auth.token")
      sessionStorage.clear()
    }

    const { error } = await supabase.auth.signOut({
      scope: "global", // Sign out from all sessions
    })

    if (error) {
      console.error("Sign out error:", error)
      throw error
    }

    console.log("Sign out successful")

    // Force a page reload to clear any cached state
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  } catch (error) {
    console.error("Sign out process failed:", error)
    throw error
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Get current user error:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Get current user failed:", error)
    return null
  }
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    console.log("Fetching profile for user:", userId)

    // Use the regular client for user's own profile (this will work with RLS)
    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single()

    if (error) {
      console.error("Get user profile error:", error)
      return null
    }

    console.log("Profile fetched successfully:", data)
    return data
  } catch (error) {
    console.error("Get user profile failed:", error)
    return null
  }
}

export async function getAllUsers(): Promise<Profile[]> {
  try {
    console.log("Fetching all user profiles via API...")

    const response = await fetch("/api/admin/users")
    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }

    const { users } = await response.json()
    console.log("All users fetched successfully:", users?.length || 0)
    return users || []
  } catch (error) {
    console.error("Get all users failed:", error)
    throw error
  }
}

export async function updateUserRole(userId: string, role: "user" | "admin"): Promise<void> {
  try {
    console.log("Updating user role:", userId, "to", role)

    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    })

    if (!response.ok) {
      throw new Error("Failed to update user role")
    }

    console.log("User role updated successfully")
  } catch (error) {
    console.error("Update user role failed:", error)
    throw error
  }
}

export async function searchUsersByEmail(email: string): Promise<Profile[]> {
  try {
    console.log("Searching users by email:", email)

    const response = await fetch(`/api/admin/users?email=${encodeURIComponent(email)}`)
    if (!response.ok) {
      throw new Error("Failed to search users")
    }

    const { users } = await response.json()
    console.log("Users found:", users?.length || 0)
    return users || []
  } catch (error) {
    console.error("Search users by email failed:", error)
    throw error
  }
}

// Helper function to check if user is admin from JWT
export function isUserAdmin(user: User | null): boolean {
  if (!user) return false

  const role = user.app_metadata?.role || user.user_metadata?.role
  return role === "admin"
}

// Helper function to get user role from JWT
export function getUserRole(user: User | null): "user" | "admin" {
  if (!user) return "user"

  const role = user.app_metadata?.role || user.user_metadata?.role
  return role === "admin" ? "admin" : "user"
}
