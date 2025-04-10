"use client"

import type React from "react"

import { useState } from "react"
import type { GeofenceData } from "./geofence-manager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface GeofenceFormProps {
  geofenceData: GeofenceData
  updateGeofenceData: (data: Partial<GeofenceData>) => void
  coordinates: [number, number] | null
  area: number | null
  errors: Record<string, string>
  onSubmit: () => void
  isMobile: boolean
}

// Predefined category options
const categoryOptions = [
  { value: "Warehouse", label: "Warehouse" },
  { value: "Restricted", label: "Restricted" },
  { value: "Checkpoint", label: "Checkpoint" },
  { value: "Delivery", label: "Delivery" },
  { value: "Parking", label: "Parking" },
  { value: "Loading", label: "Loading" },
]

export default function GeofenceForm({
  geofenceData,
  updateGeofenceData,
  coordinates,
  area,
  errors,
  onSubmit,
  isMobile,
}: GeofenceFormProps) {
  const [open, setOpen] = useState(false)

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateGeofenceData({ name: e.target.value })
  }

  // Handle alert type change
  const handleAlertTypeChange = (value: string) => {
    updateGeofenceData({ alertType: value as "Entry" | "Exit" | "Both" })
  }

  // Handle category selection
  const toggleCategory = (value: string) => {
    const currentCategories = [...geofenceData.categories]
    const index = currentCategories.indexOf(value)

    if (index === -1) {
      currentCategories.push(value)
    } else {
      currentCategories.splice(index, 1)
    }

    updateGeofenceData({ categories: currentCategories })
  }

  // Handle style settings changes
  const handleStyleChange = (key: keyof GeofenceData["styleSettings"], value: any) => {
    updateGeofenceData({
      styleSettings: {
        ...geofenceData.styleSettings,
        [key]: value,
      },
    })
  }

  return (
    <div className="p-5 h-full overflow-y-auto">
      <h2 className="text-base font-medium text-[#111111] mb-4 pb-2 border-b border-[#f0f0f0]">
        Geofence Configuration
      </h2>

      <div className="space-y-5">
        {/* Name Field */}
        <div>
          <Label htmlFor="name" className="text-xs font-medium text-[#111111] mb-1.5 block">
            Geofence Name
          </Label>
          <Input
            id="name"
            placeholder="ORG-type-location"
            value={geofenceData.name}
            onChange={handleNameChange}
            className={cn(
              "text-xs border-[#d9d9d9] focus:border-[#3064ec] focus:ring-[#3064ec] h-8",
              errors.name ? "border-red-500" : "",
            )}
            aria-invalid={errors.name ? "true" : "false"}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          <p className="text-[#666666] text-xs mt-1">
            Format: ORG-{"{type}"}-{"{location}"}
          </p>
        </div>

        {/* Alert Type */}
        <div>
          <Label className="text-xs font-medium text-[#111111] mb-1.5 block">Alert Type</Label>
          <RadioGroup
            value={geofenceData.alertType}
            onValueChange={handleAlertTypeChange}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center">
              <div className="relative flex items-center justify-center">
                <RadioGroupItem
                  value="Entry"
                  id="entry"
                  className="h-4 w-4 text-[#3064ec] border-[#d9d9d9] focus:ring-[#3064ec] focus:ring-offset-0"
                />
              </div>
              <Label htmlFor="entry" className="cursor-pointer text-xs ml-1.5">
                Entry
              </Label>
            </div>
            <div className="flex items-center">
              <div className="relative flex items-center justify-center">
                <RadioGroupItem
                  value="Exit"
                  id="exit"
                  className="h-4 w-4 text-[#3064ec] border-[#d9d9d9] focus:ring-[#3064ec] focus:ring-offset-0"
                />
              </div>
              <Label htmlFor="exit" className="cursor-pointer text-xs ml-1.5">
                Exit
              </Label>
            </div>
            <div className="flex items-center">
              <div className="relative flex items-center justify-center">
                <RadioGroupItem
                  value="Both"
                  id="both"
                  className="h-4 w-4 text-[#3064ec] border-[#d9d9d9] focus:ring-[#3064ec] focus:ring-offset-0"
                />
              </div>
              <Label htmlFor="both" className="cursor-pointer text-xs ml-1.5">
                Both
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Categories */}
        <div>
          <Label className="text-xs font-medium text-[#111111] mb-1.5 block">Category Tags</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-full justify-between border-[#d9d9d9] text-left font-normal text-xs h-8",
                  errors.categories ? "border-red-500" : "",
                )}
                aria-invalid={errors.categories ? "true" : "false"}
              >
                {geofenceData.categories.length > 0
                  ? `${geofenceData.categories.length} selected`
                  : "Select categories..."}
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search categories..." className="text-xs h-8" />
                <CommandList>
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup>
                    {categoryOptions.map((category) => (
                      <CommandItem
                        key={category.value}
                        value={category.value}
                        onSelect={() => {
                          toggleCategory(category.value)
                        }}
                        className="text-xs"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-3 w-3",
                            geofenceData.categories.includes(category.value)
                              ? "opacity-100 text-[#3064ec]"
                              : "opacity-0",
                          )}
                        />
                        {category.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.categories && <p className="text-red-500 text-xs mt-1">{errors.categories}</p>}

          {geofenceData.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {geofenceData.categories.map((category) => (
                <div
                  key={category}
                  className="bg-[#f0f0f0] text-[#111111] px-2 py-0.5 rounded-full text-xs flex items-center"
                >
                  {category}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="ml-1 text-[#666666] hover:text-[#111111]"
                    aria-label={`Remove ${category} category`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Style Settings Section */}
        <div className="pt-1">
          <h3 className="text-xs font-medium text-[#111111] mb-3 pb-1 border-b border-[#f0f0f0]">Style Settings</h3>

          <div className="space-y-4">
            {/* Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fillColor" className="text-xs font-medium text-[#111111] mb-1.5 block">
                  Fill Color
                </Label>
                <div className="flex">
                  <Input
                    id="fillColor"
                    type="color"
                    value={geofenceData.styleSettings.fillColor}
                    onChange={(e) => handleStyleChange("fillColor", e.target.value)}
                    className="w-8 h-8 p-0.5 border-[#d9d9d9]"
                  />
                  <Input
                    type="text"
                    value={geofenceData.styleSettings.fillColor}
                    onChange={(e) => handleStyleChange("fillColor", e.target.value)}
                    className="ml-2 flex-1 border-[#d9d9d9] text-xs h-8"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="strokeColor" className="text-xs font-medium text-[#111111] mb-1.5 block">
                  Stroke Color
                </Label>
                <div className="flex">
                  <Input
                    id="strokeColor"
                    type="color"
                    value={geofenceData.styleSettings.strokeColor}
                    onChange={(e) => handleStyleChange("strokeColor", e.target.value)}
                    className="w-8 h-8 p-0.5 border-[#d9d9d9]"
                  />
                  <Input
                    type="text"
                    value={geofenceData.styleSettings.strokeColor}
                    onChange={(e) => handleStyleChange("strokeColor", e.target.value)}
                    className="ml-2 flex-1 border-[#d9d9d9] text-xs h-8"
                  />
                </div>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-3">
                <Label htmlFor="fillOpacity" className="text-xs font-medium text-[#111111] flex justify-between mb-1.5">
                  <span>Fill Opacity</span>
                  <span className="text-[#666666]">{geofenceData.styleSettings.fillOpacity.toFixed(2)}</span>
                </Label>
                <Slider
                  id="fillOpacity"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[geofenceData.styleSettings.fillOpacity]}
                  onValueChange={(value) => handleStyleChange("fillOpacity", value[0])}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="strokeWidth" className="text-xs font-medium text-[#111111] flex justify-between mb-1.5">
                  <span>Stroke Width</span>
                  <span className="text-[#666666]">{geofenceData.styleSettings.strokeWidth}px</span>
                </Label>
                <Slider
                  id="strokeWidth"
                  min={1}
                  max={10}
                  step={1}
                  value={[geofenceData.styleSettings.strokeWidth]}
                  onValueChange={(value) => handleStyleChange("strokeWidth", value[0])}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coordinates & Area Section */}
        <div className="pt-1">
          <h3 className="text-xs font-medium text-[#111111] mb-3 pb-1 border-b border-[#f0f0f0]">Geometry Info</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-[#111111] mb-1.5 block">Coordinates</Label>
              <div className="p-2 bg-[#f0f0f0] rounded-md font-mono text-[10px] h-8 flex items-center">
                {coordinates ? (
                  `[${coordinates[0]}, ${coordinates[1]}]`
                ) : (
                  <span className="text-[#666666]">Hover over map</span>
                )}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-[#111111] mb-1.5 block">Area</Label>
              <div className="p-2 bg-[#f0f0f0] rounded-md font-mono text-[10px] h-8 flex items-center">
                {area ? `${area.toFixed(2)} sq units` : <span className="text-[#666666]">Draw a shape</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={onSubmit} className="w-full bg-[#3064ec] hover:bg-[#2050c8] text-white h-9 text-sm">
            Create Geofence
          </Button>
        </div>
      </div>
    </div>
  )
}
