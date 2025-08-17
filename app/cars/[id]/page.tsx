"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, ArrowLeft, Share2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"
import { storageService } from "@/lib/storage"
import type { Database } from "@/lib/supabase"

type Car = Database["public"]["Tables"]["cars"]["Row"]

export default function CarDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchCar()
      if (user) {
        checkIfFavorited()
      }
    }
  }, [params.id, user])

  const fetchCar = async () => {
    try {
      const { data, error } = await supabase.from("cars").select("*").eq("id", params.id).single()

      if (error) throw error
      setCar(data)
    } catch (error) {
      console.error("Error fetching car:", error)
      toast.error("Car not found")
      router.push("/cars")
    } finally {
      setLoading(false)
    }
  }

  const checkIfFavorited = async () => {
    if (!user || !params.id) return

    try {
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("car_id", params.id)
        .single()

      setIsFavorited(!!data)
    } catch (error) {
      // Not favorited
    }
  }

  const addToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart")
      router.push("/auth/login")
      return
    }

    if (!car) return

    setIsAddingToCart(true)
    try {
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("car_id", car.id)
        .single()

      if (existingItem) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          car_id: car.id,
          quantity: 1,
        })

        if (error) throw error
      }

      toast.success("Added to cart!")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Please login to add favorites")
      router.push("/auth/login")
      return
    }

    if (!car) return

    try {
      if (isFavorited) {
        const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("car_id", car.id)

        if (error) throw error
        setIsFavorited(false)
        toast.success("Removed from favorites")
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          car_id: car.id,
        })

        if (error) throw error
        setIsFavorited(true)
        toast.success("Added to favorites")
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast.error("Failed to update favorites")
    }
  }

  const shareProduct = async () => {
    if (navigator.share && car) {
      try {
        await navigator.share({
          title: `${car.year} ${car.make} ${car.model}`,
          text: `Check out this ${car.year} ${car.make} ${car.model} for $${car.price.toLocaleString()}`,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied to clipboard!")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  const getImageSrc = () => {
    if (imageError || !car?.image_url) {
      return "/classic-red-convertible.png"
    }
    return storageService.getImageUrl(car.image_url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Car Not Found</h1>
          <Link href="/cars">
            <Button>Browse Cars</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={getImageSrc() || "/placeholder.svg"}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              priority
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {car.year} {car.make} {car.model}
                </h1>
                <p className="text-4xl font-bold text-blue-600 mb-4">${car.price.toLocaleString()}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={shareProduct}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Badge variant={car.stock_quantity > 0 ? "default" : "destructive"}>
                {car.stock_quantity > 0 ? `${car.stock_quantity} in stock` : "Out of stock"}
              </Badge>
              <Badge variant="outline">{car.year}</Badge>
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{car.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Make</p>
                  <p className="font-semibold">{car.make}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="font-semibold">{car.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Year</p>
                  <p className="font-semibold">{car.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Availability</p>
                  <p className="font-semibold">{car.stock_quantity > 0 ? "In Stock" : "Out of Stock"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={addToCart}
              disabled={isAddingToCart || car.stock_quantity === 0}
              className="flex-1"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {car.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
            <Button variant="outline" onClick={toggleFavorite} size="lg">
              <Heart className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>

          {/* Contact Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Need more information?</p>
                <Button variant="outline" size="sm">
                  Contact Dealer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
