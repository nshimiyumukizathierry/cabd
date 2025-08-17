"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CarTable } from "@/components/admin/car-table"
import { CarForm } from "@/components/admin/car-form"
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog"
import { Plus, Search, Filter } from "lucide-react"
import toast from "react-hot-toast"
import type { Database } from "@/lib/supabase"

type Car = Database["public"]["Tables"]["cars"]["Row"]

function AdminCarsContent() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCarForm, setShowCarForm] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [deletingCar, setDeletingCar] = useState<Car | null>(null)

  useEffect(() => {
    fetchCars()
  }, [searchQuery])

  const fetchCars = async () => {
    try {
      let query = supabase.from("cars").select("*").order("created_at", { ascending: false })

      if (searchQuery) {
        query = query.or(`make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setCars(data || [])
    } catch (error) {
      console.error("Error fetching cars:", error)
      toast.error("Failed to fetch cars")
    } finally {
      setLoading(false)
    }
  }

  const handleCarSaved = () => {
    fetchCars()
    setShowCarForm(false)
    setEditingCar(null)
  }

  const handleEdit = (car: Car) => {
    setEditingCar(car)
    setShowCarForm(true)
  }

  const handleDelete = async () => {
    if (!deletingCar) return

    try {
      const { error } = await supabase.from("cars").delete().eq("id", deletingCar.id)

      if (error) throw error

      toast.success("Car deleted successfully")
      fetchCars()
    } catch (error) {
      console.error("Error deleting car:", error)
      toast.error("Failed to delete car")
    } finally {
      setDeletingCar(null)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Car Management</h1>
                  <p className="text-gray-600 mt-2">Manage your vehicle inventory</p>
                </div>
                <Button onClick={() => setShowCarForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Car
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search cars by make or model..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Vehicle Inventory ({cars.length} cars)</CardTitle>
              </CardHeader>
              <CardContent>
                <CarTable cars={cars} onEdit={handleEdit} onDelete={setDeletingCar} loading={loading} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Car Form Modal */}
      {showCarForm && (
        <CarForm
          car={editingCar}
          onSave={handleCarSaved}
          onCancel={() => {
            setShowCarForm(false)
            setEditingCar(null)
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deletingCar}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCar(null)}
        title="Delete Car"
        description={`Are you sure you want to delete ${deletingCar?.year} ${deletingCar?.make} ${deletingCar?.model}? This action cannot be undone.`}
      />
    </div>
  )
}

export default function AdminCars() {
  return (
    <AdminGuard>
      <AdminCarsContent />
    </AdminGuard>
  )
}
