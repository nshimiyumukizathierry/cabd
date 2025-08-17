"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { DirectImageUpload } from "./direct-image-upload"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

interface Founder {
  id: string
  name: string
  position: string
  bio: string
  email: string
  phone: string
  image_path: string
  display_order: number
}

interface FounderFormProps {
  founder?: Founder | null
  onClose: () => void
  onSave?: () => void
}

export function FounderForm({ founder, onClose, onSave }: FounderFormProps) {
  const [formData, setFormData] = useState({
    name: founder?.name || "",
    position: founder?.position || "",
    bio: founder?.bio || "",
    email: founder?.email || "",
    phone: founder?.phone || "",
    display_order: founder?.display_order || 1,
    image_path: founder?.image_path || "",
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "display_order" ? Number.parseInt(value) || 1 : value,
    }))
  }

  const handleImageSelect = (imageUrl: string) => {
    console.log("Image selected for founder:", imageUrl)
    setFormData((prev) => ({ ...prev, image_path: imageUrl }))
    toast.success("Image selected! Save the founder to apply changes.")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.position.trim()) {
      toast.error("Name and position are required")
      return
    }

    setLoading(true)

    try {
      const founderData = {
        name: formData.name.trim(),
        position: formData.position.trim(),
        bio: formData.bio.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        display_order: formData.display_order,
        image_path: formData.image_path || null, // Ensure null instead of empty string
      }

      console.log("Saving founder data:", founderData)

      if (founder) {
        // Update existing founder
        const { error } = await supabase.from("founders").update(founderData).eq("id", founder.id)

        if (error) {
          console.error("Update error:", error)
          if (error.message.includes("row-level security")) {
            throw new Error(
              "Permission denied. Please run the fix-rls-policies-complete.sql script to fix database permissions.",
            )
          }
          throw new Error(`Failed to update founder: ${error.message}`)
        }
        toast.success("Founder updated successfully!")
      } else {
        // Create new founder
        const { data, error } = await supabase.from("founders").insert([founderData]).select()

        if (error) {
          console.error("Insert error:", error)
          if (error.message.includes("row-level security")) {
            throw new Error(
              "Permission denied. Please run the fix-rls-policies-complete.sql script to fix database permissions.",
            )
          }
          throw new Error(`Failed to create founder: ${error.message}`)
        }
        console.log("Founder created:", data)
        toast.success("Founder created successfully!")
      }

      // Force refresh the parent component
      setTimeout(() => {
        if (onSave) {
          onSave()
        }
        onClose()
      }, 500)
    } catch (error: any) {
      console.error("Error saving founder:", error)
      toast.error(error.message || "Failed to save founder")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">{founder ? "Edit Founder" : "Add New Founder"}</CardTitle>
            <CardDescription>{founder ? "Update founder information" : "Create a new founder profile"}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <DirectImageUpload
              selectedImage={formData.image_path}
              onImageSelect={handleImageSelect}
              label="Profile Photo"
            />

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Co-Founder & CEO"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="founder@carbd.com"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+880 1XXX-XXXXXX"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Brief biography and background..."
                rows={4}
                disabled={loading}
              />
            </div>

            {/* Display Order */}
            <div>
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                min="1"
                value={formData.display_order}
                onChange={handleInputChange}
                placeholder="1"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : founder ? (
                  "Update Founder"
                ) : (
                  "Create Founder"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
