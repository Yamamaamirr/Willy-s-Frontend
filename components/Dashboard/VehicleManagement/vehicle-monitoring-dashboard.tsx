"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { type Vehicle, type VehicleStatus, mockVehicles } from "@/lib/mock-data"
import { Button } from "../../../components/ui/button"
import { Filter, RefreshCw } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "../../../components/ui/sheet"
import { DashboardStats } from "./dashboard-stats"
import { ExportButton } from "./export-button"
import { FilterDrawer } from "./filter-drawer"
import { VehicleTable } from "./vehicle-table"

export default function VehicleMonitoringDashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Vehicle>("plateNumber")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [activeView, setActiveView] = useState<"dashboard">("dashboard")
  const [filters, setFilters] = useState({
    status: "" as VehicleStatus | "",
    region: "",
    search: "",
  })
  const { toast } = useToast()
  const vehiclesPerPage = 20

  // Simulate fetching data
  useEffect(() => {
    const fetchData = () => {
      setLoading(true)
      // Simulate API call delay
      setTimeout(() => {
        setVehicles(mockVehicles)
        setLoading(false)
      }, 800)
    }

    fetchData()
  }, [])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...vehicles]

    // Apply additional filters
    if (filters.status) {
      result = result.filter((vehicle) => vehicle.status === filters.status)
    }
    if (filters.region) {
      result = result.filter((vehicle) => vehicle.region === filters.region)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (vehicle) =>
          vehicle.plateNumber.toLowerCase().includes(searchLower) ||
          vehicle.location.toLowerCase().includes(searchLower),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
      }

      return 0
    })

    setFilteredVehicles(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [vehicles, filters, sortField, sortDirection, activeView])

  const handleSort = (field: keyof Vehicle) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const handleRefresh = () => {
    setLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      // Simulate some data changes
      const updatedVehicles = vehicles.map((vehicle) => {
        if (Math.random() > 0.7) {
          return {
            ...vehicle,
            speed: Math.floor(Math.random() * 120),
            lastUpdate: new Date(),
            status: Math.random() > 0.8 ? "alarm" : Math.random() > 0.5 ? "active" : "idle",
          }
        }
        return vehicle
      })
      setVehicles(updatedVehicles)
      setLoading(false)
      toast({
        title: "Data refreshed",
        description: "Vehicle data has been updated",
      })
    }, 800)
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage)
  const currentVehicles = filteredVehicles.slice((currentPage - 1) * vehiclesPerPage, currentPage * vehiclesPerPage)

  // Calculate stats
  const activeVehicles = vehicles.filter((v) => v.status === "active").length
  const idleVehicles = vehicles.filter((v) => v.status === "idle").length
  const alarmVehicles = vehicles.filter((v) => v.status === "alarm").length
  const warningVehicles = vehicles.filter((v) => v.status === "warning").length

  const hasActiveFilters = filters.status !== "" || filters.region !== "" || filters.search !== ""
  const activeFilterCount = [filters.status, filters.region, filters.search].filter(Boolean).length

  return (
    <div className="flex h-screen overflow-hidden">

      <div className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Vehicle Status Monitoring</h1>
              <p className="text-muted-foreground">Real-time tracking and monitoring dashboard</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 flex-1 sm:flex-auto relative"
                    data-testid="filter-button"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[400px] p-0">
                  <FilterDrawer filters={filters} onFilterChange={handleFilterChange} disabled={loading} />
                </SheetContent>
              </Sheet>
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="flex items-center gap-2 flex-1 sm:flex-auto"
                data-testid="refresh-button"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <ExportButton vehicles={filteredVehicles} disabled={loading || filteredVehicles.length === 0} />
            </div>
          </div>

          <DashboardStats
            activeVehicles={activeVehicles}
            idleVehicles={idleVehicles}
            alarmVehicles={alarmVehicles}
            warningVehicles={warningVehicles}
            totalVehicles={vehicles.length}
          />

          <VehicleTable
            vehicles={currentVehicles}
            loading={loading}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}
