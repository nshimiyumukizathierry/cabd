"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"

interface FavoriteItem {
  id: string
  car: {
    id: string
    make: string
    model: string
    year: number
    price: number
    stock_quantity: number
    image_url: string | null
    description: string | null
  }
}

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      fetchFavorites()
    }
  }, [user, authLoading, router])

  const fetchFavorites = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          car:cars (
            id,
            make,
            model,
            year,
            price,
            stock_quantity,
            image_url,
            description
          )
        `)
        .eq("user_id", user.id)

      if (error) throw error
      setFavorites(data || [])
    } catch (error) {
      console.error("Error fetching favorites:", error)
      toast.error("Failed to fetch favorites")
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase.from("favorites").delete().eq("id", favoriteId)

      if (error) throw error

      setFavorites((items) => items.filter((item) => item.id !== favoriteId))
      toast.success("Removed from favorites")
    } catch (error) {
      console.error("Error removing favorite:", error)
      toast.error("Failed to remove favorite")
    }
  }

  const addToCart = async (carId: string) => {
    if (!user) return

    try {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("car_id", carId)
        .single()

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id)

        if (error) throw error
      } else {
        // Add new item
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          car_id: carId,
          quantity: 1,
        })

        if (error) throw error
      }

      toast.success("Added to cart!")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart")
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
        <p className="text-gray-600">Cars you've saved for later</p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-4">Start browsing and save cars you like</p>
            <Link href="/cars">
              <Button>Browse Cars</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <Image
                  src={favorite.car.image_url || "/placeholder.svg?height=200&width=300&query=car"}
                  alt={`${favorite.car.make} ${favorite.car.model}`}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => removeFavorite(favorite.id)}
                >
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </Button>
              </div>

              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  {favorite.car.year} {favorite.car.make} {favorite.car.model}
                </h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">${favorite.car.price.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mb-2">Stock: {favorite.car.stock_quantity} available</p>
                {favorite.car.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{favorite.car.description}</p>
                )}

                <div className="flex gap-2">
                  <Link href={`/cars/${favorite.car.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      View Details
                    </Button>
                  </Link>
                  <Button
                    onClick={() => addToCart(favorite.car.id)}
                    disabled={favorite.car.stock_quantity === 0}
                    className="flex-1"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {favorite.car.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
