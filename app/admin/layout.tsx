"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { AdminAuthProvider } from "@/components/admin/admin-auth-provider"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't wrap login page with auth provider
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return <AdminAuthProvider>{children}</AdminAuthProvider>
}
