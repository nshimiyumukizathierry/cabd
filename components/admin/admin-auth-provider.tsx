"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface AdminAuthContextType {
  isAuthenticated: boolean
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") return

      const authenticated = localStorage.getItem("admin_authenticated")
      const authTime = localStorage.getItem("admin_auth_time")

      if (authenticated && authTime) {
        const now = new Date().getTime()
        const authTimestamp = Number.parseInt(authTime)
        const twentyFourHours = 24 * 60 * 60 * 1000

        if (now - authTimestamp < twentyFourHours) {
          setIsAuthenticated(true)
        } else {
          logout()
        }
      }
    }

    checkAuth()
  }, [])

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_authenticated")
      localStorage.removeItem("admin_auth_time")
    }
    setIsAuthenticated(false)
    router.push("/admin/login")
  }

  return <AdminAuthContext.Provider value={{ isAuthenticated, logout }}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
