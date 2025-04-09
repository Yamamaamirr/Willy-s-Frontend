"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Clock,
  Car,
} from "lucide-react"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import type { Vehicle } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"

interface VehicleTableProps {
  vehicles: Vehicle[]
  loading: boolean
  sortField: keyof Vehicle
  sortDirection: "asc" | "desc"
  onSort: (field: keyof Vehicle) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function VehicleTable({
  vehicles,
  loading,
  sortField,
  sortDirection,
  onSort,
  currentPage,
  totalPages,
  onPageChange,
}: VehicleTableProps) {
  const [updatedRows, setUpdatedRows] = useState<Record<string, boolean>>({})

  // Track updated rows for highlighting
  useEffect(() => {
    if (!loading) {
      const newUpdatedRows: Record<string, boolean> = {}
      vehicles.forEach((vehicle) => {
        newUpdatedRows[vehicle.id] = true
      })

      setUpdatedRows(newUpdatedRows)

      // Clear highlighting after animation
      const timer = setTimeout(() => {
        setUpdatedRows({})
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [vehicles, loading])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  const isStale = (date: Date) => {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    return date < fiveMinutesAgo
  }

  const getSpeedColor = (speed: number) => {
    if (speed > 80) return "bg-gradient-to-r from-red-500 to-rose-600"
    if (speed > 40) return "bg-gradient-to-r from-amber-500 to-yellow-600"
    return "bg-gradient-to-r from-emerald-500 to-green-600"
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "alarm":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 gap-1 font-medium text-xs py-0.5"
            data-testid="alarm-critical"
          >
            <AlertCircle className="h-3 w-3" />
            Critical
          </Badge>
        )
      case "warning":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400 gap-1 font-medium text-xs py-0.5"
            data-testid="alarm-warning"
          >
            <AlertTriangle className="h-3 w-3" />
            Warning
          </Badge>
        )
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 gap-1 font-medium text-xs py-0.5"
            data-testid="alarm-normal"
          >
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/40 dark:border-gray-800 dark:text-gray-400 gap-1 font-medium text-xs py-0.5"
            data-testid="alarm-idle"
          >
            <Clock className="h-3 w-3" />
            Idle
          </Badge>
        )
    }
  }

  const renderSortIcon = (field: keyof Vehicle) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 ml-1" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 ml-1" />
    )
  }

  const renderSortableHeader = (field: keyof Vehicle, label: string, testId: string) => (
    <TableHead>
      <button onClick={() => onSort(field)} className="flex items-center font-medium text-xs" data-testid={testId}>
        {label}
        {renderSortIcon(field)}
      </button>
    </TableHead>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <TableHead className="text-xs">Plate Number</TableHead>
                    <TableHead className="text-xs">Speed</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">Last Update</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center">
          <Skeleton className="h-8 w-64" />
        </div>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-3">
            <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="mt-4 text-base font-medium">No vehicles found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your filters to find what you're looking for.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                  {renderSortableHeader("plateNumber", "Plate Number", "sort-plate-number")}
                  {renderSortableHeader("speed", "Speed", "sort-speed")}
                  {renderSortableHeader("location", "Location", "sort-location")}
                  <TableHead className="text-xs">Last Update</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => {
                  const isRowStale = isStale(vehicle.lastUpdate)
                  const isRowUpdated = updatedRows[vehicle.id]

                  return (
                    <TableRow
                      key={vehicle.id}
                      className={cn(
                        "text-sm",
                        isRowStale && "text-gray-400",
                        isRowUpdated && "bg-blue-50 dark:bg-blue-900/20",
                        "transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-900/20",
                      )}
                    >
                      <TableCell className="font-medium text-xs">{vehicle.plateNumber}</TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-5 rounded-sm ${getSpeedColor(vehicle.speed)}`} />
                          <span>{vehicle.speed} km/h</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{vehicle.location}</TableCell>
                      <TableCell className="relative text-xs">
                        {formatDate(vehicle.lastUpdate)}
                        {isRowStale && (
                          <span className="ml-2 inline-flex" title="Data may be outdated">
                            <Clock className="h-3 w-3 text-gray-400" />
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{renderStatusBadge(vehicle.status)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground order-2 sm:order-1">
          Showing {vehicles.length} of {totalPages * 20} vehicles
        </div>
        <div className="flex items-center space-x-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            data-testid="prev-page"
            className="border-gray-200 dark:border-gray-800 h-8 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Previous
          </Button>
          <div className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-3 py-1 rounded-md font-medium">
            Page {currentPage} of {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            data-testid="next-page"
            className="border-gray-200 dark:border-gray-800 h-8 text-xs"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
