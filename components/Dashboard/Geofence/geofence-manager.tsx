"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import MapComponent from "./map-component"
import GeofenceForm from "./geofence-form"
import { useMobile } from "@/hooks/use-mobile"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { Feature } from "geojson"
import { cn } from "@/lib/utils"


// Define types for our geofence data
export type GeofenceData = {
  name: string
  alertType: "Entry" | "Exit" | "Both"
  categories: string[]
  styleSettings: {
    fillColor: string
    fillOpacity: number
    strokeColor: string
    strokeWidth: number
  }
  geojson: Feature | null
}

export default function GeofenceManager() {
  const { toast } = useToast()
  const isMobile = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const [geofenceData, setGeofenceData] = useState<GeofenceData>({
    name: "",
    alertType: "Both",
    categories: [],
    styleSettings: {
      fillColor: "#3064ec",
      fillOpacity: 0.3,
      strokeColor: "#3064ec",
      strokeWidth: 2,
    },
    geojson: null,
  })
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [area, setArea] = useState<number | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [isMobile])

  // Update geofence data
  const updateGeofenceData = (data: Partial<GeofenceData>) => {
    setGeofenceData((prev) => ({ ...prev, ...data }))
  }

  // Handle form submission
  const handleSubmit = () => {
    // Validate form data
    const newErrors: Record<string, string> = {}

    // Name validation (ORG-{type}-{location})
    const nameRegex = /^ORG-[a-zA-Z]+-[a-zA-Z0-9]+$/
    if (!geofenceData.name || !nameRegex.test(geofenceData.name)) {
      newErrors.name = "Name must match format: ORG-{type}-{location}"
    }

    // Check if geojson exists
    if (!geofenceData.geojson) {
      newErrors.geojson = "Please draw at least one valid shape on the map"
    }

    // Check if categories are selected
    if (geofenceData.categories.length === 0) {
      newErrors.categories = "Please select at least one category"
    }

    setErrors(newErrors)

    // If no errors, submit the form
    if (Object.keys(newErrors).length === 0) {
      // Here you would typically send the data to your backend
      console.log("Submitting geofence data:", geofenceData)
      toast({
        title: "Geofence Created",
        description: `Successfully created geofence: ${geofenceData.name}`,
      })

      // Close sidebar on mobile after successful submission
      if (isMobile) {
        setSidebarOpen(false)
      }
    }
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Main content area */}
      <div className="absolute inset-0 flex">
        {/* Map container - takes full width */}
        <div className="relative flex-grow h-full">
          <MapComponent
            updateGeofenceData={updateGeofenceData}
            styleSettings={geofenceData.styleSettings}
            setCoordinates={setCoordinates}
            setArea={setArea}
            errors={errors}
          />
        </div>

        {/* Sidebar toggle button (desktop) */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "absolute top-1/2 transform -translate-y-1/2 z-20 bg-white rounded-l-md shadow-md p-1.5 transition-all duration-300 ease-in-out",
            sidebarOpen ? "right-[380px]" : "right-0",
            "focus:outline-none hover:bg-gray-50",
          )}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Sidebar */}
        <div
          className={cn(
            "absolute top-0 bottom-0 right-0 bg-white shadow-lg z-10 transition-transform duration-300 ease-in-out",
            isMobile ? "w-full" : "w-[380px]",
            sidebarOpen ? "translate-x-0" : isMobile ? "translate-x-full" : "translate-x-[380px]",
          )}
        >
          {/* Mobile close button */}
          {isMobile && sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none z-20"
              aria-label="Close sidebar"
            >
              <X size={18} className="text-gray-700" />
            </button>
          )}

          {/* Form container */}
          <div className="h-full overflow-auto">
            <GeofenceForm
              geofenceData={geofenceData}
              updateGeofenceData={updateGeofenceData}
              coordinates={coordinates}
              area={area}
              errors={errors}
              onSubmit={handleSubmit}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
