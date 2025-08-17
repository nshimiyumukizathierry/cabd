"use client"

import { Button } from "@/components/ui/button"
import { Bell, Settings, User } from "lucide-react"
import { useAdminAuth } from "./admin-auth-provider"

export function AdminHeader() {
  const { logout } = useAdminAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
