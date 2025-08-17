"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlatformHealthCheck } from "@/components/admin/platform-health-check"
import { Car, Users, ImageIcon, TrendingUp, Target, CheckCircle, Plus, Upload, Globe } from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"

interface ContentStats {
  cars: {
    total: number
    withImages: number
    withoutImages: number
    inStock: number
  }
  founders: {
    total: number
    withImages: number
    withoutImages: number
  }
  images: {
    total: number
    carImages: number
    founderImages: number
  }
}

function AdminContentContent() {
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContentStats()
  }, [])

  const fetchContentStats = async () => {
    try {
      setLoading(true)

      // Get cars data
      const { data: cars, error: carsError } = await supabase.from("cars").select("id, image_url, stock_quantity")

      if (carsError) throw carsError

      // Get founders data
      const { data: founders, error: foundersError } = await supabase.from("founders").select("id, image_path")

      if (foundersError) throw foundersError

      // Calculate stats
      const carsWithImages = cars?.filter((car) => car.image_url && car.image_url.trim() !== "").length || 0
      const carsInStock = cars?.filter((car) => car.stock_quantity > 0).length || 0
      const foundersWithImages =
        founders?.filter((founder) => founder.image_path && founder.image_path.trim() !== "").length || 0

      setStats({
        cars: {
          total: cars?.length || 0,
          withImages: carsWithImages,
          withoutImages: (cars?.length || 0) - carsWithImages,
          inStock: carsInStock,
        },
        founders: {
          total: founders?.length || 0,
          withImages: foundersWithImages,
          withoutImages: (founders?.length || 0) - foundersWithImages,
        },
        images: {
          total: carsWithImages + foundersWithImages,
          carImages: carsWithImages,
          founderImages: foundersWithImages,
        },
      })
    } catch (error: any) {
      console.error("Error fetching content stats:", error)
      toast.error("Failed to load content statistics")
    } finally {
      setLoading(false)
    }
  }

  const getCompletionPercentage = () => {
    if (!stats) return 0

    const totalItems = stats.cars.total + stats.founders.total
    const completedItems = stats.cars.withImages + stats.founders.withImages

    if (totalItems === 0) return 0
    return Math.round((completedItems / totalItems) * 100)
  }

  const getReadinessScore = () => {
    if (!stats) return 0

    let score = 0

    // Cars content (40% of score)
    if (stats.cars.total >= 5) score += 20
    if (stats.cars.withImages >= stats.cars.total * 0.8) score += 20

    // Founders content (30% of score)
    if (stats.founders.total >= 2) score += 15
    if (stats.founders.withImages >= stats.founders.total * 0.8) score += 15

    // Stock availability (20% of score)
    if (stats.cars.inStock >= stats.cars.total * 0.7) score += 20

    // Image quality (10% of score)
    if (stats.images.total >= 10) score += 10

    return Math.min(score, 100)
  }

  const contentTasks = [
    {
      title: "Add Car Inventory",
      description: "Upload at least 10 cars with high-quality images",
      completed: stats ? stats.cars.total >= 10 : false,
      progress: stats ? Math.min((stats.cars.total / 10) * 100, 100) : 0,
      action: "/admin/cars",
      icon: Car,
    },
    {
      title: "Upload Car Images",
      description: "Ensure all cars have professional photos",
      completed: stats ? stats.cars.withoutImages === 0 && stats.cars.total > 0 : false,
      progress: stats && stats.cars.total > 0 ? (stats.cars.withImages / stats.cars.total) * 100 : 0,
      action: "/admin/cars",
      icon: ImageIcon,
    },
    {
      title: "Add Founder Profiles",
      description: "Create profiles for your team members",
      completed: stats ? stats.founders.total >= 3 : false,
      progress: stats ? Math.min((stats.founders.total / 3) * 100, 100) : 0,
      action: "/admin/founders",
      icon: Users,
    },
    {
      title: "Founder Photos",
      description: "Add professional headshots for all founders",
      completed: stats ? stats.founders.withoutImages === 0 && stats.founders.total > 0 : false,
      progress: stats && stats.founders.total > 0 ? (stats.founders.withImages / stats.founders.total) * 100 : 0,
      action: "/admin/founders",
      icon: Upload,
    },
  ]

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading content dashboard...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
                  <p className="text-gray-600 mt-2">Manage your platform content and monitor readiness</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={fetchContentStats} variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Refresh Stats
                  </Button>
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Content Tasks</TabsTrigger>
                <TabsTrigger value="health">System Health</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Readiness Score */}
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Target className="h-5 w-5" />
                      Launch Readiness Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-bold text-blue-900">{getReadinessScore()}%</span>
                      <Badge
                        variant={getReadinessScore() >= 80 ? "default" : "secondary"}
                        className="text-lg px-3 py-1"
                      >
                        {getReadinessScore() >= 80 ? "Ready to Launch!" : "In Progress"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700">{stats?.cars.total || 0}</div>
                        <div className="text-blue-600">Cars Listed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700">{stats?.cars.withImages || 0}</div>
                        <div className="text-blue-600">With Images</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700">{stats?.founders.total || 0}</div>
                        <div className="text-blue-600">Team Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700">{stats?.images.total || 0}</div>
                        <div className="text-blue-600">Total Images</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Car Inventory</CardTitle>
                      <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.cars.total || 0}</div>
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-xs">
                          <span>With Images:</span>
                          <Badge variant="outline">{stats?.cars.withImages || 0}</Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Need Images:</span>
                          <Badge variant={stats?.cars.withoutImages === 0 ? "default" : "destructive"}>
                            {stats?.cars.withoutImages || 0}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>In Stock:</span>
                          <Badge variant="outline">{stats?.cars.inStock || 0}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Team Profiles</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.founders.total || 0}</div>
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-xs">
                          <span>With Photos:</span>
                          <Badge variant="outline">{stats?.founders.withImages || 0}</Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Need Photos:</span>
                          <Badge variant={stats?.founders.withoutImages === 0 ? "default" : "destructive"}>
                            {stats?.founders.withoutImages || 0}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Media Assets</CardTitle>
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.images.total || 0}</div>
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-xs">
                          <span>Car Images:</span>
                          <Badge variant="outline">{stats?.images.carImages || 0}</Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Team Photos:</span>
                          <Badge variant="outline">{stats?.images.founderImages || 0}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Link href="/admin/cars">
                        <Button className="w-full bg-transparent" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Cars
                        </Button>
                      </Link>
                      <Link href="/admin/founders">
                        <Button className="w-full bg-transparent" variant="outline">
                          <Users className="h-4 w-4 mr-2" />
                          Add Team
                        </Button>
                      </Link>
                      <Link href="/" target="_blank">
                        <Button className="w-full bg-transparent" variant="outline">
                          <Globe className="h-4 w-4 mr-2" />
                          View Site
                        </Button>
                      </Link>
                      <Link href="/about" target="_blank">
                        <Button className="w-full bg-transparent" variant="outline">
                          <Users className="h-4 w-4 mr-2" />
                          View About
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-6">
                <div className="grid gap-4">
                  {contentTasks.map((task, index) => (
                    <Card
                      key={index}
                      className={`border-2 ${task.completed ? "border-green-200 bg-green-50" : "border-gray-200"}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${task.completed ? "bg-green-100" : "bg-gray-100"}`}>
                              <task.icon className={`h-5 w-5 ${task.completed ? "text-green-600" : "text-gray-600"}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{task.title}</h3>
                                {task.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${task.completed ? "bg-green-500" : "bg-blue-500"}`}
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{Math.round(task.progress)}% Complete</span>
                                <span>{task.completed ? "Completed" : "In Progress"}</span>
                              </div>
                            </div>
                          </div>
                          <Link href={task.action}>
                            <Button size="sm" variant={task.completed ? "outline" : "default"}>
                              {task.completed ? "Manage" : "Complete"}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="health" className="space-y-6">
                <PlatformHealthCheck />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminContent() {
  return (
    <AdminGuard>
      <AdminContentContent />
    </AdminGuard>
  )
}
