"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, User, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { storageService } from "@/lib/storage"
import Image from "next/image"

interface Founder {
  id: string
  name: string
  position: string
  bio: string
  email: string
  phone: string
  image_path: string
  display_order: number
  created_at: string
}

export default function AboutPage() {
  const [founders, setFounders] = useState<Founder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchFounders()
  }, [])

  const fetchFounders = async () => {
    try {
      console.log("Fetching founders from database...")
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("founders")
        .select("*")
        .order("display_order", { ascending: true })

      if (fetchError) {
        console.error("Error fetching founders:", fetchError)
        throw new Error(`Failed to fetch founders: ${fetchError.message}`)
      }

      console.log("Fetched founders:", data?.length || 0)
      console.log("Founders data:", data)

      setFounders(data || [])
    } catch (err: any) {
      console.error("Error in fetchFounders:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchFounders()
    setRefreshing(false)
  }

  const getFounderImageUrl = (imagePath: string, founderName: string) => {
    if (!imagePath || imagePath.trim() === "") {
      console.log(`No image path for ${founderName}, using placeholder`)
      return `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(founderName.charAt(0))}`
    }

    try {
      const imageUrl = storageService.getImageUrl(imagePath)
      console.log(`Generated image URL for ${founderName}:`, imageUrl)
      return imageUrl
    } catch (error) {
      console.error(`Error generating image URL for ${founderName}:`, error)
      return `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(founderName.charAt(0))}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading founders...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-red-800 font-medium mb-2">Error Loading Founders</h3>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <Button onClick={handleRefresh} disabled={refreshing} className="bg-red-600 hover:bg-red-700">
                {refreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  "Try Again"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">About CarBD</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Revolutionizing the automotive industry in Bangladesh with innovative solutions and exceptional service.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              At CarBD, we're committed to transforming how people buy, sell, and experience automobiles in Bangladesh.
              Our platform connects buyers with quality vehicles while providing sellers with the tools they need to
              reach the right customers.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚗</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Vehicles</h3>
                <p className="text-gray-600">Curated selection of reliable and well-maintained vehicles</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Trusted Service</h3>
                <p className="text-gray-600">Transparent processes and exceptional customer support</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                <p className="text-gray-600">Cutting-edge technology to enhance your car buying experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Meet Our Founders</h2>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The visionary leaders driving CarBD's mission to revolutionize the automotive industry in Bangladesh.
            </p>
          </div>

          {founders.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Founders Added Yet</h3>
                <p className="text-gray-600 mb-4">
                  Founder profiles will appear here once they are added by the admin.
                </p>
                <Button onClick={handleRefresh} disabled={refreshing}>
                  {refreshing ? "Checking..." : "Check Again"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {founders.map((founder) => (
                <Card key={founder.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative bg-gray-100">
                    <Image
                      src={getFounderImageUrl(founder.image_path, founder.name) || "/placeholder.svg"}
                      alt={founder.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        console.error(`Image load error for ${founder.name}:`, founder.image_path)
                        const target = e.target as HTMLImageElement
                        target.src = `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(founder.name.charAt(0))}`
                      }}
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{founder.name}</h3>
                      <Badge variant="secondary" className="mb-3">
                        {founder.position}
                      </Badge>
                    </div>

                    {founder.bio && (
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{founder.bio}</p>
                    )}

                    <div className="space-y-2">
                      {founder.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <a href={`mailto:${founder.email}`} className="hover:text-blue-600 transition-colors">
                            {founder.email}
                          </a>
                        </div>
                      )}
                      {founder.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <a href={`tel:${founder.phone}`} className="hover:text-blue-600 transition-colors">
                            {founder.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Debug info for development */}
                    {process.env.NODE_ENV === "development" && (
                      <div className="mt-4 p-2 bg-gray-50 rounded text-xs">
                        <p>
                          <strong>Image Path:</strong> {founder.image_path || "None"}
                        </p>
                        <p>
                          <strong>ID:</strong> {founder.id}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Impact</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Cars Sold</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">Partner Dealers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
