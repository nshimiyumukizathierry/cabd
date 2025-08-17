"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs } from "@/components/ui/tabs"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { supabase } from "@/lib/supabase"
import { ImageSelector } from "./image-selector"
import {
  CarIcon,
  SparklesIcon,
  BrainIcon,
  CameraIcon,
  TrendingUpIcon,
  XIcon,
  SaveIcon,
  Wand2Icon,
  CpuIcon,
} from "lucide-react"
import toast from "react-hot-toast"
import type { Database } from "@/lib/supabase"

type CarType = Database["public"]["Tables"]["cars"]["Row"]

interface EnhancedCarFormProps {
  car?: CarType | null
  onSave: () => void
  onCancel: () => void
}

const CAR_MAKES = [
  "Aston Martin",
  "Audi",
  "BMW",
  "Ferrari",
  "Ford",
  "Honda",
  "Hyundai",
  "Kia",
  "Lamborghini",
  "Land Rover",
  "Lexus",
  "Mercedes-Benz",
  "Nissan",
  "Porsche",
  "Tesla",
  "Toyota",
  "Volkswagen",
]

const CAR_CATEGORIES = [
  "Sedan",
  "SUV",
  "Coupe",
  "Convertible",
  "Hatchback",
  "Truck",
  "Sports Car",
  "Luxury",
  "Electric",
  "Hybrid",
]

const FUEL_TYPES = ["Gasoline", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"]

export function EnhancedCarForm({ car, onSave, onCancel }: EnhancedCarFormProps) {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    stock_quantity: 1,
    image_url: "",
    description: "",
    // Enhanced fields
    category: "",
    fuel_type: "",
    engine_size: "",
    transmission: "Automatic",
    drivetrain: "FWD",
    color: "",
    mileage: 0,
    condition: "New",
    features: [] as string[],
    is_featured: false,
    discount_percentage: 0,
    warranty_years: 1,
  })
  
  const [loading, setLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [priceAnalysis, setPriceAnalysis] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("basic")

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
        // Set defaults for enhanced fields
        category: car.category || "",
        fuel_type: car.fuel_type || "Gasoline",
        engine_size: car.engine_size || "",
        transmission: car.transmission || "Automatic",
        drivetrain: car.drivetrain || "FWD",
        color: car.color || "",
        mileage: car.mileage || 0,
        condition: car.condition || "New",
        features: car.features || [],
        is_featured: car.is_featured || false,
        discount_percentage: car.discount_percentage || 0,
        warranty_years: car.warranty_years || 1,
      })
    }
  }, [car])

  // AI-powered description generator
  const generateAIDescription = useCallback(async () => {
    if (!formData.make || !formData.model) {
      toast.error("Please enter make and model first")
      return
    }

    const suggestions = [
      `Experience luxury and performance with this stunning ${formData.year} ${formData.make} ${formData.model}.`,
      `Advanced engineering meets sophisticated design in this premium vehicle.`,
      `Featuring cutting-edge technology and exceptional build quality.`,
      `Perfect blend of comfort, style, and reliability for the modern driver.`,
      `State-of-the-art safety features and innovative connectivity options.`
    ]

    setAiSuggestions(suggestions)
    toast.success("AI suggestions generated!")
  }, [formData.make, formData.model, formData.year])

  // Smart pricing analysis
  const analyzePricing = useCallback(async () => {
    if (!formData.make || !formData.model || !formData.year) return

    // Simulate market analysis
    const basePrice = formData.price || 50000
    const analysis = {
      marketAverage: basePrice * (0.9 + Math.random() * 0.2),
      competitorRange: {
        min: basePrice * 0.85,
        max: basePrice * 1.15
      },
      recommendation: basePrice > 100000 ? "Premium positioning" : "Competitive pricing",
      demandLevel: Math.random() > 0.5 ? "High" : "Moderate"
    }

    setPriceAnalysis(analysis)
    toast.success("Market analysis complete!")
  }, [formData.make, formData.model, formData.year, formData.price])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const carData = {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        price: formData.price,
        stock_quantity: formData.stock_quantity,
        image_url: formData.image_url,
        description: formData.description,
        category: formData.category,
        fuel_type: formData.fuel_type,
        engine_size: formData.engine_size,
        transmission: formData.transmission,
        drivetrain: formData.drivetrain,
        color: formData.color,
        mileage: formData.mileage,
        condition: formData.condition,
        features: formData.features,
        is_featured: formData.is_featured,
        discount_percentage: formData.discount_percentage,
        warranty_years: formData.warranty_years,
      }

      if (car) {
        const { error } = await supabase
          .from("cars")
          .update({ ...carData, updated_at: new Date().toISOString() })
          .eq("id", car.id)

        if (error) throw error
        toast.success("Car updated successfully! 🚗✨")
      } else {
        const { error } = await supabase.from("cars").insert(carData)
        if (error) throw error
        toast.success("Car added successfully! 🎉")
      }

      onSave()
    } catch (error: any) {
      console.error("Error saving car:", error)
      toast.error(error.message || "Failed to save car")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in-0 duration-300">
      <Card className="w-full max-w-6xl max-h-[95vh] overflow-hidden bg-white shadow-2xl border-0 animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60\" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fillRule="evenodd"%3E%3Cg fill="%23ffffff" fillOpacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>\
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <CarIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {car ? "Edit Vehicle" : "Add New Vehicle"}
                </div>
                <p className="text-blue-100 mt-1">
                  {car ? "Update vehicle information" : "Create a new listing with AI assistance"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <CardContent className="p-0 max-h-[calc(95vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="grid w-full grid-cols-4 bg-gray-50 m-4 mb-0">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setActiveTab("basic")}
                >
                  <CarIcon className="h-4 w-4" />
                  Basic Info
                </div>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setActiveTab("details")}
                >
                  <CpuIcon className="h-4 w-4" />
                  Specifications
                </div>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setActiveTab("media")}
                >
                  <CameraIcon className="h-4 w-4" />
                  Media & Images
                </div>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setActiveTab("ai")}
                >
                  <BrainIcon className="h-4 w-4" />
                  AI Assistant
                </div>
              </div>

              <div className="p-6">
                {activeTab === "basic" && (
                  <div className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          Make *
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        </Label>
                        <Select value={formData.make} onValueChange={(value) => setFormData({ ...formData, make: value })}>
                          <div className="h-11">
                            <div>{formData.make}</div>
                          </div>
                          <div>
                            {CAR_MAKES.map((make) => (
                              <div key={make} value={make}>{make}</div>
                            ))}
                          </div>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          Model *
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        </Label>
                        <Input
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          required
                          placeholder="e.g., Camry, Model S, 911"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Year *</Label>
                        <Input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          Price *
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={analyzePricing}
                            className="h-6 px-2 text-xs"
                          >
                            <TrendingUpIcon className="h-3 w-3 mr-1" />
                            Analyze
                          </Button>
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                          required
                          placeholder="0.00"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Stock Quantity *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.stock_quantity}
                          onChange={(e) => setFormData({ ...formData, stock_quantity: Number.parseInt(e.target.value) })}
                          required
                          className="h-11"
                        />
                      </div>
                    </div>

                    {priceAnalysis && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUpIcon className="h-5 w-5 text-green-600" />
                            <div className="font-semibold text-green-800">Market Analysis</div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Market Average</div>
                              <div className="font-semibold">${priceAnalysis.marketAverage.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Competitor Range</div>
                              <div className="font-semibold">
                                ${priceAnalysis.competitorRange.min.toLocaleString()} - 
                                ${priceAnalysis.competitorRange.max.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Recommendation</div>
                              <div className="font-semibold text-blue-600">{priceAnalysis.recommendation}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Demand Level</div>
                              <div className={priceAnalysis.demandLevel === "High" ? "default" : "secondary"}>
                                {priceAnalysis.demandLevel}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                          <div>
                            <div>{formData.category}</div>
                          </div>
                          <div>
                            {CAR_CATEGORIES.map((category) => (
                              <div key={category} value={category}>{category}</div>
                            ))}
                          </div>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Fuel Type</Label>
                        <Select value={formData.fuel_type} onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}>
                          <div>
                            <div>{formData.fuel_type}</div>
                          </div>
                          <div>
                            {FUEL_TYPES.map((fuel) => (
                              <div key={fuel} value={fuel}>{fuel}</div>
                            ))}
                          </div>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>Engine Size</Label>
                        <Input
                          value={formData.engine_size}
                          onChange={(e) => setFormData({ ...formData, engine_size: e.target.value })}
                          placeholder="e.g., 2.0L, V8"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Transmission</Label>
                        <Select value={formData.transmission} onValueChange={(value) => setFormData({ ...formData, transmission: value })}>
                          <div>
                            <div>{formData.transmission}</div>
                          </div>
                          <div>
                            <div value="Automatic">Automatic</div>
                            <div value="Manual">Manual</div>
                            <div value="CVT">CVT</div>
                          </div>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Drivetrain</Label>
                        <Select value={formData.drivetrain} onValueChange={(value) => setFormData({ ...formData, drivetrain: value })}>
                          <div>
                            <div>{formData.drivetrain}</div>
                          </div>
                          <div>
                            <div value="FWD">Front-Wheel Drive</div>
                            <div value="RWD">Rear-Wheel Drive</div>
                            <div value="AWD">All-Wheel Drive</div>
                            <div value="4WD">4-Wheel Drive</div>
                          </div>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Featured Vehicle</Label>
                        <Switch
                          checked={formData.is_featured}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Discount Percentage: {formData.discount_percentage}%</Label>
                        <Slider
                          value={[formData.discount_percentage]}
                          onValueChange={(value) => setFormData({ ...formData, discount_percentage: value[0] })}
                          max={50}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Warranty (Years): {formData.warranty_years}</Label>
                        <Slider
                          value={[formData.warranty_years]}
                          onValueChange={(value) => setFormData({ ...formData, warranty_years: value[0] })}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "media" && (
                  <div className="space-y-6 mt-0">
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold flex items-center gap-2">
                        <CameraIcon className="h-5 w-5" />
                        Vehicle Images
                      </Label>
                      <ImageSelector
                        selectedImage={formData.image_url}
                        onImageSelect={(imageUrl) => setFormData({ ...formData, image_url: imageUrl })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Description
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={generateAIDescription}
                          className="h-6 px-2 text-xs"
                        >
                          <Wand2Icon className="h-3 w-3 mr-1" />
                          AI Generate
                        </Button>
                      </Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter detailed car description..."
                        rows={6}
                        className="resize-none"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "ai" && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                      <BrainIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-xl font-semibold mb-2">AI-Powered Assistant</div>
                    <div className="text-gray-600 mb-6">Get intelligent suggestions and market insights</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateAIDescription}
                        className="h-12 flex items-center gap-3 bg-transparent"
                      >
                        <SparklesIcon className="h-5 w-5" />
                        Generate Description
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={analyzePricing}
                        className="h-12 flex items-center gap-3 bg-transparent"
                      >
                        <TrendingUpIcon className="h-5 w-5" />
                        Market Analysis
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Tabs>

            <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
              <Button type="button" variant="outline" onClick={onCancel} className="px-6 bg-transparent">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {car ? "Update Vehicle" : "Add Vehicle"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )\
}
