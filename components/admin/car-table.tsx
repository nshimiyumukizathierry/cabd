"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { storageService } from "@/lib/storage"
import { formatPrice } from "@/lib/utils"
import type { Database } from "@/lib/supabase"

type Car = Database["public"]["Tables"]["cars"]["Row"]

interface CarTableProps {
  cars: Car[]
  onEdit: (car: Car) => void
  onDelete: (car: Car) => void
  loading?: boolean
}

export function CarTable({ cars, onEdit, onDelete, loading }: CarTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-gray-100 animate-pulse rounded">
            <div className="w-20 h-12 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-1/6" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cars.map((car) => (
            <TableRow key={car.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="relative w-20 h-12 rounded overflow-hidden bg-gray-100">
                  <Image
                    src={storageService.getImageUrl(car.image_url || "") || "/classic-red-convertible.png"}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/classic-red-convertible.png"
                    }}
                  />
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {car.make} {car.model}
                  </div>
                  <div className="text-sm text-gray-500">ID: {car.id.slice(0, 8)}...</div>
                </div>
              </TableCell>
              <TableCell>{car.year}</TableCell>
              <TableCell className="font-medium">{formatPrice(car.price)}</TableCell>
              <TableCell>
                <Badge variant={car.stock_quantity > 0 ? "default" : "destructive"}>{car.stock_quantity} units</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={car.stock_quantity > 0 ? "default" : "secondary"}>
                  {car.stock_quantity > 0 ? "Available" : "Out of Stock"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/cars/${car.id}`} target="_blank">
                    <Button variant="ghost" size="sm" title="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(car)} title="Edit">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(car)}
                    title="Delete"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {cars.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No cars found</div>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      )}
    </div>
  )
}
