"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import type { GeofenceData } from "./geofence-manager"
import { useMobile } from "@/hooks/use-mobile"
import { Map, ChevronDown } from "lucide-react"
import "./geofence.css"

// Define map styles
const MAP_STYLES = {
  standard: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    label: "Standard",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    label: "Satellite",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    label: "Light",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    label: "Dark",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
}

type MapStyleKey = keyof typeof MAP_STYLES

interface MapComponentProps {
  updateGeofenceData: (data: Partial<GeofenceData>) => void
  styleSettings: GeofenceData["styleSettings"]
  setCoordinates: (coords: [number, number] | null) => void
  setArea: (area: number | null) => void
  errors: Record<string, string>
}

// This is a placeholder component that will be rendered while the map is loading
function MapPlaceholder() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-primary">Loading map...</div>
    </div>
  )
}

// The actual map component that will be dynamically loaded
function MapComponentInner({ updateGeofenceData, styleSettings, setCoordinates, setArea, errors }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const tileLayerRef = useRef<any>(null)
  const drawnItemsRef = useRef<any>(null)
  const drawControlRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [currentStyle, setCurrentStyle] = useState<MapStyleKey>("standard")
  const [showThemeDropdown, setShowThemeDropdown] = useState(false)
  const isMobile = useMobile()
  const styleSettingsRef = useRef(styleSettings)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Update ref when styleSettings change
  useEffect(() => {
    styleSettingsRef.current = styleSettings
  }, [styleSettings])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowThemeDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return

    // Create a script element for Leaflet
    const leafletScript = document.createElement("script")
    leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    leafletScript.async = true

    // Create a link element for Leaflet CSS
    const leafletCss = document.createElement("link")
    leafletCss.rel = "stylesheet"
    leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"

    // Add them to the document
    document.head.appendChild(leafletCss)
    document.body.appendChild(leafletScript)

    // Wait for Leaflet to load
    leafletScript.onload = () => {
      // Now load Leaflet Draw
      const drawScript = document.createElement("script")
      drawScript.src = "https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"
      drawScript.async = true

      // Create a link element for Leaflet Draw CSS
      const drawCss = document.createElement("link")
      drawCss.rel = "stylesheet"
      drawCss.href = "https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css"

      // Add them to the document
      document.head.appendChild(drawCss)
      document.body.appendChild(drawScript)

      // Wait for Leaflet Draw to load
      drawScript.onload = () => {
        // Initialize the map
        initializeMap()
      }
    }

    // Cleanup function
    return () => {
      // Remove the scripts when component unmounts
      if (document.body.contains(leafletScript)) {
        document.body.removeChild(leafletScript)
      }
      // Clean up the map if it exists
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        tileLayerRef.current = null
        drawnItemsRef.current = null
        drawControlRef.current = null
      }
    }
  }, [])

  // Add this function to initialize the map with a custom attribution control
  const initializeMap = () => {
    if (!mapContainer.current || !(window as any).L) return

    const L = (window as any).L

    // Fix Leaflet icon issues
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })

    const map = L.map(mapContainer.current, {
      attributionControl: false,
      zoomControl: false, 
    }).setView([40, -74.5], 9)
    mapRef.current = map

    L.control
      .attribution({
        position: "bottomright",
        prefix: "",
      })
      .addTo(map)

    const zoomControl = L.control
      .zoom({
        position: "topleft",
        zoomInTitle: "Zoom in",
        zoomOutTitle: "Zoom out",
      })
      .addTo(map)

    const tileLayer = L.tileLayer(MAP_STYLES.standard.url, {
      attribution: MAP_STYLES.standard.attribution,
      maxZoom: 19,
    }).addTo(map)
    tileLayerRef.current = tileLayer

    const calculateArea = (layer: any) => {
      let area = 0
      if (layer instanceof L.Polygon) {
        const latLngs = layer.getLatLngs()[0]
        let polygonArea = 0
        for (let i = 0; i < latLngs.length; i++) {
          const j = (i + 1) % latLngs.length
          polygonArea += latLngs[i].lng * latLngs[j].lat
          polygonArea -= latLngs[j].lng * latLngs[i].lat
        }
        // Convert to square kilometers (approximate)
        area = (Math.abs(polygonArea) * 111.32 * 111.32) / 2
      }
      return area
    }

    const drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)
    drawnItemsRef.current = drawnItems

    if (L.Control.Draw) {
      const drawOptions = {
        position: "topleft",
        draw: {
          polyline: {
            shapeOptions: {
              color: styleSettings.strokeColor,
              weight: styleSettings.strokeWidth,
            },
          },
          polygon: {
            allowIntersection: false,
            drawError: {
              color: "#e1e100",
              message: "<strong>Error:</strong> Polygon edges cannot cross!",
            },
            shapeOptions: {
              color: styleSettings.strokeColor,
              fillColor: styleSettings.fillColor,
              fillOpacity: styleSettings.fillOpacity,
              weight: styleSettings.strokeWidth,
            },
          },
          circle: {
            shapeOptions: {
              color: styleSettings.strokeColor,
              fillColor: styleSettings.fillColor,
              fillOpacity: styleSettings.fillOpacity,
              weight: styleSettings.strokeWidth,
            },
          },
          rectangle: {
            shapeOptions: {
              color: styleSettings.strokeColor,
              fillColor: styleSettings.fillColor,
              fillOpacity: styleSettings.fillOpacity,
              weight: styleSettings.strokeWidth,
            },
          },
          marker: true,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItems,
          remove: true,
          edit: {
            selectedPathOptions: {
              maintainColor: true,
              dashArray: "10, 10",
              fillOpacity: 0.5,
            },
          },
        },
      }

      // Add draw control
      const drawControl = new L.Control.Draw(drawOptions)
      map.addControl(drawControl)
      drawControlRef.current = drawControl

      // Make all drawn items selectable and movable by default
      map.on("draw:created", (e) => {
        const layer = e.layer

        // Make the layer draggable if it's a marker
        if (layer instanceof L.Marker) {
          layer.options.draggable = true
        }

        // Apply current style settings to the layer
        if (layer.setStyle) {
          layer.setStyle({
            color: styleSettingsRef.current.strokeColor,
            fillColor: styleSettingsRef.current.fillColor,
            fillOpacity: styleSettingsRef.current.fillOpacity,
            weight: styleSettingsRef.current.strokeWidth,
          })
        }

        // Add the layer to drawnItems
        drawnItems.addLayer(layer)

        // Get all layers as GeoJSON
        const allLayers: any[] = []
        drawnItems.eachLayer((l: any) => {
          allLayers.push(l.toGeoJSON())
        })

        // Create a feature collection
        const featureCollection = {
          type: "FeatureCollection",
          features: allLayers,
        }

        // Update geojson data with the feature collection
        updateGeofenceData({ geojson: featureCollection as any })

        // Calculate and update area - use the last drawn shape for area display
        const area = calculateArea(layer)
        setArea(area)
      })

      // Add event listener for when shapes are edited (moved, vertices changed, etc.)
      map.on("draw:edited", (e) => {
        const layers = e.layers

        // Get all layers as GeoJSON
        const allLayers: any[] = []
        drawnItems.eachLayer((l: any) => {
          allLayers.push(l.toGeoJSON())
        })

        // Create a feature collection
        const featureCollection = {
          type: "FeatureCollection",
          features: allLayers,
        }

        updateGeofenceData({ geojson: featureCollection as any })

        if (layers && layers.getLayers().length > 0) {
          const layer = layers.getLayers()[0]
          const area = calculateArea(layer)
          setArea(area)
        }
      })

      map.on("draw:deleted", (e) => {
        // Get all remaining layers as GeoJSON
        const allLayers: any[] = []
        drawnItems.eachLayer((l: any) => {
          allLayers.push(l.toGeoJSON())
        })

        if (allLayers.length === 0) {
          updateGeofenceData({ geojson: null })
          setArea(null)
        } else {
          // Create a feature collection with remaining features
          const featureCollection = {
            type: "FeatureCollection",
            features: allLayers,
          }

          // Update geojson data with the feature collection
          updateGeofenceData({ geojson: featureCollection as any })

          // Update area with the first remaining shape
          if (drawnItems.getLayers().length > 0) {
            const layer = drawnItems.getLayers()[0]
            const area = calculateArea(layer)
            setArea(area)
          }
        }
      })
    } else {
      console.error("Leaflet Draw is not available")
    }

    // Update coordinates on mouse move
    map.on("mousemove", (e: any) => {
      const { lat, lng } = e.latlng
      const latFormatted = Number.parseFloat(lat.toFixed(6))
      const lngFormatted = Number.parseFloat(lng.toFixed(6))
      setCoordinates([latFormatted, lngFormatted])
    })

    setMapLoaded(true)
  }

  // Function to change map style
  const handleStyleChange = (styleKey: MapStyleKey) => {
    if (!mapLoaded || !mapRef.current || !tileLayerRef.current) return

    if (styleKey !== currentStyle) {
      // Remove current tile layer
      mapRef.current.removeLayer(tileLayerRef.current)

      // Add new tile layer
      const L = (window as any).L
      const newTileLayer = L.tileLayer(MAP_STYLES[styleKey].url, {
        attribution: MAP_STYLES[styleKey].attribution,
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Update tile layer reference
      tileLayerRef.current = newTileLayer

      // Update current style
      setCurrentStyle(styleKey)
    }

    // Close the dropdown
    setShowThemeDropdown(false)
  }

  // Update styles when styleSettings change
  useEffect(() => {
    if (!mapLoaded || !drawnItemsRef.current) return

    // Update styles for all drawn items
    drawnItemsRef.current.eachLayer((layer: any) => {
      if (layer.setStyle) {
        layer.setStyle({
          color: styleSettings.strokeColor,
          fillColor: styleSettings.fillColor,
          fillOpacity: styleSettings.fillOpacity,
          weight: styleSettings.strokeWidth,
        })
      }
    })

    // Update draw control options if it exists
    if (mapRef.current && drawControlRef.current) {
      // Remove existing draw control
      mapRef.current.removeControl(drawControlRef.current)

      // Create new draw control with updated styles
      const L = (window as any).L
      const drawOptions = {
        position: "topleft",
        draw: {
          polyline: {
            shapeOptions: {
              color: styleSettings.strokeColor,
              weight: styleSettings.strokeWidth,
            },
          },
          polygon: {
            allowIntersection: false,
            drawError: {
              color: "#e1e100",
              message: "<strong>Error:</strong> Polygon edges cannot cross!",
            },
            shapeOptions: {
              color: styleSettings.strokeColor,
              fillColor: styleSettings.fillColor,
              fillOpacity: styleSettings.fillOpacity,
              weight: styleSettings.strokeWidth,
            },
          },
          circle: {
            shapeOptions: {
              color: styleSettings.strokeColor,
              fillColor: styleSettings.fillColor,
              fillOpacity: styleSettings.fillOpacity,
              weight: styleSettings.strokeWidth,
            },
          },
          rectangle: {
            shapeOptions: {
              color: styleSettings.strokeColor,
              fillColor: styleSettings.fillColor,
              fillOpacity: styleSettings.fillOpacity,
              weight: styleSettings.strokeWidth,
            },
          },
          marker: true,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItemsRef.current,
          remove: true,
        },
      }

      // Add new draw control
      const drawControl = new L.Control.Draw(drawOptions)
      mapRef.current.addControl(drawControl)
      drawControlRef.current = drawControl
    }
  }, [styleSettings, mapLoaded])

  // Show error popup when there's a geojson error
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
    <div className="relative w-full h-full" style={{ zIndex: 1 }}>
      <div ref={mapContainer} className="absolute inset-0" style={{ height: "100%", zIndex: 1 }} />

      {/* Modern dropdown theme selector - at bottom left with upward opening */}
      <div className="absolute bottom-6 left-6 z-[1000]" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            className={`flex items-center space-x-2 bg-white rounded-md shadow-md px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none border border-gray-200 ${
              isMobile ? "scale-90 origin-bottom-left" : ""
            }`}
            title="Change map style"
          >
            <Map size={isMobile ? 12 : 14} className="text-primary" />
            <span>{MAP_STYLES[currentStyle].label}</span>
            <ChevronDown
              size={isMobile ? 12 : 14}
              className={`transition-transform ${showThemeDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {showThemeDropdown && (
            <div className="absolute bottom-full mb-1 left-0 bg-white rounded-md shadow-lg py-1 min-w-[140px] border border-gray-200">
              {Object.entries(MAP_STYLES).map(([key, style]) => (
                <button
                  key={key}
                  onClick={() => handleStyleChange(key as MapStyleKey)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center space-x-2 hover:bg-gray-50 ${
                    currentStyle === key ? "bg-gray-100 font-medium text-primary" : ""
                  } ${isMobile ? "text-[10px]" : ""}`}
                >
                  <div className={`w-4 h-4 rounded-sm border ${key}-thumbnail`}></div>
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showErrorPopup && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1500] bg-secondary-light/10 border border-secondary text-secondary-dark px-4 py-2 rounded text-xs shadow-md animate:fadeIn">
          {errors.geojson}
        </div>
      )}

      {/* Help tooltip - positioned above zoom controls */}
      <div className="absolute top-4 left-14 z-[1500]" style={{ zIndex: 1 }}>
        <div className="relative group">
          <button
            className="bg-primary rounded-full w-5 h-5 flex items-center justify-center shadow-sm hover:bg-primary-dark focus:outline-none"
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
                className="text-primary mr-1"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span className="font-medium text-[#111111]">Map Help</span>
            </div>
            <ul className="space-y-1 text-[#666666]">
              <li className="flex items-start">
                <div className="min-w-3 h-3 mr-1 flex items-center justify-center rounded-full bg-primary text-white text-[8px]">
                  1
                </div>
                <span>Use the drawing tools on the left to create shapes</span>
              </li>
              <li className="flex items-start">
                <div className="min-w-3 h-3 mr-1 flex items-center justify-center rounded-full bg-primary text-white text-[8px]">
                  2
                </div>
                <span>Change map style using the style selector</span>
              </li>
              <li className="flex items-start">
                <div className="min-w-3 h-3 mr-1 flex items-center justify-center rounded-full bg-primary text-white text-[8px]">
                  3
                </div>
                <span>Configure your geofence in the sidebar</span>
              </li>
              <li className="flex items-start">
                <div className="min-w-3 h-3 mr-1 flex items-center justify-center rounded-full bg-primary text-white text-[8px]">
                  4
                </div>
                <span>Draw multiple shapes to create complex geofences</span>
              </li>
              <li className="flex items-start">
                <div className="min-w-3 h-3 mr-1 flex items-center justify-center rounded-full bg-primary text-white text-[8px]">
                  5
                </div>
                <span>Click the edit tool (pencil icon) to select and move shapes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export a dynamic component that loads only on the client side
export default dynamic(() => Promise.resolve(MapComponentInner), {
  ssr: false,
  loading: MapPlaceholder,
})
