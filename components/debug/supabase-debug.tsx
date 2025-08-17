"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function SupabaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    setDebugInfo({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    })
  }, [])

  const testConnection = async () => {
    setTesting(true)
    try {
      // Test basic connection
      const { data, error } = await supabase.from("cars").select("count", { count: "exact", head: true })

      console.log("Connection test result:", { data, error })

      if (error) {
        setDebugInfo((prev) => ({ ...prev, error: error.message, success: false }))
      } else {
        setDebugInfo((prev) => ({ ...prev, success: true, carCount: data }))
      }
    } catch (err: any) {
      console.error("Connection test failed:", err)
      setDebugInfo((prev) => ({ ...prev, error: err.message, success: false }))
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Supabase Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>URL:</strong> {debugInfo.url || "Not set"}
          </div>
          <div>
            <strong>Has Anon Key:</strong> {debugInfo.hasAnonKey ? "Yes" : "No"}
          </div>
          <div>
            <strong>Key Length:</strong> {debugInfo.anonKeyLength}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            {debugInfo.success === true ? "✅ Connected" : debugInfo.success === false ? "❌ Failed" : "⏳ Not tested"}
          </div>
        </div>

        {debugInfo.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <strong>Error:</strong> {debugInfo.error}
          </div>
        )}

        {debugInfo.success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            <strong>Success!</strong> Found {debugInfo.carCount || 0} cars in database.
          </div>
        )}

        <Button onClick={testConnection} disabled={testing}>
          {testing ? "Testing..." : "Test Connection"}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Expected URL:</strong> https://mjnfcixxdofwtshzrpon.supabase.co
          </p>
          <p>
            <strong>Expected Key Format:</strong> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
