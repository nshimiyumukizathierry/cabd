"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, ImageIcon, X, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { storageService } from "@/lib/storage"
import Image from "next/image"
import toast from "react-hot-toast"

interface DirectImageUploadProps {
  selectedImage?: string
  onImageSelect: (imageUrl: string) => void
  label?: string
}

export function DirectImageUpload({ selectedImage, onImageSelect, label = "Select Image" }: DirectImageUploadProps) {
  const [availableImages, setAvailableImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [storageStatus, setStorageStatus] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    loadImages()
    checkStorageStatus()
  }, [])

  const checkStorageStatus = async () => {
    try {
      console.log("Checking storage status...")
      const status = await storageService.testStorageConnection()
      setStorageStatus(status)
      console.log("Storage status:", status)
    } catch (error: any) {
      console.error("Storage status check failed:", error)
      setStorageStatus({ success: false, message: `Storage check failed: ${error.message}` })
    }
  }

  const loadImages = async () => {
    try {
      setLoading(true)
      console.log("Loading available images...")
      const images = await storageService.listImages()
      console.log("Available images:", images)
      setAvailableImages(images)
    } catch (error: any) {
      console.error("Error loading images:", error)
      toast.error(`Failed to load images: ${error.message}`)
      setAvailableImages([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Image size should be less than 50MB")
      return
    }

    setUploading(true)

    try {
      console.log("Starting file upload:", {
        name: file.name,
        size: file.size,
        type: file.type,
      })

      const imagePath = await storageService.uploadImage(file)

      if (imagePath) {
        console.log("Upload successful, image path:", imagePath)
        toast.success("Image uploaded successfully!")

        // Add to available images
        setAvailableImages((prev) => [imagePath, ...prev])

        // Auto-select the uploaded image
        onImageSelect(imagePath)

        // Clear the file input
        event.target.value = ""
      } else {
        throw new Error("Upload completed but no image path returned")
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      toast.error(error.message || "Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleImageSelect = (imagePath: string) => {
    console.log("Image selected:", imagePath)
    onImageSelect(imagePath)
    toast.success("Image selected!")
  }

  const getImageUrl = (imagePath: string) => {
    return storageService.getImageUrl(imagePath)
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">{label}</Label>

      {/* Storage Status */}
      {storageStatus && (
        <Card
          className={`border ${storageStatus.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm">
              {storageStatus.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className={storageStatus.success ? "text-green-700" : "text-red-700"}>{storageStatus.message}</span>
              <Button variant="ghost" size="sm" onClick={checkStorageStatus}>
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="image-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                uploading
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-sm text-blue-600 font-medium">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP (MAX. 50MB)</p>
                  </>
                )}
              </div>
              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading || !storageStatus?.success}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Selected Image Preview */}
      {selectedImage && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={getImageUrl(selectedImage) || "/placeholder.svg"}
                  alt="Selected"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=64&width=64&text=Error"
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700">Selected Image</p>
                <p className="text-xs text-gray-500 truncate">{selectedImage}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onImageSelect("")}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Images */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Available Images ({availableImages.length})</h4>
            <Button variant="ghost" size="sm" onClick={loadImages} disabled={loading}>
              {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading images...</span>
            </div>
          ) : availableImages.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No images available</p>
              <p className="text-xs text-gray-400">Upload an image to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
              {availableImages.map((imagePath) => (
                <div
                  key={imagePath}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 ${
                    selectedImage === imagePath ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
                  }`}
                  onClick={() => handleImageSelect(imagePath)}
                >
                  <Image
                    src={getImageUrl(imagePath) || "/placeholder.svg"}
                    alt={imagePath}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=100&width=100&text=Error"
                    }}
                  />
                  {selectedImage === imagePath && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
