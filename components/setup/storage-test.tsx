"use client"

import { useEffect, useState } from "react"
import { storageService } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function StorageTest() {
  const [status, setStatus] = useState<{
    connection: "loading" | "success" | "error"
    images: string[]
    message: string
    testUrls?: { [key: string]: string }
  }>({
    connection: "loading",
    images: [],
    message: "Testing storage connection...",
  })

  useEffect(() => {
    testStorage()
  }, [])

  const testStorage = async () => {
    try {
      console.log("Testing storage connection...")
      const images = await storageService.listImages()

      // Test different URL formats for the first few images
      const testUrls: { [key: string]: string } = {}
      for (const imageName of images.slice(0, 3)) {
        testUrls[imageName] = storageService.getImageUrl(imageName)
      }

      console.log("Storage test results:", { images, testUrls })

      setStatus({
        connection: "success",
        images: images.slice(0, 6), // Show first 6 images
        message: `Storage connected! Found ${images.length} images in 'cars' bucket.`,
        testUrls,
      })
    } catch (error: any) {
      console.error("Storage test error:", error)
      setStatus({
        connection: "error",
        images: [],
        message: `Storage error: ${error.message}`,
      })
    }
  }

  const testImageUrl = async (imageName: string) => {
    const url = storageService.getImageUrl(imageName)
    try {
      const response = await fetch(url, { method: "HEAD" })
      console.log(`Image test for ${imageName}:`, { url, status: response.status, ok: response.ok })
      return response.ok
    } catch (error) {
      console.error(`Image test failed for ${imageName}:`, error)
      return false
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon(status.connection)}
          Storage Bucket Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">{status.message}</p>
        </div>

        <Button onClick={testStorage} variant="outline" size="sm">
          Retest Storage
        </Button>

        {status.images.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Sample Images from Storage:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {status.images.map((imageName, index) => {
                const imageUrl = storageService.getImageUrl(imageName)
                return (
                  <div key={index} className="relative border rounded">
                    <Image
                      src={imageUrl || "/placeholder.svg"}
                      alt={imageName}
                      width={150}
                      height={100}
                      className="w-full h-20 object-cover rounded"
                      onError={(e) => {
                        console.error("Image failed to load:", imageName, imageUrl)
                        e.currentTarget.style.display = "none"
                      }}
                      onLoad={() => {
                        console.log("Image loaded:", imageName, imageUrl)
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                      {imageName.length > 15 ? `${imageName.substring(0, 15)}...` : imageName}
                    </div>
                    <div className="text-xs text-gray-500 p-1">
                      <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Test URL
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {status.testUrls && (
          <div className="text-xs text-gray-500">
            <details>
              <summary>Image URL Debug Info</summary>
              <div className="mt-2 space-y-1">
                {Object.entries(status.testUrls).map(([imageName, url]) => (
                  <div key={imageName} className="p-2 bg-gray-100 rounded">
                    <p>
                      <strong>{imageName}</strong>
                    </p>
                    <p className="break-all">{url}</p>
                    <button onClick={() => testImageUrl(imageName)} className="text-blue-600 hover:underline">
                      Test Access
                    </button>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>Bucket: cars</p>
          <p>Project: mjnfcixxdofwtshzrpon</p>
          <p>Storage URL: https://mjnfcixxdofwtshzrpon.supabase.co/storage/v1/object/public/cars</p>
        </div>
      </CardContent>
    </Card>
  )
}
