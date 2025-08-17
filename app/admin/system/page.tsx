"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/components/providers/auth-provider"
import { supabase } from "@/lib/supabase"
import { Database, Shield, Activity, CheckCircle, XCircle, HardDrive } from "lucide-react"

interface SystemStatus {
  database: "healthy" | "warning" | "error"
  auth: "healthy" | "warning" | "error"
  storage: "healthy" | "warning" | "error"
  overall: "healthy" | "warning" | "error"
}

interface SystemStats {
  totalUsers: number
  adminUsers: number
  totalCars: number
  systemUptime: string
}

export default function SystemPage() {
  const { isAdmin, user } = useAuth()
  const [status, setStatus] = useState<SystemStatus>({
    database: "healthy",
    auth: "healthy",
    storage: "healthy",
    overall: "healthy",
  })
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    adminUsers: 0,
    totalCars: 0,
    systemUptime: "Unknown",
  })
  const [loading, setLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  const checkSystemHealth = async () => {
    try {
      setLoading(true)
      const newStatus: SystemStatus = {
        database: "healthy",
        auth: "healthy",
        storage: "healthy",
        overall: "healthy",
      }

      // Check database connection
      try {
        const { error: dbError } = await supabase.from("profiles").select("count", { count: "exact" }).limit(1)
        if (dbError) {
          newStatus.database = "error"
        }
      } catch {
        newStatus.database = "error"
      }

      // Check auth system
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()
        if (!error) {
          newStatus.auth = "healthy"
          newStatus.auth.currentUser = !!session?.user
        }
      } catch {
        newStatus.auth = "error"
      }

      // Check storage system
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets()
        if (!error && buckets) {
          newStatus.storage.connected = true
          newStatus.storage.bucketsCount = buckets.length
        }
      } catch (error) {
        console.error("Storage check failed:", error)
      }

      // Calculate overall health score
      let score = 0
      if (systemStatus.database.connected) score += 40
      if (systemStatus.database.tables >= 3) score += 20
      if (systemStatus.auth.working) score += 20
      if (systemStatus.auth.currentUser) score += 10
      if (systemStatus.storage.connected) score += 10

      systemStatus.overall.score = score
      systemStatus.overall.status = score >= 90 ? "healthy" : score >= 60 ? "warning" : "error"

      setStatus(newStatus)

      // Get system stats
      try {
        const users = await getAllUsers()
        const adminCount = users.filter((u) => u.role === "admin").length

        const { count: carCount } = await supabase.from("cars").select("*", { count: "exact", head: true })

        setStats({
          totalUsers: users.length,
          adminUsers: adminCount,
          totalCars: carCount || 0,
          systemUptime: "Online",
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }

      setLastCheck(new Date())
    } catch (error) {
      console.error("System health check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSystemHealth()
    const interval = setInterval(checkSystemHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusIcon = (status: "healthy" | "warning" | "error") => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: "default",
      warning: "secondary",
      error: "destructive",
    } as const

    const colors = {
      healthy: "text-green-700",
      warning: "text-yellow-700",
      error: "text-red-700",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.toUpperCase()}
      </Badge>
    )
  

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            System Health
          </h1>
          <p className="text-muted-foreground">Monitor your CarBD platform status and performance</p>
        </div>
        <Button onClick={refreshStatus} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall System Health</span>
            {status && getStatusBadge(status.overall)}
          </CardTitle>
          <CardDescription>System health score based on database, authentication, and storage status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Health Score</span>
              <span className="text-2xl font-bold">{status?.overall.score || 0}%</span>
            </div>
            <Progress value={status?.overall.score || 0} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {status?.overall.status === "healthy" ? "✓" : status?.overall.status === "warning" ? "⚠" : "✗"}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{status?.database.usersCount || 0}</div>
                <div className="text-sm text-muted-foreground">Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{status?.database.carsCount || 0}</div>
                <div className="text-sm text-muted-foreground">Cars</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {status && getStatusIcon(status.database.connected)}
                  <span className="text-2xl font-bold">
                    {status?.database.connected ? "Connected" : "Disconnected"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{status?.database.tablesCount || 0} tables active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Authentication</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {status && getStatusIcon(status.auth.working)}
                  <span className="text-2xl font-bold">{status?.auth.working ? "Working" : "Error"}</span>
                </div>
                <p className="text-xs text-muted-foreground">{status?.auth.usersCount || 0} registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {status && getStatusIcon(status.storage.connected)}
                  <span className="text-2xl font-bold">{status?.storage.connected ? "Connected" : "Disconnected"}</span>
                </div>
                <p className="text-xs text-muted-foreground">{status?.storage.bucketsCount || 0} storage buckets</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Status
              </CardTitle>
              <CardDescription>PostgreSQL database connection and table information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Connection Status</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status?.database.connected || false)}
                  {getStatusBadge(status?.database.connected ? "healthy" : "error")}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Active Tables</span>
                <Badge variant="outline">{status?.database.tablesCount || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>User Profiles</span>
                <Badge variant="outline">{status?.database.usersCount || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Cars</span>
                <Badge variant="outline">{status?.database.carsCount || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Status
              </CardTitle>
              <CardDescription>User authentication and session management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Auth System</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status?.auth.working || false)}
                    {getStatusBadge(status?.auth.working ? "healthy" : "error")}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Registered Users</span>
                  <span className="font-mono">{status?.auth.usersCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Confirmed Users</span>
                  <span className="font-mono">{status?.auth.confirmedUsers || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="h-5 w-\
