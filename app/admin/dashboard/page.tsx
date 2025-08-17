"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { RecentActivity } from "@/components/admin/recent-activity"
import { QuickActions } from "@/components/admin/quick-actions"
import { AnalyticsChart } from "@/components/admin/analytics-chart"
import { RealTimeNotifications } from "@/components/admin/real-time-notifications"

function AdminDashboardContent() {
  const [stats, setStats] = useState({
    totalCars: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockCars: 0,
    activeUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch cars data
      const { data: cars, count: carsCount } = await supabase.from("cars").select("*", { count: "exact" })

      // Fetch users data
      const { data: users, count: usersCount } = await supabase.from("profiles").select("*", { count: "exact" })

      // Fetch cart items for orders simulation
      const { data: cartItems, count: cartCount } = await supabase
        .from("cart_items")
        .select("*, car:cars(price)", { count: "exact" })

      // Calculate revenue from cart items (simulating orders)
      const revenue =
        cartItems?.reduce((total, item) => {
          return total + (item.car?.price || 0) * item.quantity
        }, 0) || 0

      // Count low stock cars (less than 3 in stock)
      const lowStock = cars?.filter((car) => car.stock_quantity < 3).length || 0

      // Count active users (created in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const activeUsers = users?.filter((user) => new Date(user.created_at) > thirtyDaysAgo).length || 0

      setStats({
        totalCars: carsCount || 0,
        totalUsers: usersCount || 0,
        totalOrders: cartCount || 0,
        totalRevenue: revenue,
        lowStockCars: lowStock,
        activeUsers: activeUsers,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Set default values on error
      setStats({
        totalCars: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        lowStockCars: 0,
        activeUsers: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600 mt-2">Welcome to your admin control panel</p>
            </div>

            <DashboardStats stats={stats} loading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <div className="lg:col-span-2">
                <AnalyticsChart />
              </div>
              <div>
                <QuickActions onRefresh={fetchDashboardData} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <RecentActivity />
              <RealTimeNotifications />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  )
}
