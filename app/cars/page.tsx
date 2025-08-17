"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { CarGrid } from "@/components/cars/car-grid"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import { debounce } from "@/lib/utils"
import toast from "react-hot-toast"
import type { Database } from "@/lib/supabase"

type Car = Database["public"]["Tables"]["cars"]["Row"]

interface Filters {
  search: string
  minPrice: string
  maxPrice: string
  make: string
  minYear: string
  maxYear: string
  inStockOnly: boolean
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    search: "",
    minPrice: "",
    maxPrice: "",
    make: "",
    minYear: "",
    maxYear: "",
    inStockOnly: false,
  })
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [availableMakes, setAvailableMakes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const searchParams = useSearchParams()
  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    const initialSearch = searchParams.get("search") || ""
    if (initialSearch) {
      setFilters((prev) => ({ ...prev, search: initialSearch }))
    }
  }, [searchParams])

  useEffect(() => {
    fetchCars()
    fetchAvailableMakes()
  }, [filters, sortBy, sortOrder, currentPage])

  const fetchCars = async () => {
    setLoading(true)
    try {
      let query = supabase.from("cars").select("*", { count: "exact" })

      // Apply filters
      if (filters.search) {
        query = query.or(
          `make.ilike.%${filters.search}%,model.ilike.%${filters.search}%,year.eq.${Number.parseInt(filters.search) || 0}`,
        )
      }

      if (filters.make) {
        query = query.eq("make", filters.make)
      }

      if (filters.minPrice) {
        query = query.gte("price", Number.parseFloat(filters.minPrice))
      }

      if (filters.maxPrice) {
        query = query.lte("price", Number.parseFloat(filters.maxPrice))
      }

      if (filters.minYear) {
        query = query.gte("year", Number.parseInt(filters.minYear))
      }

      if (filters.maxYear) {
        query = query.lte("year", Number.parseInt(filters.maxYear))
      }

      if (filters.inStockOnly) {
        query = query.gt("stock_quantity", 0)
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" })

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      setCars(data || [])
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
    } catch (error: any) {
      console.error("Error fetching cars:", error)
      toast.error("Failed to fetch cars")
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableMakes = async () => {
    try {
      const { data, error } = await supabase.from("cars").select("make").order("make")

      if (error) throw error

      const makes = [...new Set(data?.map((car) => car.make) || [])]
      setAvailableMakes(makes)
    } catch (error) {
      console.error("Error fetching makes:", error)
    }
  }

  const debouncedSearch = debounce((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }))
    setCurrentPage(1)
  }, 500)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value)
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      minPrice: "",
      maxPrice: "",
      make: "",
      minYear: "",
      maxYear: "",
      inStockOnly: false,
    })
    setCurrentPage(1)
  }

  const hasActiveFilters = Object.values(filters).some((value) =>
    typeof value === "string" ? value !== "" : value === true,
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Browse Cars</h1>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by make, model, or year..."
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  Active
                </Badge>
              )}
            </Button>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Added</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="make">Make</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Make</label>
                <Select
                  value={filters.make}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, make: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any make" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any_make">Any make</SelectItem>
                    {availableMakes.map((make) => (
                      <SelectItem key={make} value={make}>
                        {make}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Min Price</label>
                <Input
                  type="number"
                  placeholder="Min price"
                  value={filters.minPrice}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Price</label>
                <Input
                  type="number"
                  placeholder="Max price"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Year Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min year"
                    value={filters.minYear}
                    onChange={(e) => setFilters((prev) => ({ ...prev, minYear: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max year"
                    value={filters.maxYear}
                    onChange={(e) => setFilters((prev) => ({ ...prev, maxYear: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) => setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">In stock only</span>
              </label>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-6">
        <p className="text-gray-600">
          {loading ? "Loading..." : `Showing ${cars.length} of ${totalPages * ITEMS_PER_PAGE} cars`}
        </p>
      </div>

      {/* Cars Grid */}
      <CarGrid cars={cars} loading={loading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
