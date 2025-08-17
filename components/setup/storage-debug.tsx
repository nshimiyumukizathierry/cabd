"use client"

import { useEffect, useState } from "react"
import { storageService } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"

export function StorageDebug() {
  const [bucketInfo, setBucketInfo] = useState<any>(null)
  const [imageTests, setImageTests] = useState<{ [key: string]: any }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBucketInfo()
  }, [])

  const loadBucketInfo = async () => {
    setLoading(true)
    try {
      const info = await storageService.getBucketInfo()
      setBucketInfo(info)

      // Test the first few images
      if (info?.files) {
        const imageFiles = info.files.filter((f: any) => f.isImage).slice(0, 5)
        const tests: { [key: string]: any } = {}

        for (const file of imageFiles) {
          const result = await storageService.testImageAccess(file.name)
          tests[file.name] = result
        }

        setImageTests(tests)
      }
    } catch (error) {
      console.error("Error loading bucket info:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Storage Debug Information
          <Button variant="ghost" size="sm" onClick={loadBucketInfo} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bucketInfo && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Bucket Name:</strong> {bucketInfo.bucketName}
              </div>
              <div>
                <strong>Total Files:</strong> {bucketInfo.totalFiles}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Files in Storage:</h4>
              <div className="max-h-40 overflow-y-auto border rounded p-2">
                {bucketInfo.files.map((file: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm py-1">
                    <span className={file.isImage ? "text-green-600" : "text-gray-500"}>
                      {file.isImage ? "🖼️" : "📄"}
                    </span>
                    <span className="flex-1">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {file.size ? `${Math.round(file.size / 1024)}KB` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {Object.keys(imageTests).length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Image Access Tests:</h4>
                <div className="space-y-2">
                  {Object.entries(imageTests).map(([filename, test]: [string, any]) => (
                    <div key={filename} className="border rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {test.exists ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{filename}</span>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <p>
                          <strong>URL:</strong>{" "}
                          <a
                            href={test.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {test.url}
                          </a>
                        </p>
                        {test.error && (
                          <p className="text-red-600">
                            <strong>Error:</strong> {test.error}
                          </p>
                        )}
                      </div>

                      {test.exists && (
                        <div className="mt-2">
                          <Image
                            src={test.url || "/placeholder.svg"}
                            alt={filename}
                            width={100}
                            height={75}
                            className="rounded border"
                            onError={() => console.error("Preview failed for:", filename)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!bucketInfo && !loading && (
          <div className="text-center py-8 text-gray-500">
            <p>Click refresh to load storage information</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
