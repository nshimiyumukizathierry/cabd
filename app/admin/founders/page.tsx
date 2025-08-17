"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { storageService } from "@/lib/storage"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FounderForm } from "@/components/admin/founder-form"
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog"
import { Plus, Edit, Trash2, User, Mail, Phone } from "lucide-react"
import toast from "react-hot-toast"
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
}

function AdminFoundersContent() {
  const [founders, setFounders] = useState<Founder[]>([])
  const [loading, setLoading] = useState(true)
  const [showFounderForm, setShowFounderForm] = useState(false)
  const [editingFounder, setEditingFounder] = useState<Founder | null>(null)
  const [deletingFounder, setDeletingFounder] = useState<Founder | null>(null)

  useEffect(() => {
    fetchFounders()
  }, [])

  const fetchFounders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("founders").select("*").order("display_order", { ascending: true })

      if (error) {
        console.error("Error fetching founders:", error)
        throw error
      }

      console.log("Fetched founders:", data)
      setFounders(data || [])
    } catch (error: any) {
      console.error("Error fetching founders:", error)
      toast.error("Failed to fetch founders")
    } finally {
      setLoading(false)
    }
  }

  const handleFounderSaved = () => {
    fetchFounders()
    setShowFounderForm(false)
    setEditingFounder(null)
  }

  const handleEdit = (founder: Founder) => {
    setEditingFounder(founder)
    setShowFounderForm(true)
  }

  const handleDelete = async () => {
    if (!deletingFounder) return

    try {
      // Delete image from storage if exists
      if (deletingFounder.image_path) {
        try {
          await storageService.deleteImage(deletingFounder.image_path)
        } catch (error) {
          console.error("Error deleting image:", error)
          // Continue with founder deletion even if image deletion fails
        }
      }

      const { error } = await supabase.from("founders").delete().eq("id", deletingFounder.id)

      if (error) throw error

      toast.success("Founder deleted successfully")
      fetchFounders()
    } catch (error: any) {
      console.error("Error deleting founder:", error)
      toast.error("Failed to delete founder")
    } finally {
      setDeletingFounder(null)
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
                  <h1 className="text-3xl font-bold text-gray-900">Founders Management</h1>
                  <p className="text-gray-600 mt-2">Manage company founders and leadership team</p>
                </div>
                <Button onClick={() => setShowFounderForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Founder
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Company Founders ({founders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4" />
                        <div className="h-6 bg-gray-200 rounded mb-2" />
                        <div className="h-4 bg-gray-200 rounded mb-4" />
                        <div className="h-20 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                ) : founders.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No founders yet</h3>
                    <p className="text-gray-500 mb-4">Get started by adding your first founder.</p>
                    <Button onClick={() => setShowFounderForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Founder
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {founders.map((founder) => (
                      <Card key={founder.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200 border-4 border-blue-100">
                              {founder.image_path ? (
                                <Image
                                  src={storageService.getImageUrl(founder.image_path) || "/placeholder.svg"}
                                  alt={founder.name}
                                  width={96}
                                  height={96}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg?height=96&width=96&text=" + founder.name.charAt(0)
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-2xl font-bold">
                                  {founder.name.charAt(0)}
                                </div>
                              )}
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">{founder.name}</h3>
                            <p className="text-blue-600 font-semibold mb-3">{founder.position}</p>

                            {founder.bio && <p className="text-gray-600 text-sm mb-4 line-clamp-3">{founder.bio}</p>}

                            <div className="space-y-2 text-sm mb-4">
                              {founder.email && (
                                <div className="flex items-center justify-center text-gray-600">
                                  <Mail className="h-3 w-3 mr-2" />
                                  <span className="truncate">{founder.email}</span>
                                </div>
                              )}
                              {founder.phone && (
                                <div className="flex items-center justify-center text-gray-600">
                                  <Phone className="h-3 w-3 mr-2" />
                                  <span>{founder.phone}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-center space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(founder)}>
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletingFounder(founder)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Founder Form Modal */}
      {showFounderForm && (
        <FounderForm
          founder={editingFounder}
          onClose={() => {
            setShowFounderForm(false)
            setEditingFounder(null)
          }}
          onSave={handleFounderSaved}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deletingFounder}
        onConfirm={handleDelete}
        onCancel={() => setDeletingFounder(null)}
        title="Delete Founder"
        description={`Are you sure you want to delete ${deletingFounder?.name}? This action cannot be undone.`}
      />
    </div>
  )
}

export default function AdminFounders() {
  return (
    <AdminGuard>
      <AdminFoundersContent />
    </AdminGuard>
  )
}
