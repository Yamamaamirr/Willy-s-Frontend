"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import type { GeofenceData } from "./geofence-manager"
import "mapbox-gl/dist/mapbox-gl.css"
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"



mapboxgl.accessToken =
  "pk.eyJ1IjoibXlhbWFtYWJlMjFpZ2lzIiwiYSI6ImNtM3l1Nzh3NzFteHAycXIwdWpmMjBuMHcifQ.TIPpkag1bufsT3FBntGq_A"

// Custom circle mode for MapboxDraw
const CircleMode = {
  onSetup: function () {
    const circle = {
      type: "Feature",
      properties: {
        isCircle: true,
        center: [],
      },
      geometry: {
        type: "Polygon",
        coordinates: [[]],
      },
    }

    this.updateUIClasses({ mouse: "add" })
    this.setActionableState({
      trash: true,
    })

    return {
      circle,
      currentVertexPosition: 0,
    }
  },

  onClick: function (state, e) {
    // on first click, save center point
    if (state.currentVertexPosition === 0) {
      state.circle.properties.center = [e.lngLat.lng, e.lngLat.lat]
      state.currentVertexPosition = 1
      return
    }

    // on second click, calculate radius and generate circle
    if (state.currentVertexPosition === 1) {
      const center = state.circle.properties.center
      const radius = Math.sqrt(Math.pow(e.lngLat.lng - center[0], 2) + Math.pow(e.lngLat.lat - center[1], 2))

      // Generate circle polygon points
      const steps = 64
      const points = []
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * (2 * Math.PI)
        const lng = center[0] + radius * Math.cos(angle)
        const lat = center[1] + radius * Math.sin(angle)
        points.push([lng, lat])
      }
      // Close the polygon
      points.push(points[0])

      state.circle.geometry.coordinates = [points]
      state.circle.properties.radius = radius

      this.updateUIClasses({ mouse: "pointer" })
      this.changeMode("simple_select", { featureIds: [this.addFeature(state.circle)] })
    }
  },

  onMouseMove: function (state, e) {
    // Only update if we've already set the center point
    if (state.currentVertexPosition === 1) {
      const center = state.circle.properties.center
      const radius = Math.sqrt(Math.pow(e.lngLat.lng - center[0], 2) + Math.pow(e.lngLat.lat - center[1], 2))

      // Generate circle polygon points
      const steps = 64
      const points = []
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * (2 * Math.PI)
        const lng = center[0] + radius * Math.cos(angle)
        const lat = center[1] + radius * Math.sin(angle)
        points.push([lng, lat])
      }
      // Close the polygon
      points.push(points[0])

      state.circle.geometry.coordinates = [points]
      state.circle.properties.radius = radius

      this.updateFeature(state.circle)
    }
  },

  onTrash: function (state) {
    this.deleteFeature([state.circle.id], { silent: true })
    this.changeMode("simple_select")
  },

  toDisplayFeatures: (state, geojson, display) => {
    display(geojson)
  },
}

interface MapComponentProps {
  updateGeofenceData: (data: Partial<GeofenceData>) => void
  styleSettings: GeofenceData["styleSettings"]
  setCoordinates: (coords: [number, number] | null) => void
  setArea: (area: number | null) => void
  errors: Record<string, string>
}

export default function MapComponent({
  updateGeofenceData,
  styleSettings,
  setCoordinates,
  setArea,
  errors,
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const draw = useRef<MapboxDraw | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Force the map container to have a height
    if (mapContainer.current) {
      mapContainer.current.style.height = "100%"
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12", // Changed to streets style for better visibility
      center: [-74.5, 40],
      zoom: 9,
      attributionControl: false, // Hide attribution for cleaner look
    })

    // Add attribution in a more subtle way
    map.current.addControl(
      new mapboxgl.AttributionControl({
        compact: true,
      }),
      "bottom-right",
    )

    // Add custom circle mode to MapboxDraw
    // @ts-ignore - Custom modes are not in the type definitions
    MapboxDraw.modes.draw_circle = CircleMode

    // Initialize draw controls but don't display them
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        line_string: true,
        point: true,
        trash: true,
      },
      // Add custom modes
      modes: {
        ...MapboxDraw.modes,
        // @ts-ignore - Custom modes are not in the type definitions
        draw_circle: CircleMode,
      },
      styles: [
        // Style for the polygon fill
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          paint: {
            "fill-color": styleSettings.fillColor,
            "fill-outline-color": styleSettings.strokeColor,
            "fill-opacity": styleSettings.fillOpacity,
          },
        },
        // Style for the polygon outline
        {
          id: "gl-draw-polygon-stroke-active",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": styleSettings.strokeColor,
            "line-width": styleSettings.strokeWidth,
          },
        },
        // Style for the vertices
        {
          id: "gl-draw-point-point-stroke-active",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]],
          paint: {
            "circle-radius": 5,
            "circle-color": "#fff",
            "circle-stroke-color": styleSettings.strokeColor,
            "circle-stroke-width": 2,
          },
        },
      ],
    })

    // Keep navigation controls in bottom right
    map.current.addControl(
      new mapboxgl.NavigationControl({
        showCompass: false,
      }),
      "bottom-right",
    )

    // Add geolocate control to bottom right
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
      "bottom-right",
    )

    map.current.on("load", () => {
      setMapLoaded(true)

      // Add draw control after map is loaded but hide the UI controls
      if (map.current && draw.current) {
        map.current.addControl(draw.current)

        // Hide the drawing tools UI
        const drawingTools = document.querySelector(".mapboxgl-ctrl-top-left .mapbox-gl-draw_ctrl-group")
        if (drawingTools) {
          ;(drawingTools as HTMLElement).style.display = "none"
        }
      }
    })

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Update map styles when styleSettings change
  useEffect(() => {
    if (!mapLoaded || !draw.current || !map.current) return

    // Since MapboxDraw doesn't have a direct method to update styles after initialization,
    // we need to remove the existing draw control and add a new one with updated styles

    // First, get the current features to preserve them
    const currentFeatures = draw.current.getAll()

    // Remove the existing draw control
    map.current.removeControl(draw.current)

    // Create a new draw control with updated styles
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        line_string: true,
        point: true,
        trash: true,
      },
      // Add custom modes
      modes: {
        ...MapboxDraw.modes,
        // @ts-ignore - Custom modes are not in the type definitions
        draw_circle: CircleMode,
      },
      styles: [
        // Style for the polygon fill
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          paint: {
            "fill-color": styleSettings.fillColor,
            "fill-outline-color": styleSettings.strokeColor,
            "fill-opacity": styleSettings.fillOpacity,
          },
        },
        // Style for the polygon outline
        {
          id: "gl-draw-polygon-stroke-active",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": styleSettings.strokeColor,
            "line-width": styleSettings.strokeWidth,
          },
        },
        // Style for the vertices
        {
          id: "gl-draw-point-point-stroke-active",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]],
          paint: {
            "circle-radius": 5,
            "circle-color": "#fff",
            "circle-stroke-color": styleSettings.strokeColor,
            "circle-stroke-width": 2,
          },
        },
      ],
    })

    // Add the new draw control
    map.current.addControl(draw.current)

    // Hide the drawing tools UI
    const drawingTools = document.querySelector(".mapboxgl-ctrl-top-left .mapbox-gl-draw_ctrl-group")
    if (drawingTools) {
      ;(drawingTools as HTMLElement).style.display = "none"
    }

    // Restore the features
    if (currentFeatures.features.length > 0) {
      draw.current.add(currentFeatures)
    }
  }, [styleSettings, mapLoaded])

  // Handle draw events
  useEffect(() => {
    if (!mapLoaded || !map.current || !draw.current) return

    // Calculate area of a polygon
    const calculateArea = (coordinates: number[][][]) => {
      // Simple calculation for demo purposes
      // In a real app, you'd use turf.js or a similar library for accurate calculations
      let area = 0
      if (coordinates && coordinates[0] && coordinates[0].length > 2) {
        // Very basic polygon area calculation
        const vertices = coordinates[0]
        for (let i = 0; i < vertices.length - 1; i++) {
          area += vertices[i][0] * vertices[i + 1][1] - vertices[i + 1][0] * vertices[i][1]
        }
        area = Math.abs(area) / 2
      }
      return area
    }

    // Update geojson data when a feature is created or updated
    const updateGeojson = () => {
      const features = draw.current?.getAll()
      if (features && features.features.length > 0) {
        const feature = features.features[0] // Just use the first feature for simplicity
        updateGeofenceData({ geojson: feature })

        // Calculate and update area
        if (feature.geometry.type === "Polygon") {
          const area = calculateArea(feature.geometry.coordinates as number[][][])
          setArea(area)
        }
      } else {
        updateGeofenceData({ geojson: null })
        setArea(null)
      }
    }

    // Update coordinates on mouse move (but don't display them)
    const updateCoordinates = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat
      const lngFormatted = Number.parseFloat(lng.toFixed(6))
      const latFormatted = Number.parseFloat(lat.toFixed(6))
      setCoordinates([lngFormatted, latFormatted])
    }

    // Event listeners
    map.current.on("draw.create", updateGeojson)
    map.current.on("draw.update", updateGeojson)
    map.current.on("draw.delete", updateGeojson)
    map.current.on("mousemove", updateCoordinates)

    return () => {
      if (map.current) {
        map.current.off("draw.create", updateGeojson)
        map.current.off("draw.update", updateGeojson)
        map.current.off("draw.delete", updateGeojson)
        map.current.off("mousemove", updateCoordinates)
      }
    }
  }, [mapLoaded, updateGeofenceData, setCoordinates, setArea])

  useEffect(() => {
    if (errors.geojson) {
      setShowErrorPopup(true)
      const timer = setTimeout(() => {
        setShowErrorPopup(false)
      }, 3000) // Show for 3 seconds

      return () => clearTimeout(timer)
    }
  }, [errors.geojson])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" style={{ height: "100%" }} />
      {showErrorPopup && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-xs shadow-md animate-fadeIn">
          {errors.geojson}
        </div>
      )}
      {/* Help tooltip */}
      <div className="absolute top-4 left-4 z-10">
        <div className="relative group">
          <button
            className="bg-[#3064ec] rounded-full w-5 h-5 flex items-center justify-center shadow-sm hover:bg-[#2050c8] focus:outline-none"
            aria-label="Drawing help"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </button>
          <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg p-2.5 text-[10px] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 border border-[#f0f0f0]">
            <div className="flex items-center mb-1.5 pb-1 border-b border-[#f0f0f0]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#3064ec] mr-1"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span className="font-medium text-[#111111]">Map Help</span>
            </div>
            <ul className="space-y-1 text-[#666666]">
              <li className="flex items-start">
                <div className="min-w-3 h-3 mr-1 flex items-center justify-center rounded-full bg-[#3064ec] text-white text-[8px]">
                  1
                </div>
                <span>Use the sidebar to configure your geofence</span>
              </li>
              <li className="flex items-start">
                <div className="min-w-3 h-3 mr-1 flex items-center justify-center rounded-full bg-[#3064ec] text-white text-[8px]">
                  2
                </div>
                <span>Navigation controls are in the bottom right</span>
              </li>
              <li className="flex items-start">
                <div className="min-w-3 h-3 mr-1 flex items-center justify-center rounded-full bg-[#3064ec] text-white text-[8px]">
                  3
                </div>
                <span>Use the location button to find your position</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
