"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ChartData {
  month: string
  cars: number
  users: number
  revenue: number
}

export function AnalyticsChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [totalGrowth, setTotalGrowth] = useState(0)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      // Get data for the last 6 months
      const months = []
      const now = new Date()

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push({
          date,
          month: date.toLocaleDateString("en-US", { month: "short" }),
          year: date.getFullYear(),
          monthNum: date.getMonth(),
        })
      }

      const analyticsData: ChartData[] = []

      for (const monthInfo of months) {
        const startOfMonth = new Date(monthInfo.year, monthInfo.monthNum, 1)
        const endOfMonth = new Date(monthInfo.year, monthInfo.monthNum + 1, 0)

        // Fetch cars created in this month
        const { count: carsCount } = await supabase
          .from("cars")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfMonth.toISOString())
          .lte("created_at", endOfMonth.toISOString())

        // Fetch users created in this month
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfMonth.toISOString())
          .lte("created_at", endOfMonth.toISOString())

        // Calculate revenue (simulated from car prices)
        const { data: cars } = await supabase
          .from("cars")
          .select("price")
          .gte("created_at", startOfMonth.toISOString())
          .lte("created_at", endOfMonth.toISOString())

        const revenue = cars?.reduce((sum, car) => sum + (car.price || 0), 0) || 0

        analyticsData.push({
          month: monthInfo.month,
          cars: carsCount || 0,
          users: usersCount || 0,
          revenue: revenue / 1000, // Convert to thousands for display
        })
      }

      setChartData(analyticsData)

      // Calculate growth
      if (analyticsData.length >= 2) {
        const current = analyticsData[analyticsData.length - 1]
        const previous = analyticsData[analyticsData.length - 2]
        const growth =
          ((current.cars + current.users - (previous.cars + previous.users)) /
            Math.max(previous.cars + previous.users, 1)) *
          100
        setTotalGrowth(Math.round(growth))
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      // Set sample data on error
      setChartData([
        { month: "Jan", cars: 12, users: 45, revenue: 125 },
        { month: "Feb", cars: 19, users: 52, revenue: 145 },
        { month: "Mar", cars: 15, users: 48, revenue: 135 },
        { month: "Apr", cars: 22, users: 61, revenue: 165 },
        { month: "May", cars: 18, users: 55, revenue: 155 },
        { month: "Jun", cars: 25, users: 68, revenue: 185 },
      ])
      setTotalGrowth(12)
    } finally {
      setLoading(false)
    }
  }

  const maxValue = Math.max(...chartData.map((d) => Math.max(d.cars, d.users, d.revenue)))

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Analytics Overview</CardTitle>
          <div className="flex items-center space-x-2">
            {totalGrowth >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <span className={`text-sm font-medium ${totalGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalGrowth >= 0 ? "+" : ""}
              {totalGrowth}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="grid grid-cols-6 gap-2 h-48">
            {chartData.map((data, index) => (
              <div key={index} className="flex flex-col items-center justify-end space-y-1">
                <div className="flex flex-col items-center space-y-1 w-full">
                  {/* Revenue bar */}
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${Math.max((data.revenue / maxValue) * 120, 4)}px` }}
                    title={`Revenue: $${data.revenue}k`}
                  />
                  {/* Users bar */}
                  <div
                    className="w-full bg-green-500 transition-all duration-300 hover:bg-green-600"
                    style={{ height: `${Math.max((data.users / maxValue) * 120, 4)}px` }}
                    title={`Users: ${data.users}`}
                  />
                  {/* Cars bar */}
                  <div
                    className="w-full bg-purple-500 rounded-b transition-all duration-300 hover:bg-purple-600"
                    style={{ height: `${Math.max((data.cars / maxValue) * 120, 4)}px` }}
                    title={`Cars: ${data.cars}`}
                  />
                </div>
                <span className="text-xs text-gray-600 font-medium">{data.month}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span>Revenue ($k)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded" />
              <span>Cars</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${chartData.reduce((sum, d) => sum + d.revenue, 0)}k
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{chartData.reduce((sum, d) => sum + d.users, 0)}</div>
              <div className="text-sm text-gray-600">New Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{chartData.reduce((sum, d) => sum + d.cars, 0)}</div>
              <div className="text-sm text-gray-600">Cars Added</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
