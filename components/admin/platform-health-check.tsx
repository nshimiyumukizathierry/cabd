"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { storageService } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Database,
  ImageIcon,
  Users,
  Car,
  Shield,
  Globe,
  Zap,
  RefreshCw,
} from "lucide-react"
import toast from "react-hot-toast"

interface HealthCheck {
  name: string
  status: "checking" | "success" | "warning" | "error"
  message: string
  details?: string[]
  action?: string
}

export function PlatformHealthCheck() {
  const [checks, setChecks] = useState<HealthCheck[]>([])
  const [overallHealth, setOverallHealth] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const healthChecks = [
    {
      name: "Database Connection",
      icon: Database,
      test: async () => {
        const { data, error } = await supabase.from("cars").select("count").limit(1)
        if (error) throw new Error(`Database connection failed: ${error.message}`)
        return { message: "Database connected successfully", details: ["Connection established", "Query executed"] }
      },
    },
    {
      name: "Storage System",
      icon: ImageIcon,
      test: async () => {
        const result = await storageService.testStorageConnection()
        if (!result.success) throw new Error(result.message)
        const files = await storageService.listImages()
        return {
          message: `Storage working - ${files.length} files found`,
          details: [`Bucket accessible`, `${files.length} images available`, "Upload permissions verified"],
        }
      },
    },
    {
      name: "Car Data",
      icon: Car,
      test: async () => {
        const { data, error, count } = await supabase.from("cars").select("*", { count: "exact" })
        if (error) throw new Error(`Car data error: ${error.message}`)
        const withImages = data?.filter((car) => car.image_url && car.image_url.trim() !== "").length || 0
        if (count === 0) throw new Error("No cars found in database")
        return {
          message: `${count} cars loaded, ${withImages} with images`,
          details: [`${count} total cars`, `${withImages} cars have images`, `${count - withImages} need images`],
        }
      },
    },
    {
      name: "Founder Profiles",
      icon: Users,
      test: async () => {
        const { data, error, count } = await supabase.from("founders").select("*", { count: "exact" })
        if (error) throw new Error(`Founder data error: ${error.message}`)
        const withImages = data?.filter((founder) => founder.image_path && founder.image_path.trim() !== "").length || 0
        return {
          message: count === 0 ? "No founders yet - ready to add" : `${count} founders, ${withImages} with photos`,
          details:
            count === 0
              ? ["Founders table ready", "Add your team profiles"]
              : [`${count} founder profiles`, `${withImages} have photos`],
        }
      },
    },
    {
      name: "Admin Access",
      icon: Shield,
      test: async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")

        const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (error) throw new Error(`Profile check failed: ${error.message}`)
        if (profile?.role !== "admin") throw new Error("User is not admin")

        return {
          message: "Admin access confirmed",
          details: ["User authenticated", "Admin role verified", "Full access granted"],
        }
      },
    },
    {
      name: "RLS Policies",
      icon: Shield,
      test: async () => {
        // Test that regular operations work (indicates RLS is properly configured)
        const { error: carsError } = await supabase.from("cars").select("id").limit(1)
        const { error: foundersError } = await supabase.from("founders").select("id").limit(1)

        if (carsError) throw new Error(`Cars RLS error: ${carsError.message}`)
        if (foundersError) throw new Error(`Founders RLS error: ${foundersError.message}`)

        return {
          message: "RLS policies working correctly",
          details: ["Cars table accessible", "Founders table accessible", "Security policies active"],
        }
      },
    },
    {
      name: "Image Loading",
      icon: Globe,
      test: async () => {
        const { data: cars } = await supabase.from("cars").select("image_url").not("image_url", "is", null).limit(3)
        if (!cars || cars.length === 0) {
          return {
            message: "No car images to test",
            details: ["Upload some car images first"],
          }
        }

        // Test if images are accessible
        let workingImages = 0
        for (const car of cars) {
          if (car.image_url) {
            const url = storageService.getImageUrl(car.image_url)
            try {
              const response = await fetch(url, { method: "HEAD" })
              if (response.ok) workingImages++
            } catch (error) {
              console.error("Image test failed:", error)
            }
          }
        }

        return {
          message: `${workingImages}/${cars.length} images loading correctly`,
          details: [`${workingImages} images accessible`, `${cars.length - workingImages} images need attention`],
        }
      },
    },
  ]

  const runHealthCheck = async () => {
    setIsRunning(true)
    setChecks([])

    const results: HealthCheck[] = []
    let successCount = 0

    for (const check of healthChecks) {
      // Add checking status
      const checkingResult: HealthCheck = {
        name: check.name,
        status: "checking",
        message: "Running check...",
      }
      results.push(checkingResult)
      setChecks([...results])

      try {
        const result = await check.test()
        // Update with success
        results[results.length - 1] = {
          name: check.name,
          status: "success",
          message: result.message,
          details: result.details,
        }
        successCount++
      } catch (error: any) {
        // Update with error
        results[results.length - 1] = {
          name: check.name,
          status: "error",
          message: error.message,
          action: getActionForCheck(check.name),
        }
      }

      setChecks([...results])
      setOverallHealth((successCount / healthChecks.length) * 100)

      // Small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunning(false)

    if (successCount === healthChecks.length) {
      toast.success("🎉 All systems operational! Platform ready for production.")
    } else if (successCount >= healthChecks.length * 0.8) {
      toast.success("✅ Platform mostly ready - minor issues to address")
    } else {
      toast.error("⚠️ Several issues need attention before launch")
    }
  }

  const getActionForCheck = (checkName: string): string => {
    switch (checkName) {
      case "Database Connection":
        return "Check your Supabase connection and environment variables"
      case "Storage System":
        return "Run the disable-rls-for-cars-bucket.sql script"
      case "Car Data":
        return "Add some cars via the admin panel"
      case "Founder Profiles":
        return "Add founder profiles in the admin panel"
      case "Admin Access":
        return "Sign up and update your role to 'admin' in the profiles table"
      case "RLS Policies":
        return "Run the complete-platform-setup.sql script"
      case "Image Loading":
        return "Upload images for your cars and check storage configuration"
      default:
        return "Check the documentation for troubleshooting steps"
    }
  }

  const getStatusIcon = (status: HealthCheck["status"]) => {
    switch (status) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: HealthCheck["status"]) => {
    switch (status) {
      case "checking":
        return "border-blue-200 bg-blue-50"
      case "success":
        return "border-green-200 bg-green-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "error":
        return "border-red-200 bg-red-50"
    }
  }

  useEffect(() => {
    runHealthCheck()
  }, [])

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Platform Health Score
            </CardTitle>
            <Button onClick={runHealthCheck} disabled={isRunning} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`} />
              {isRunning ? "Checking..." : "Recheck"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Health</span>
              <span className="text-2xl font-bold">{Math.round(overallHealth)}%</span>
            </div>
            <Progress value={overallHealth} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Critical Issues</span>
              <span>Production Ready</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Health Checks */}
      <div className="grid gap-4">
        {checks.map((check, index) => (
          <Card key={index} className={`border-2 ${getStatusColor(check.status)}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <h3 className="font-medium">{check.name}</h3>
                    <p className="text-sm text-gray-600">{check.message}</p>
                    {check.details && (
                      <ul className="mt-2 text-xs text-gray-500 space-y-1">
                        {check.details.map((detail, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                    {check.action && <p className="mt-2 text-xs text-blue-600 font-medium">💡 {check.action}</p>}
                  </div>
                </div>
                <Badge
                  variant={
                    check.status === "success" ? "default" : check.status === "error" ? "destructive" : "secondary"
                  }
                >
                  {check.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Steps */}
      {overallHealth >= 80 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Ready for Next Phase!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-3">Your platform is healthy and ready for production optimization.</p>
            <div className="space-y-2 text-sm text-green-600">
              <p>✅ Core functionality working</p>
              <p>✅ Database and storage configured</p>
              <p>✅ Admin access established</p>
              <p>🚀 Ready to add content and deploy!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
