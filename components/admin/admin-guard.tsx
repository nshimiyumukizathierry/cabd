"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
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
          // Session expired
          localStorage.removeItem("admin_authenticated")
          localStorage.removeItem("admin_auth_time")
          router.push("/admin/login")
        }
      } else {
        router.push("/admin/login")
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
