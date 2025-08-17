"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Copy } from "lucide-react"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message: string
}

export default function StorageSetupPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Storage Access", status: "pending", message: "Not tested" },
    { name: "Cars Bucket", status: "pending", message: "Not tested" },
    { name: "Authentication", status: "pending", message: "Not tested" },
    { name: "Upload Permissions", status: "pending", message: "Not tested" },
  ])
  const [testing, setTesting] = useState(false)

  const updateTest = (index: number, status: "success" | "error", message: string) => {
    setTests((prev) => prev.map((test, i) => (i === index ? { ...test, status, message } : test)))
  }

  const runTests = async () => {
    setTesting(true)

    try {
      // Test 1: Storage Access
      updateTest(0, "pending", "Testing...")
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
      if (bucketError) {
        updateTest(0, "error", `Cannot access storage: ${bucketError.message}`)
        return
      }
      updateTest(0, "success", `Found ${buckets?.length || 0} buckets`)

      // Test 2: Cars Bucket
      updateTest(1, "pending", "Checking...")
      const carsBucket = buckets?.find((b) => b.id === "cars")
      if (!carsBucket) {
        updateTest(1, "error", "Cars bucket not found")
      } else {
        updateTest(1, "success", `Cars bucket exists (Public: ${carsBucket.public})`)
      }

      // Test 3: Authentication
      updateTest(2, "pending", "Checking...")
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        updateTest(2, "error", "User not authenticated")
        return
      }
      updateTest(2, "success", `Authenticated as ${user.email}`)

      // Test 4: Upload Permissions (only if bucket exists)
      updateTest(3, "pending", "Testing...")
      if (carsBucket) {
        const { data: files, error: listError } = await supabase.storage.from("cars").list("", { limit: 1 })
        if (listError) {
          updateTest(3, "error", `Permission error: ${listError.message}`)
        } else {
          updateTest(3, "success", `Can access bucket (${files?.length || 0} files)`)
        }
      } else {
        updateTest(3, "error", "Cannot test - bucket doesn't exist")
      }
    } catch (error: any) {
      console.error("Test error:", error)
      toast.error("Test failed: " + error.message)
    } finally {
      setTesting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  const sqlScript = `-- Setup RLS policies for existing 'cars' bucket
-- Copy and paste this entire script into Supabase SQL Editor

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "CarBD_public_read" ON storage.objects;
DROP POLICY IF EXISTS "CarBD_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "CarBD_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "CarBD_authenticated_delete" ON storage.objects;

-- Create new policies for the 'cars' bucket
-- Policy 1: Allow public read access to cars bucket
CREATE POLICY "Cars_public_read" ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'cars');

-- Policy 2: Allow authenticated users to upload to cars bucket
CREATE POLICY "Cars_authenticated_upload" ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'cars');

-- Policy 3: Allow authenticated users to update files in cars bucket
CREATE POLICY "Cars_authenticated_update" ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'cars');

-- Policy 4: Allow authenticated users to delete files from cars bucket
CREATE POLICY "Cars_authenticated_delete" ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'cars');

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';`

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Storage Setup</h1>
        <p className="text-gray-600">
          Set up and test Supabase storage for the CarBD platform using your existing "cars" bucket.
        </p>
      </div>

      {/* Test Results */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Storage Tests</CardTitle>
          <CardDescription>Run these tests to check if storage is properly configured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h3 className="font-medium">{test.name}</h3>
                    <p className="text-sm text-gray-600">{test.message}</p>
                  </div>
                </div>
                {getStatusBadge(test.status)}
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <Button onClick={runTests} disabled={testing}>
              {testing ? "Running Tests..." : "Run Tests"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SQL Script Setup */}
      <Card className="mb-6 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              1
            </span>
            Setup Storage Policies
          </CardTitle>
          <CardDescription>
            Run this SQL script to set up proper policies for your existing "cars" bucket
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-3">Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to Supabase Dashboard → SQL Editor</li>
                <li>Create a new query</li>
                <li>Copy the SQL script below and paste it</li>
                <li>Click "Run" to execute the script</li>
                <li>Come back here and click "Run Tests" to verify</li>
              </ol>
            </div>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 text-gray-300 hover:text-white"
                onClick={() => copyToClipboard(sqlScript)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <pre className="text-sm overflow-x-auto pr-12">
                <code>{sqlScript}</code>
              </pre>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ExternalLink className="h-4 w-4" />
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open Supabase Dashboard → SQL Editor
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {tests.every((test) => test.status === "success") && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-medium text-green-800">🎉 Storage Setup Complete!</h3>
                <p className="text-green-600">
                  All tests passed. You can now upload images for founders and cars using your existing "cars" bucket.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
