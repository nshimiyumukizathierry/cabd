"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { storageService } from "@/lib/storage"
import Image from "next/image"
import { Upload, ImageIcon, ExternalLink, FolderOpen, AlertCircle, X } from "lucide-react"
import toast from "react-hot-toast"

interface ImageSelectorProps {
  selectedImage: string
  onImageSelect: (imageUrl: string) => void
}

// Available car images from your storage
const AVAILABLE_IMAGES = [
  "ASTONI MARTIN.jpg",
  "AUDI.jpg",
  "BMW.jpg",
  "CORORA.jpg",
  "FERARI.jpg",
  "HUNDAI.jpg",
  "KIA SPORTAGE.jpg",
  "LAMBORGHINI.jpg",
  "LAND LOVER B2.jpg",
  "LAND LOVER B4.jpg",
  "LAND LOVER.jpg",
  "LEXUS.jpg",
  "MUSTAG.jpg",
  "POCHE.jpg",
  "RANGE LOVER.jpg",
  "TESLA.jpg",
  "VOLKSWAGHEN.jpg",
]

export function ImageSelector({ selectedImage, onImageSelect }: ImageSelectorProps) {
  const [availableImages, setAvailableImages] = useState<string[]>(AVAILABLE_IMAGES)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [storageTest, setStorageTest] = useState<{ success: boolean; message: string } | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      testStorageAndLoadImages()
    }
  }, [isOpen])

  const testStorageAndLoadImages = async () => {
    try {
      // Test storage connection first
      const testResult = await storageService.testStorageConnection()
      setStorageTest(testResult)

      if (testResult.success) {
        await loadImages()
      } else {
        console.error("Storage test failed:", testResult.message)
        toast.error("Storage connection issue: " + testResult.message)
      }
    } catch (error) {
      console.error("Storage test error:", error)
      setStorageTest({ success: false, message: "Storage test failed" })
    }
  }

  const loadImages = async () => {
    setLoading(true)
    try {
      const images = await storageService.listImages()
      console.log("Available images from storage:", images)
      if (images.length > 0) {
        // Combine uploaded images with predefined ones, removing duplicates
        const allImages = [...new Set([...images, ...AVAILABLE_IMAGES])]
        setAvailableImages(allImages)
      }
    } catch (error: any) {
      console.error("Error loading images:", error)
      toast.error("Failed to load images: " + error.message)
      // Fallback to predefined list
      setAvailableImages(AVAILABLE_IMAGES)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log("File selected:", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    })

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Image size should be less than 50MB")
      return
    }

    setUploadedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    toast.success("Image selected for upload")
  }

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast.error("Please select a file first")
      return
    }

    setUploading(true)
    try {
      // Test storage before upload
      const testResult = await storageService.testStorageConnection()
      if (!testResult.success) {
        throw new Error(`Storage not ready: ${testResult.message}`)
      }

      console.log("Storage test passed, starting upload...")

      const imagePath = await storageService.uploadImage(uploadedFile)
      if (imagePath) {
        console.log("Upload successful, path:", imagePath)
        onImageSelect(imagePath)
        await loadImages() // Refresh the list
        toast.success("Image uploaded successfully!")

        // Clear upload state
        setUploadedFile(null)
        setUploadPreview(null)

        setIsOpen(false) // Close the dialog
      } else {
        throw new Error("Upload failed - no path returned")
      }
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast.error(error.message || "Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const clearUpload = () => {
    setUploadedFile(null)
    setUploadPreview(null)
  }

  const handleImageSelect = (imageName: string) => {
    onImageSelect(imageName)
    setIsOpen(false)
  }

  const getPreviewUrl = (imageRef: string) => {
    return storageService.getImageUrl(imageRef)
  }

  return (
    <div className="space-y-2">
      <Label>Car Image</Label>
      <div className="flex gap-2">
        <Input
          type="text"
          value={selectedImage}
          onChange={(e) => onImageSelect(e.target.value)}
          placeholder="Select from available images or upload new"
          className="flex-1"
          readOnly
        />

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              <ImageIcon className="h-4 w-4 mr-2" />
              Browse Images
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select or Upload Car Image</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Storage Status */}
              {storageTest && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    storageTest.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{storageTest.message}</span>
                </div>
              )}

              {/* Upload Section */}
              <div className="border-2 border-dashed rounded-lg p-6">
                <div className="text-center">
                  <h3 className="font-medium mb-4">Upload New Image</h3>

                  {!uploadedFile ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                        disabled={!storageTest?.success}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`cursor-pointer ${!storageTest?.success ? "opacity-50" : ""}`}
                      >
                        <div className="flex flex-col items-center">
                          <Upload
                            className={`h-8 w-8 mx-auto mb-2 ${storageTest?.success ? "text-blue-600" : "text-gray-400"}`}
                          />
                          <p
                            className={`text-sm font-medium ${storageTest?.success ? "text-blue-700" : "text-gray-500"}`}
                          >
                            {!storageTest?.success
                              ? "Storage not available"
                              : "Click to select an image from your computer"}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Supports JPG, PNG, GIF, WebP (Max 50MB)</p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <Image
                          src={uploadPreview || "/placeholder.svg"}
                          alt="Upload preview"
                          width={200}
                          height={150}
                          className="rounded-lg object-cover border"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-1 right-1 bg-white/90 hover:bg-white shadow-sm"
                          onClick={clearUpload}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleUpload} disabled={uploading} size="sm">
                          {uploading ? "Uploading..." : "Upload Image"}
                        </Button>
                        <Button onClick={clearUpload} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Available Images */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Loading images...</p>
                </div>
              ) : (
                <div>
                  <h3 className="font-medium mb-4">Available Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableImages.map((imageName, index) => {
                      const imageUrl = getPreviewUrl(imageName)
                      const isSelected = selectedImage === imageName
                      return (
                        <div
                          key={`${imageName}-${index}`}
                          className={`relative cursor-pointer border-2 rounded-lg overflow-hidden hover:shadow-md transition-all ${
                            isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
                          }`}
                        >
                          <div onClick={() => handleImageSelect(imageName)}>
                            <Image
                              src={imageUrl || "/placeholder.svg"}
                              alt={imageName}
                              width={200}
                              height={150}
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                console.error("Preview image failed:", imageName, imageUrl)
                                const target = e.target as HTMLImageElement
                                target.src = "/classic-red-convertible.png"
                              }}
                            />
                            <div className={`p-2 ${isSelected ? "bg-blue-50" : "bg-white"}`}>
                              <p className="text-xs text-gray-600 truncate font-medium">{imageName}</p>
                            </div>
                          </div>
                          <a
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow hover:bg-gray-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          {isSelected && (
                            <div className="absolute top-1 left-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                              ✓
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {availableImages.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                      <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No images found in storage. Upload your first image above.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview */}
      {selectedImage && (
        <div className="mt-2">
          <Image
            src={getPreviewUrl(selectedImage) || "/placeholder.svg"}
            alt="Selected car image"
            width={200}
            height={150}
            className="rounded-lg object-cover border"
            onError={(e) => {
              console.error("Selected image preview failed:", selectedImage)
              const target = e.target as HTMLImageElement
              target.src = "/classic-red-convertible.png"
            }}
          />
          <p className="text-xs text-gray-500 mt-1">Selected: {selectedImage}</p>
        </div>
      )}
    </div>
  )
}
