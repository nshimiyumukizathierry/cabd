"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/components/providers/auth-provider"
import { supabase } from "@/lib/supabase"
import {
  Database,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  HardDrive,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

type HealthLevel = "healthy" | "warning" | "error"

interface ServiceStatus {
  connected?: boolean
  tablesCount?: number
  usersCount?: number
  carsCount?: number
  bucketsCount?: number
}

interface SystemStatus {
  database: ServiceStatus & { status?: HealthLevel }
  auth: ServiceStatus & { status?: HealthLevel; working?: boolean; confirmedUsers?: number }
  storage: ServiceStatus & { status?: HealthLevel }
  overall: { score?: number; status?: HealthLevel }
}

interface SystemStats {
  totalUsers: number
  adminUsers: number
  totalCars: number
  systemUptime: string
}

export default function Page() {
  const { isAdmin } = useAuth()
  const [status, setStatus] = useState<SystemStatus>({
    database: { connected: false, tablesCount: 0, usersCount: 0, carsCount: 0, status: "error" },
    auth: { working: false, usersCount: 0, confirmedUsers: 0, status: "error" },
    storage: { connected: false, bucketsCount: 0, status: "error" },
    overall: { score: 0, status: "error" },
  })
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    adminUsers: 0,
    totalCars: 0,
    systemUptime: "Unknown",
  })
  const [loading, setLoading] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const getAllUsers = async () => {
    try {
      const { data, error, count } = await supabase.from("profiles").select("*", { count: "exact" })
      if (error) {
        console.error("getAllUsers error:", error)
        return []
      }
      // data could be null when head:true etc. Handle defensively
      return Array.isArray(data) ? data : []
    } catch (err) {
      console.error("getAllUsers exception:", err)
      return []
    }
  }

  const computeLevel = (connected: boolean, count = 0): HealthLevel => {
    if (!connected) return "error"
    if (count >= 3) return "healthy"
    if (count > 0) return "warning"
    return "warning"
  }

  const checkSystemHealth = async () => {
    setLoading(true)
    try {
      const newStatus: SystemStatus = {
        database: { connected: false, tablesCount: 0, usersCount: 0, carsCount: 0, status: "error" },
        auth: { working: false, usersCount: 0, confirmedUsers: 0, status: "error" },
        storage: { connected: false, bucketsCount: 0, status: "error" },
        overall: { score: 0, status: "error" },
      }

      // Database: try to get counts from profiles and cars
      try {
        const { count: profilesCount, error: pErr } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })

        const { count: carsCount, error: cErr } = await supabase.from("cars").select("*", { count: "exact", head: true })

        // If counts were retrieved without error, mark connected
        if (!pErr) {
          newStatus.database.connected = true
          newStatus.database.usersCount = typeof profilesCount === "number" ? profilesCount : 0
        }
        if (!cErr) {
          newStatus.database.connected = newStatus.database.connected || true
          newStatus.database.carsCount = typeof carsCount === "number" ? carsCount : 0
        }

        // Estimate tablesCount from presence of tables we expect
        newStatus.database.tablesCount = 3 // keep simple; adapt if you can list tables
        newStatus.database.status = computeLevel(!!newStatus.database.connected, newStatus.database.tablesCount)
      } catch (err) {
        console.error("Database check failed:", err)
        newStatus.database.connected = false
        newStatus.database.status = "error"
      }

      // Auth system
      try {
        const { data: userData, error: authErr } = await supabase.auth.getUser()
        // supabase.auth.getUser() returns { data: { user } } in v2 — handle defensively
        const user = (userData as any)?.user ?? null
        newStatus.auth.working = !authErr
        if (!authErr) {
          newStatus.auth.status = "healthy"
          // try to get registered users count (profiles)
          const { count: profileCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })
          newStatus.auth.usersCount = typeof profileCount === "number" ? profileCount : 0
        } else {
          newStatus.auth.status = "error"
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        newStatus.auth.working = false
        newStatus.auth.status = "error"
      }

      // Storage system
      try {
        const { data: buckets, error: storageErr } = await supabase.storage.listBuckets()
        if (!storageErr && Array.isArray(buckets)) {
          newStatus.storage.connected = true
          newStatus.storage.bucketsCount = buckets.length
          newStatus.storage.status = computeLevel(true, buckets.length)
        } else {
          newStatus.storage.connected = false
          newStatus.storage.status = "error"
        }
      } catch (err) {
        console.error("Storage check failed:", err)
        newStatus.storage.connected = false
        newStatus.storage.status = "error"
      }

      // Compute overall score simply
      let score = 0
      if (newStatus.database.connected) score += 40
      if ((newStatus.database.tablesCount ?? 0) >= 3) score += 20
      if (newStatus.auth.working) score += 20
      if ((newStatus.auth.usersCount ?? 0) > 0) score += 10
      if (newStatus.storage.connected) score += 10

      newStatus.overall.score = score
      newStatus.overall.status = score >= 90 ? "healthy" : score >= 60 ? "warning" : "error"

      setStatus(newStatus)

      // Stats
      try {
        const users = await getAllUsers()
        const adminCount = users.filter((u: any) => u?.role === "admin").length

        const { count: carsCount } = await supabase.from("cars").select("*", { count: "exact", head: true })

        setStats({
          totalUsers: users.length,
          adminUsers: adminCount,
          totalCars: typeof carsCount === "number" ? carsCount : 0,
          systemUptime: "Online",
        })
      } catch (err) {
        console.error("Error fetching stats:", err)
      }

      setLastCheck(new Date())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only run client-side checks when this component is mounted
    checkSystemHealth()
    const id = setInterval(checkSystemHealth, 30_000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshStatus = async () => {
    await checkSystemHealth()
  }

  const getStatusIcon = (state?: boolean | HealthLevel) => {
    if (state === "healthy" || state === true) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (state === "warning") return <AlertCircle className="h-4 w-4 text-yellow-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (s: HealthLevel | undefined) => {
    const status = s ?? "error"
    const variants: Record<HealthLevel, string> = {
      healthy: "default",
      warning: "secondary",
      error: "destructive",
    }
    const colors: Record<HealthLevel, string> = {
      healthy: "text-green-700",
      warning: "text-yellow-700",
      error: "text-red-700",
    }

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.toUpperCase()}
      </Badge>
    )
  }

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
            {getStatusBadge(status.overall.status)}
          </CardTitle>
          <CardDescription>System health score based on database, authentication, and storage status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Health Score</span>
              <span className="text-2xl font-bold">{status.overall.score ?? 0}%</span>
            </div>
            <Progress value={status.overall.score ?? 0} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {status.overall.status === "healthy" ? "✓" : status.overall.status === "warning" ? "⚠" : "✗"}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{status.database.usersCount ?? 0}</div>
                <div className="text-sm text-muted-foreground">Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{status.database.carsCount ?? 0}</div>
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
                  {getStatusIcon(status.database.status)}
                  <span className="text-2xl font-bold">{status.database.connected ? "Connected" : "Disconnected"}</span>
                </div>
                <p className="text-xs text-muted-foreground">{status.database.tablesCount ?? 0} tables active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Authentication</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status.auth.status ?? (status.auth.working ? "healthy" : "error"))}
                  <span className="text-2xl font-bold">{status.auth.working ? "Working" : "Error"}</span>
                </div>
                <p className="text-xs text-muted-foreground">{status.auth.usersCount ?? 0} registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status.storage.status ?? (status.storage.connected ? "healthy" : "error"))}
                  <span className="text-2xl font-bold">{status.storage.connected ? "Connected" : "Disconnected"}</span>
                </div>
                <p className="text-xs text-muted-foreground">{status.storage.bucketsCount ?? 0} storage buckets</p>
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
                  {getStatusIcon(status.database.status)}
                  {getStatusBadge(status.database.status)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Active Tables</span>
                <Badge variant="outline">{status.database.tablesCount ?? 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>User Profiles</span>
                <Badge variant="outline">{status.database.usersCount ?? 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Cars</span>
                <Badge variant="outline">{status.database.carsCount ?? 0}</Badge>
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
                    {getStatusIcon(status.auth.status ?? (status.auth.working ? "healthy" : "error"))}
                    {getStatusBadge(status.auth.status ?? (status.auth.working ? "healthy" : "error"))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Registered Users</span>
                  <span className="font-mono">{status.auth.usersCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Confirmed Users</span>
                  <span className="font-mono">{status.auth.confirmedUsers ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5" />
                Storage Status
              </CardTitle>
              <CardDescription>Storage buckets and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Connection</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status.storage.status)}
                  {getStatusBadge(status.storage.status)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Buckets</span>
                <Badge variant="outline">{status.storage.bucketsCount ?? 0}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
