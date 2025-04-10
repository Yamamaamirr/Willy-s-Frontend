"use client"

import { useEffect, useState } from "react"
import type { GeofenceData } from "./geofence-manager"

interface MapFallbackProps {
  updateGeofenceData: (data: Partial<GeofenceData>) => void
  styleSettings: GeofenceData["styleSettings"]
  setCoordinates: (coords: [number, number] | null) => void
  setArea: (area: number | null) => void
  errors: Record<string, string>
}

export default function MapFallback({
  updateGeofenceData,
  styleSettings,
  setCoordinates,
  setArea,
  errors,
}: MapFallbackProps) {
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    setShowError(true)
  }, [])

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-100">
      <div className="text-primary font-medium mb-2">Map Loading Failed</div>
      {showError && (
        <div className="text-secondary text-sm max-w-md text-center px-4">
          Unable to load the map component. This could be due to network issues or browser compatibility.
        </div>
      )}
      <div className="mt-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  )
}
