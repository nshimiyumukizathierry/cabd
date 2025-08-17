"use client"

import { useEffect, useState } from "react"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Database,
  Shield,
  HardDrive,
  Activity,
  Users,
  Car,
  ImageIcon,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { storageService } from "@/lib/storage"
import toast from "react-hot-toast"

interface SystemHealth {
  database: {
    status: "healthy" | "warning" | "error"
    message: string
    details: string[]
  }
  authentication: {
    status: "healthy" | "warning" | "error"
    message: string
    details: string[]
  }
  storage: {
    status: "healthy" | "warning" | "error"
    message: string
    details: string[]
  }
  overall: {
    score: number
    status: "healthy" | "warning" | "error"
  }
}

interface SystemStats {
  totalUsers: number
  totalCars: number
  totalFounders: number
  storageUsed: string
}

function AdminSystemContent() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    checkSystemHealth()
    fetchSystemStats()
  }, [])

  const checkSystemHealth = async () => {
    setLoading(true)
    try {
      const healthCheck: SystemHealth = {
        database: { status: "healthy", message: "", details: [] },
        authentication: { status: "healthy", message: "", details: [] },
        storage: { status: "healthy", message: "", details: [] },
        overall: { score: 0, status: "healthy" },
      }

      // Check database connection
      try {
        const { data, error } = await supabase.from("cars").select("count", { count: "exact", head: true })
        if (error) {
          if (error.message.includes("not configured")) {
            healthCheck.database.status = "warning"
            healthCheck.database.message = "Database not configured"
            healthCheck.database.details = ["Supabase environment variables missing", "Using mock data"]
          } else {
            healthCheck.database.status = "error"
            healthCheck.database.message = "Database connection failed"
            healthCheck.database.details = [error.message]
          }
        } else {
          healthCheck.database.status = "healthy"
          healthCheck.database.message = "Database connection successful"
          healthCheck.database.details = [`Found ${data?.length || 0} records`]
        }
      } catch (err: any) {
        healthCheck.database.status = "error"
        healthCheck.database.message = "Database check failed"
        healthCheck.database.details = [err.message]
      }

      // Check authentication
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          if (error.message.includes("not configured")) {
            healthCheck.authentication.status = "warning"
            healthCheck.authentication.message = "Authentication not configured"
            healthCheck.authentication.details = ["Supabase auth not available", "Admin login may not work"]
          } else {
            healthCheck.authentication.status = "error"
            healthCheck.authentication.message = "Authentication check failed"
            healthCheck.authentication.details = [error.message]
          }
        } else {
          healthCheck.authentication.status = "healthy"
          healthCheck.authentication.message = "Authentication system operational"
          healthCheck.authentication.details = [session ? "User session active" : "No active session"]
        }
      } catch (err: any) {
        healthCheck.authentication.status = "error"
        healthCheck.authentication.message = "Authentication check failed"
        healthCheck.authentication.details = [err.message]
      }

      // Check storage
      try {
        const storageTest = await storageService.testStorageConnection()
        if (storageTest.success) {
          healthCheck.storage.status = "healthy"
          healthCheck.storage.message = "Storage system operational"
          healthCheck.storage.details = [storageTest.message]
        } else {
          healthCheck.storage.status = "warning"
          healthCheck.storage.message = "Storage issues detected"
          healthCheck.storage.details = [storageTest.message]
        }
      } catch (err: any) {
        healthCheck.storage.status = "error"
        healthCheck.storage.message = "Storage check failed"
        healthCheck.storage.details = [err.message]
      }

      // Calculate overall health score
      let score = 0
      const systems = [healthCheck.database, healthCheck.authentication, healthCheck.storage]
      systems.forEach((system) => {
        if (system.status === "healthy") score += 33.33
        else if (system.status === "warning") score += 16.67
      })

      healthCheck.overall.score = Math.round(score)
      if (score >= 80) healthCheck.overall.status = "healthy"
      else if (score >= 50) healthCheck.overall.status = "warning"
      else healthCheck.overall.status = "error"

      setHealth(healthCheck)
    } catch (error: any) {
      console.error("System health check failed:", error)
      toast.error("Failed to check system health")
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemStats = async () => {
    try {
      const statsData: SystemStats = {
        totalUsers: 0,
        totalCars: 0,
        totalFounders: 0,
        storageUsed: "0 MB",
      }

      // Get user count
      try {
        const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })
        statsData.totalUsers = userCount || 0
      } catch (err) {
        console.log("Could not fetch user count:", err)
      }

      // Get car count
      try {
        const { count: carCount } = await supabase.from("cars").select("*", { count: "exact", head: true })
        statsData.totalCars = carCount || 0
      } catch (err) {
        console.log("Could not fetch car count:", err)
      }

      // Get founder count
      try {
        const { count: founderCount } = await supabase.from("founders").select("*", { count: "exact", head: true })
        statsData.totalFounders = founderCount || 0
      } catch (err) {
        console.log("Could not fetch founder count:", err)
      }

      setStats(statsData)
    } catch (error: any) {
      console.error("Failed to fetch system stats:", error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([checkSystemHealth(), fetchSystemStats()])
    setRefreshing(false)
    toast.success("System status refreshed")
  }

  const getStatusIcon = (status: "healthy" | "warning" | "error") => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusColor = (status: "healthy" | "warning" | "error") => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "error":
        return "text-red-600 bg-red-50 border-red-200"
    }
  }

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
                <p className="text-gray-600">Checking system health...</p>
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
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Activity className="h-8 w-8 text-blue-600" />
                  System Health
                </h1>
                <p className="text-gray-600 mt-2">Monitor system status and performance</p>
              </div>
              <Button onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Overall Health Score */}
            {health && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(health.overall.status)}
                    Overall System Health
                  </CardTitle>
                  <CardDescription>
                    System health score based on database, authentication, and storage status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{health.overall.score}%</span>
                      <Badge className={getStatusColor(health.overall.status)}>
                        {health.overall.status.toUpperCase()}
                      </Badge>
                    </div>
                    <Progress value={health.overall.score} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Components */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="database">Database</TabsTrigger>
                <TabsTrigger value="auth">Authentication</TabsTrigger>
                <TabsTrigger value="storage">Storage</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {health && (
                    <>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Database</CardTitle>
                          <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(health.database.status)}
                            <span className="text-sm">{health.database.message}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Authentication</CardTitle>
                          <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(health.authentication.status)}
                            <span className="text-sm">{health.authentication.message}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Storage</CardTitle>
                          <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(health.storage.status)}
                            <span className="text-sm">{health.storage.message}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="database" className="space-y-4">
                {health && (
                  <Alert className={getStatusColor(health.database.status)}>
                    <Database className="h-4 w-4" />
                    <AlertTitle>Database Status</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2">
                        <p className="font-medium">{health.database.message}</p>
                        <ul className="mt-2 list-disc list-inside text-sm">
                          {health.database.details.map((detail, index) => (
                            <li key={index}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="auth" className="space-y-4">
                {health && (
                  <Alert className={getStatusColor(health.authentication.status)}>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Authentication Status</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2">
                        <p className="font-medium">{health.authentication.message}</p>
                        <ul className="mt-2 list-disc list-inside text-sm">
                          {health.authentication.details.map((detail, index) => (
                            <li key={index}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="storage" className="space-y-4">
                {health && (
                  <Alert className={getStatusColor(health.storage.status)}>
                    <HardDrive className="h-4 w-4" />
                    <AlertTitle>Storage Status</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2">
                        <p className="font-medium">{health.storage.message}</p>
                        <ul className="mt-2 list-disc list-inside text-sm">
                          {health.storage.details.map((detail, index) => (
                            <li key={index}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                {stats && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCars}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Founders</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalFounders}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.storageUsed}</div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminSystem() {
  return (
    <AdminGuard>
      <AdminSystemContent />
    </AdminGuard>
  )
}
