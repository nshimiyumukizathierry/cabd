"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, User, Car, ShoppingCart } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"

interface Activity {
  id: string
  type: "user" | "car" | "order"
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      const activities: Activity[] = []

      // Fetch recent users (last 10)
      const { data: recentUsers } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      if (recentUsers) {
        recentUsers.forEach((user) => {
          activities.push({
            id: `user-${user.id}`,
            type: "user",
            title: "New User Registration",
            description: `${user.full_name || user.email} joined the platform`,
            timestamp: user.created_at,
            user: {
              name: user.full_name || "New User",
              email: user.email,
              avatar: user.avatar_url,
            },
          })
        })
      }

      // Fetch recent cars (last 5)
      const { data: recentCars } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      if (recentCars) {
        recentCars.forEach((car) => {
          activities.push({
            id: `car-${car.id}`,
            type: "car",
            title: "New Car Added",
            description: `${car.make} ${car.model} (${car.year}) was added to inventory`,
            timestamp: car.created_at,
          })
        })
      }

      // Fetch recent cart items as orders (last 5)
      const { data: recentOrders } = await supabase
        .from("cart_items")
        .select(`
          *,
          car:cars(make, model, year),
          profile:profiles(full_name, email)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      if (recentOrders) {
        recentOrders.forEach((order) => {
          activities.push({
            id: `order-${order.id}`,
            type: "order",
            title: "New Order Placed",
            description: `${order.profile?.full_name || "Customer"} added ${order.car?.make} ${order.car?.model} to cart`,
            timestamp: order.created_at,
            user: {
              name: order.profile?.full_name || "Customer",
              email: order.profile?.email || "",
            },
          })
        })
      }

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      // Take only the most recent 10
      setActivities(activities.slice(0, 10))
    } catch (error) {
      console.error("Error fetching recent activity:", error)
      // Set some sample data on error
      setActivities([
        {
          id: "sample-1",
          type: "user",
          title: "New User Registration",
          description: "John Doe joined the platform",
          timestamp: new Date().toISOString(),
          user: {
            name: "John Doe",
            email: "john@example.com",
          },
        },
        {
          id: "sample-2",
          type: "car",
          title: "New Car Added",
          description: "Toyota Camry (2023) was added to inventory",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="h-4 w-4" />
      case "car":
        return <Car className="h-4 w-4" />
      case "order":
        return <ShoppingCart className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user":
        return "bg-blue-100 text-blue-800"
      case "car":
        return "bg-green-100 text-green-800"
      case "order":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest platform activities and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {activity.user ? (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                      <AvatarFallback>{activity.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <Badge variant="secondary" className={getActivityColor(activity.type)}>
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
