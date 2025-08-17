"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DirectImageUpload } from "./direct-image-upload"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import type { Database } from "@/lib/supabase"

type Car = Database["public"]["Tables"]["cars"]["Row"]

interface CarFormProps {
  car?: Car | null
  onSave: () => void
  onCancel: () => void
}

export function CarForm({ car, onSave, onCancel }: CarFormProps) {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    stock_quantity: 1,
    image_url: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (car) {
      setFormData({
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price,
        stock_quantity: car.stock_quantity,
        image_url: car.image_url || "",
        description: car.description || "",
      })
    }
  }, [car])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.make.trim() || !formData.model.trim()) {
      toast.error("Make and model are required")
      return
    }

    if (formData.price <= 0) {
      toast.error("Price must be greater than 0")
      return
    }

    if (formData.stock_quantity < 0) {
      toast.error("Stock quantity cannot be negative")
      return
    }

    setLoading(true)

    try {
      const carData = {
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: formData.year,
        price: formData.price,
        stock_quantity: formData.stock_quantity,
        image_url: formData.image_url || null, // Ensure null instead of empty string
        description: formData.description.trim() || null,
      }

      console.log("Saving car data:", carData)

      if (car) {
        // Update existing car
        const { error } = await supabase
          .from("cars")
          .update({
            ...carData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", car.id)

        if (error) {
          console.error("Update error:", error)
          if (error.message.includes("row-level security")) {
            throw new Error(
              "Permission denied. Please ensure you're logged in as an admin and RLS policies are configured correctly.",
            )
          }
          throw new Error(`Failed to update car: ${error.message}`)
        }
        toast.success("Car updated successfully!")
      } else {
        // Create new car - use the admin client for better permissions
        const { data, error } = await supabase.from("cars").insert([carData]).select()

        if (error) {
          console.error("Insert error:", error)
          if (error.message.includes("row-level security")) {
            throw new Error(
              "Permission denied. Please run the fix-rls-policies-complete.sql script to fix database permissions.",
            )
          }
          throw new Error(`Failed to create car: ${error.message}`)
        }
        console.log("Car created:", data)
        toast.success("Car created successfully!")
      }

      // Force refresh the parent component
      setTimeout(() => {
        onSave()
      }, 500)
    } catch (error: any) {
      console.error("Error saving car:", error)
      toast.error(error.message || "Failed to save car")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "year" || name === "stock_quantity"
          ? Number.parseInt(value) || 0
          : name === "price"
            ? Number.parseFloat(value) || 0
            : value,
    }))
  }

  const handleImageSelect = (imageUrl: string) => {
    console.log("Image selected for car:", imageUrl)
    setFormData((prev) => ({ ...prev, image_url: imageUrl }))
    toast.success("Image selected! Save the car to apply changes.")
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in-0 duration-300">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-0 animate-in zoom-in-95 duration-300">
        <CardHeader>
          <CardTitle>{car ? "Edit Car" : "Add New Car"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Toyota"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Camry"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="price">Price (BDT) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <DirectImageUpload selectedImage={formData.image_url} onImageSelect={handleImageSelect} label="Car Image" />

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter car description..."
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : car ? "Update Car" : "Add Car"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
