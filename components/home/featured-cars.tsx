"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { CarCard } from "@/components/cars/car-card"
import toast from "react-hot-toast"
import type { Database } from "@/lib/supabase"

type Car = Database["public"]["Tables"]["cars"]["Row"]

export function FeaturedCars() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedCars()
  }, [])

  const fetchFeaturedCars = async () => {
    try {
      console.log("Fetching featured cars...")

      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .gt("stock_quantity", 0)
        .order("created_at", { ascending: false })
        .limit(6)

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("Featured cars fetched:", data?.length || 0)
      setCars(data || [])
    } catch (error: any) {
      console.error("Error fetching featured cars:", error)

      // More specific error handling
      if (error.message?.includes("Invalid API key")) {
        toast.error("Database connection error. API keys may need updating.")
      } else if (error.message?.includes('relation "cars" does not exist')) {
        toast.error("Database tables not found. Please run the setup scripts.")
      } else if (error.message?.includes("JWT")) {
        toast.error("Authentication error. Please check API keys.")
      } else {
        toast.error(`Failed to load featured cars: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Cars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Cars</h2>
        {cars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">No cars available at the moment.</p>
            <p className="text-sm text-gray-500">Please check back later or contact an administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
