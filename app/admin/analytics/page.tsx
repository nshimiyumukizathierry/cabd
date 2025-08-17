"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Users, Car, ShoppingCart } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"

interface AnalyticsData {
  month: string
  cars_sold: number
  users_registered: number
  revenue: number
}

interface MetricCard {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  color: string
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      // Fetch analytics data
      const { data: analytics, error: analyticsError } = await supabase
        .from("analytics")
        .select("*")
        .order("date", { ascending: true })

      if (analyticsError) throw analyticsError

      // Process data by month
      const monthlyData: { [key: string]: AnalyticsData } = {}

      analytics?.forEach((item) => {
        const month = new Date(item.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })

        if (!monthlyData[month]) {
          monthlyData[month] = {
            month,
            cars_sold: 0,
            users_registered: 0,
            revenue: 0,
          }
        }

        monthlyData[month][item.metric_name as keyof Omit<AnalyticsData, "month">] = Number(item.metric_value)
      })

      const chartData = Object.values(monthlyData)
      setAnalyticsData(chartData)

      // Calculate metrics
      const totalCars = chartData.reduce((sum, item) => sum + item.cars_sold, 0)
      const totalUsers = chartData.reduce((sum, item) => sum + item.users_registered, 0)
      const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)

      // Calculate growth (comparing last two months)
      const lastMonth = chartData[chartData.length - 1]
      const previousMonth = chartData[chartData.length - 2]

      const carsGrowth = previousMonth
        ? ((lastMonth.cars_sold - previousMonth.cars_sold) / previousMonth.cars_sold) * 100
        : 0
      const usersGrowth = previousMonth
        ? ((lastMonth.users_registered - previousMonth.users_registered) / previousMonth.users_registered) * 100
        : 0
      const revenueGrowth = previousMonth
        ? ((lastMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
        : 0

      // Get current stats from database
      const { data: carsCount } = await supabase.from("cars").select("id", { count: "exact" })

      setMetrics([
        {
          title: "Total Revenue",
          value: formatCurrency(totalRevenue),
          change: revenueGrowth,
          icon: <DollarSign className="h-4 w-4" />,
          color: "text-green-600",
        },
        {
          title: "Cars Sold",
          value: formatNumber(totalCars),
          change: carsGrowth,
          icon: <Car className="h-4 w-4" />,
          color: "text-blue-600",
        },
        {
          title: "New Users",
          value: formatNumber(totalUsers),
          change: usersGrowth,
          icon: <Users className="h-4 w-4" />,
          color: "text-purple-600",
        },
        {
          title: "Total Cars",
          value: formatNumber(carsCount?.count || 0),
          change: 5.2,
          icon: <ShoppingCart className="h-4 w-4" />,
          color: "text-orange-600",
        },
      ])
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600">Track your business performance and growth</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={metric.color}>{metric.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {metric.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                <span className={metric.change >= 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(metric.change).toFixed(1)}%
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cars Sold Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                cars_sold: {
                  label: "Cars Sold",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="cars_sold" fill="var(--color-cars_sold)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="font-semibold">12.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Order Value</span>
              <span className="font-semibold">$28,500</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customer Satisfaction</span>
              <span className="font-semibold">4.8/5</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Models</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tesla Model S</span>
              <span className="font-semibold">15 sold</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">BMW X5</span>
              <span className="font-semibold">12 sold</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mercedes C-Class</span>
              <span className="font-semibold">10 sold</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly Growth</span>
              <span className="font-semibold text-green-600">+18.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">User Retention</span>
              <span className="font-semibold text-blue-600">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Market Share</span>
              <span className="font-semibold text-purple-600">12.8%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
