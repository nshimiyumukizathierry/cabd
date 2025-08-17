"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ConnectionTest() {
  const [status, setStatus] = useState<{
    connection: "loading" | "success" | "error"
    auth: "loading" | "success" | "error"
    tables: "loading" | "success" | "error"
    message: string
    details?: any
  }>({
    connection: "loading",
    auth: "loading",
    tables: "loading",
    message: "Testing connection...",
  })

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      console.log("Testing Supabase connection...")

      // Test basic connection to cars table
      const { data, error, count } = await supabase.from("cars").select("*", { count: "exact", head: true })

      if (error) {
        console.error("Connection test error:", error)
        setStatus({
          connection: "error",
          auth: "error",
          tables: "error",
          message: `Connection failed: ${error.message}`,
          details: error,
        })
        return
      }

      // Test auth
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      console.log("Connection test successful:", { count, user: !!user })

      setStatus({
        connection: "success",
        auth: "success",
        tables: "success",
        message: `Connected successfully! Found ${count || 0} cars in database.`,
        details: { count, hasUser: !!user },
      })
    } catch (error: any) {
      console.error("Connection test failed:", error)
      setStatus({
        connection: "error",
        auth: "error",
        tables: "error",
        message: `Setup error: ${error.message}`,
        details: error,
      })
    }
  }

  const getIcon = (state: "loading" | "success" | "error") => {
    switch (state) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Database Connection Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {getIcon(status.connection)}
          <span>Supabase Connection</span>
        </div>

        <div className="flex items-center gap-2">
          {getIcon(status.auth)}
          <span>Authentication Service</span>
        </div>

        <div className="flex items-center gap-2">
          {getIcon(status.tables)}
          <span>Database Tables</span>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">{status.message}</p>
        </div>

        <Button onClick={testConnection} variant="outline" size="sm">
          Retest Connection
        </Button>

        <div className="text-xs text-gray-500">
          <p>Project: mjnfcixxdofwtshzrpon</p>
          <p>URL: https://mjnfcixxdofwtshzrpon.supabase.co</p>
          <p>Storage: https://mjnfcixxdofwtshzrpon.storage.supabase.co</p>
        </div>

        {status.details && (
          <details className="text-xs text-gray-500">
            <summary>Debug Details</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">{JSON.stringify(status.details, null, 2)}</pre>
          </details>
        )}
      </CardContent>
    </Card>
  )
}
