"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"

const ADMIN_PASSWORD = "Thierry054#"

export default function AdminLogin() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)

    // Check if already authenticated
    if (typeof window !== "undefined") {
      const isAuthenticated = localStorage.getItem("admin_authenticated")
      const authTime = localStorage.getItem("admin_auth_time")

      if (isAuthenticated && authTime) {
        const now = new Date().getTime()
        const authTimestamp = Number.parseInt(authTime)
        const twentyFourHours = 24 * 60 * 60 * 1000

        if (now - authTimestamp < twentyFourHours) {
          router.push("/admin/dashboard")
          return
        } else {
          // Session expired
          localStorage.removeItem("admin_authenticated")
          localStorage.removeItem("admin_auth_time")
        }
      }
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (password === ADMIN_PASSWORD) {
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_authenticated", "true")
          localStorage.setItem("admin_auth_time", new Date().getTime().toString())
        }

        toast.success("Welcome to admin dashboard!")
        router.push("/admin/dashboard")
      } else {
        toast.error("Invalid password")
      }
    } catch (error) {
      toast.error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Access</h2>
          <p className="mt-2 text-sm text-gray-600">System Administrators: Thierry • Jassir • Sadman</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Enter Admin Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
