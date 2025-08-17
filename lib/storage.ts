import { supabase } from "./supabase"

export class StorageService {
  private bucketName = "cars"

  async testStorageConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log("Testing storage connection...")

      // Test bucket access
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()

      if (bucketError) {
        console.error("Bucket list error:", bucketError)
        return {
          success: false,
          message: `Storage access failed: ${bucketError.message}`,
        }
      }

      const carsBucket = buckets?.find((b) => b.id === this.bucketName)
      if (!carsBucket) {
        return {
          success: false,
          message: `Cars bucket not found. Please run the storage setup script.`,
        }
      }

      // Test file listing
      const { data: files, error: listError } = await supabase.storage.from(this.bucketName).list("", { limit: 1 })

      if (listError) {
        console.error("File list error:", listError)
        if (listError.message.includes("RLS") || listError.message.includes("row-level security")) {
          return {
            success: false,
            message: "RLS Policy Error: Please run fix-rls-policies-complete.sql script",
          }
        }
        return {
          success: false,
          message: `Storage list failed: ${listError.message}`,
        }
      }

      console.log("Storage test successful, files found:", files?.length || 0)
      return {
        success: true,
        message: `Storage ready! Found ${files?.length || 0} files in cars bucket`,
      }
    } catch (error: any) {
      console.error("Storage test error:", error)
      return {
        success: false,
        message: `Storage test failed: ${error.message}`,
      }
    }
  }

  async uploadImage(file: File): Promise<string | null> {
    try {
      console.log("Starting image upload:", {
        name: file.name,
        size: file.size,
        type: file.type,
      })

      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      console.log("Generated filename:", fileName)

      // Upload to Supabase storage
      const { data, error } = await supabase.storage.from(this.bucketName).upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        console.error("Upload error:", error)
        if (error.message.includes("RLS") || error.message.includes("row-level security")) {
          throw new Error("RLS Policy Error: Please run the fix-rls-policies-complete.sql script")
        }
        throw new Error(`Upload failed: ${error.message}`)
      }

      console.log("Upload successful:", data)
      return data.path
    } catch (error: any) {
      console.error("Error in uploadImage:", error)
      throw error
    }
  }

  async listImages(): Promise<string[]> {
    try {
      console.log("Listing images from storage...")

      const { data, error } = await supabase.storage.from(this.bucketName).list("", {
        limit: 100,
        sortBy: { column: "name", order: "asc" },
      })

      if (error) {
        console.error("List images error:", error)
        if (error.message.includes("RLS") || error.message.includes("row-level security")) {
          throw new Error("RLS Policy Error: Please run the fix-rls-policies-complete.sql script")
        }
        throw new Error(`Failed to list images: ${error.message}`)
      }

      const imageFiles =
        data
          ?.filter((file) => {
            const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            return isImage && file.name !== ".emptyFolderPlaceholder"
          })
          .map((file) => file.name) || []

      console.log("Images found in storage:", imageFiles.length)
      return imageFiles
    } catch (error: any) {
      console.error("Error listing images:", error)
      throw error
    }
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      console.warn("No image path provided")
      return "/classic-red-convertible.png"
    }

    // Handle both full paths and just filenames
    const cleanPath = imagePath.startsWith(`${this.bucketName}/`)
      ? imagePath.substring(`${this.bucketName}/`.length)
      : imagePath

    const { data } = supabase.storage.from(this.bucketName).getPublicUrl(cleanPath)

    const publicUrl = data.publicUrl
    console.log(`Generated public URL for ${imagePath}: ${publicUrl}`)

    return publicUrl
  }

  async deleteImage(imagePath: string): Promise<boolean> {
    try {
      console.log("Deleting image:", imagePath)

      const cleanPath = imagePath.startsWith(`${this.bucketName}/`)
        ? imagePath.substring(`${this.bucketName}/`.length)
        : imagePath

      const { error } = await supabase.storage.from(this.bucketName).remove([cleanPath])

      if (error) {
        console.error("Delete error:", error)
        throw new Error(`Failed to delete image: ${error.message}`)
      }

      console.log("Image deleted successfully")
      return true
    } catch (error: any) {
      console.error("Error deleting image:", error)
      return false
    }
  }
}

export const storageService = new StorageService()
