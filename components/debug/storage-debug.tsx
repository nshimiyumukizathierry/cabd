"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Upload } from "lucide-react"
import { storageService } from "@/lib/storage"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

export function StorageDebug() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [testing, setTesting] = useState(false)
  const [uploadTest, setUploadTest] = useState<{ success: boolean; message: string } | null>(null)

  const runStorageTests = async () => {
    setTesting(true)
    const results = []

    try {
      // Test 1: Basic storage access
      console.log("Testing basic storage access...")
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
      results.push({
        test: "Storage Access",
        success: !bucketError,
        message: bucketError ? bucketError.message : `Found ${buckets?.length || 0} buckets`,
        data: buckets?.map((b) => ({ id: b.id, name: b.name, public: b.public })),
      })

      // Test 2: CarBD Images bucket check
      console.log("Checking carbd-images bucket...")
      const carbdBucket = buckets?.find((b) => b.id === "carbd-images")
      results.push({
        test: "CarBD Images Bucket",
        success: !!carbdBucket,
        message: carbdBucket ? `Bucket exists (Public: ${carbdBucket.public})` : "Bucket not found",
        data: carbdBucket,
      })

      // Test 3: Authentication
      console.log("Testing authentication...")
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      results.push({
        test: "Authentication",
        success: !authError && !!user,
        message: authError ? authError.message : user ? `Authenticated as ${user.email}` : "Not authenticated",
        data: user ? { id: user.id, email: user.email } : null,
      })

      // Test 4: Storage service test
      console.log("Testing storage service...")
      const serviceTest = await storageService.testStorageConnection()
      results.push({
        test: "Storage Service",
        success: serviceTest.success,
        message: serviceTest.message,
        data: null,
      })

      // Test 5: List images
      if (carbdBucket) {
        console.log("Testing image listing...")
        try {
          const images = await storageService.listImages()
          results.push({
            test: "List Images",
            success: true,
            message: `Found ${images.length} images`,
            data: images,
          })
        } catch (error: any) {
          results.push({
            test: "List Images",
            success: false,
            message: error.message,
            data: null,
          })
        }
      }

      setTestResults(results)
    } catch (error: any) {
      console.error("Test error:", error)
      toast.error("Test failed: " + error.message)
    } finally {
      setTesting(false)
    }
  }

  const testUpload = async () => {
    try {
      // Create a small test image file
      const canvas = document.createElement("canvas")
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "#ff0000"
        ctx.fillRect(0, 0, 100, 100)
        ctx.fillStyle = "#ffffff"
        ctx.font = "20px Arial"
        ctx.fillText("TEST", 25, 55)
      }

      canvas.toBlob(async (blob) => {
        if (blob) {
          const testFile = new File([blob], "test-upload.png", { type: "image/png" })

          try {
            const uploadPath = await storageService.uploadImage(testFile, `test-${Date.now()}.png`)
            setUploadTest({
              success: true,
              message: `Upload successful: ${uploadPath}`,
            })
            toast.success("Upload test successful!")
          } catch (error: any) {
            setUploadTest({
              success: false,
              message: `Upload failed: ${error.message}`,
            })
            toast.error("Upload test failed!")
          }
        }
      }, "image/png")
    } catch (error: any) {
      setUploadTest({
        success: false,
        message: `Upload test error: ${error.message}`,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Debug</CardTitle>
        <CardDescription>Test storage functionality and diagnose issues with the carbd-images bucket</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runStorageTests} disabled={testing}>
              {testing ? "Running Tests..." : "Run Storage Tests"}
            </Button>
            <Button onClick={testUpload} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Test Upload
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Test Results:</h3>
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.test}</span>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "Pass" : "Fail"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    {result.data && (
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {uploadTest && (
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {uploadTest.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">Upload Test</span>
                <Badge variant={uploadTest.success ? "default" : "destructive"}>
                  {uploadTest.success ? "Success" : "Failed"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">{uploadTest.message}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
