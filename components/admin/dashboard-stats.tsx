"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, ShoppingCart, DollarSign, AlertTriangle, UserCheck } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface DashboardStatsProps {
  stats: {
    totalCars: number
    totalUsers: number
    totalOrders: number
    totalRevenue: number
    lowStockCars: number
    activeUsers: number
  }
  loading: boolean
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Cars",
      value: stats.totalCars,
      icon: Car,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12%",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+8%",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+15%",
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      change: "+23%",
    },
    {
      title: "Low Stock Alert",
      value: stats.lowStockCars,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      change: stats.lowStockCars > 0 ? "Attention needed" : "All good",
    },
    {
      title: "Active Users (30d)",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      change: "+5%",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-20">
                <LoadingSpinner />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p
              className={`text-xs mt-1 ${
                stat.change.includes("+")
                  ? "text-green-600"
                  : stat.change.includes("Attention")
                    ? "text-red-600"
                    : "text-gray-500"
              }`}
            >
              {stat.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
