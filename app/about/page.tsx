"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Users, Target, Award } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { storageService } from "@/lib/storage"
import type { Database } from "@/lib/supabase"

type Founder = Database["public"]["Tables"]["founders"]["Row"]

// Demo founders data
const DEMO_FOUNDERS: Founder[] = [
  {
    id: "founder-1",
    name: "John Smith",
    position: "CEO & Founder",
    bio: "Visionary leader with 15+ years in automotive industry. Passionate about revolutionizing car buying experience through technology and exceptional customer service.",
    email: "john@carbd.com",
    phone: "+1 (555) 123-4567",
    image_path: "founder-1.jpg",
    display_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "founder-2",
    name: "Sarah Johnson",
    position: "CTO & Co-Founder",
    bio: "Technology expert with deep expertise in e-commerce platforms and automotive systems. Leads our technical innovation and platform development.",
    email: "sarah@carbd.com",
    phone: "+1 (555) 123-4568",
    image_path: "founder-2.jpg",
    display_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "founder-3",
    name: "Michael Chen",
    position: "Head of Operations",
    bio: "Operations specialist with extensive experience in automotive logistics and supply chain management. Ensures smooth operations and customer satisfaction.",
    email: "michael@carbd.com",
    phone: "+1 (555) 123-4569",
    image_path: "founder-3.jpg",
    display_order: 3,
    created_at: new Date().toISOString(),
  },
]

export default function AboutPage() {
  const [founders, setFounders] = useState<Founder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFounders()
  }, [])

  const fetchFounders = async () => {
    try {
      console.log("Fetching founders...")

      const { data, error } = await supabase.from("founders").select("*").order("display_order", { ascending: true })

      if (error) {
        console.error("Error fetching founders:", error)
        // Fall back to demo data
        setFounders(DEMO_FOUNDERS)
        setLoading(false)
        return
      }

      console.log("Founders fetched:", data?.length || 0)

      // If no data from database, show demo founders
      if (!data || data.length === 0) {
        console.log("No founders in database, showing demo founders")
        setFounders(DEMO_FOUNDERS)
      } else {
        setFounders(data)
      }
    } catch (error: any) {
      console.error("Error fetching founders:", error)
      // Always fall back to demo founders on error
      setFounders(DEMO_FOUNDERS)
    } finally {
      setLoading(false)
    }
  }

  const getFounderImageUrl = (imagePath: string | null) => {
    if (!imagePath) {
      return "/placeholder-user.jpg"
    }
    return storageService.getImageUrl(imagePath)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About CarBD</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Revolutionizing the car buying experience with cutting-edge technology and exceptional customer service
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                <span className="text-lg">10,000+ Happy Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-6 w-6" />
                <span className="text-lg">500+ Cars Sold</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6" />
                <span className="text-lg">5 Years Experience</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                At CarBD, we believe that buying a car should be an exciting and transparent experience. Our mission is
                to revolutionize the automotive industry by providing a seamless, trustworthy, and customer-centric
                platform that connects buyers with their perfect vehicles.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We leverage cutting-edge technology, comprehensive vehicle information, and exceptional customer service
                to ensure every customer finds exactly what they're looking for at the best possible price.
              </p>
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-gray-600">Serving customers nationwide with local expertise</span>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.jpg"
                alt="CarBD Mission"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape our commitment to excellence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer First</h3>
              <p className="text-gray-600">
                Every decision we make is centered around providing the best possible experience for our customers
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparency</h3>
              <p className="text-gray-600">
                We believe in complete honesty and transparency in all our dealings and vehicle information
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in every aspect of our service, from technology to customer support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our experienced team is dedicated to revolutionizing the car buying experience
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {founders.map((founder) => (
                <Card key={founder.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative aspect-square">
                      <Image
                        src={getFounderImageUrl(founder.image_path) || "/placeholder-user.jpg"}
                        alt={founder.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder-user.jpg"
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{founder.name}</h3>
                        <Badge variant="secondary">{founder.display_order}</Badge>
                      </div>
                      <p className="text-blue-600 font-medium mb-3">{founder.position}</p>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{founder.bio}</p>
                      <div className="space-y-2">
                        {founder.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="h-4 w-4" />
                            <a href={`mailto:${founder.email}`} className="hover:text-blue-600">
                              {founder.email}
                            </a>
                          </div>
                        )}
                        {founder.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="h-4 w-4" />
                            <a href={`tel:${founder.phone}`} className="hover:text-blue-600">
                              {founder.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Car?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found their dream cars with CarBD
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/cars"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Cars
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
