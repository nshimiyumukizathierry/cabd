"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Eye } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import { storageService } from "@/lib/storage"
import { formatPrice } from "@/lib/utils"
import type { Database } from "@/lib/supabase"

type Car = Database["public"]["Tables"]["cars"]["Row"]

interface CarCardProps {
  car: Car
}

export function CarCard({ car }: CarCardProps) {
  const { user } = useAuth()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (user) {
      checkIfFavorited()
    }
  }, [user, car.id])

  const checkIfFavorited = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("car_id", car.id)
        .single()

      setIsFavorited(!!data)
    } catch (error) {
      // Not favorited
    }
  }

  const getImageSrc = () => {
    if (imageError || !car.image_url) {
      return "/classic-red-convertible.png"
    }

    // Use storage service to get the proper URL from cars bucket
    return storageService.getImageUrl(car.image_url)
  }

  const addToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart")
      return
    }

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
      return
    }

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

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
      <div className="relative overflow-hidden">
        <div className="relative aspect-video bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          <Image
            src={getImageSrc() || "/placeholder.svg"}
            alt={`${car.make} ${car.model}`}
            fill
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onError={() => {
              console.error(`Image load error for car ${car.id}:`, car.image_url)
              setImageError(true)
            }}
            onLoad={() => setImageLoaded(true)}
            priority
          />
        </div>

        {/* Overlay buttons */}
        <div className="absolute top-2 right-2 flex gap-2">
          <Button variant="ghost" size="sm" className="bg-white/90 hover:bg-white shadow-sm" onClick={toggleFavorite}>
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>

        {/* Stock badge */}
        <div className="absolute top-2 left-2">
          <Badge variant={car.stock_quantity > 0 ? "default" : "destructive"}>
            {car.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
          </Badge>
        </div>

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Link href={`/cars/${car.id}`}>
            <Button variant="secondary" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Quick View
            </Button>
          </Link>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold line-clamp-1">
            {car.year} {car.make} {car.model}
          </h3>
          <p className="text-2xl font-bold text-blue-600">{formatPrice(car.price)}</p>
          <p className="text-sm text-gray-600">Stock: {car.stock_quantity} available</p>
          {car.description && <p className="text-sm text-gray-600 line-clamp-2">{car.description}</p>}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Link href={`/cars/${car.id}`} className="flex-1">
          <Button variant="outline" className="w-full bg-transparent">
            View Details
          </Button>
        </Link>
        <Button onClick={addToCart} disabled={isAddingToCart || car.stock_quantity === 0} className="flex-1">
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isAddingToCart ? "Adding..." : car.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  )
}
