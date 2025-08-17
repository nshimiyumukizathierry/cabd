"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, RefreshCw, Download, Settings, BarChart } from "lucide-react"
import Link from "next/link"

interface QuickActionsProps {
  onRefresh: () => void
}

export function QuickActions({ onRefresh }: QuickActionsProps) {
  const actions = [
    {
      title: "Add New Car",
      description: "Add a new vehicle to inventory",
      icon: Plus,
      href: "/admin/cars/new",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "View Analytics",
      description: "Check detailed reports",
      icon: BarChart,
      href: "/admin/analytics",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Export Data",
      description: "Download reports",
      icon: Download,
      onClick: () => console.log("Export data"),
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "System Settings",
      description: "Configure platform",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-gray-600 hover:bg-gray-700",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quick Actions</CardTitle>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <div key={index}>
            {action.href ? (
              <Link href={action.href}>
                <Button className={`w-full justify-start text-white ${action.color}`} variant="default">
                  <action.icon className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              </Link>
            ) : (
              <Button
                onClick={action.onClick}
                className={`w-full justify-start text-white ${action.color}`}
                variant="default"
              >
                <action.icon className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
