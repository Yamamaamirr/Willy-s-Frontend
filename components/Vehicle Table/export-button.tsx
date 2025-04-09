"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Vehicle } from "@/lib/mock-data"

interface ExportButtonProps {
  vehicles: Vehicle[]
  disabled: boolean
}

export function ExportButton({ vehicles, disabled }: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState({
    plateNumber: true,
    speed: true,
    location: true,
    lastUpdate: true,
    status: true,
    region: true,
  })
  const { toast } = useToast()

  const toggleColumn = (column: keyof typeof selectedColumns) => {
    setSelectedColumns({
      ...selectedColumns,
      [column]: !selectedColumns[column],
    })
  }

  const handleExport = () => {
    try {
      // Create CSV header
      const headers: string[] = []
      if (selectedColumns.plateNumber) headers.push("Plate Number")
      if (selectedColumns.speed) headers.push("Speed (km/h)")
      if (selectedColumns.location) headers.push("Location")
      if (selectedColumns.region) headers.push("Region")
      if (selectedColumns.lastUpdate) headers.push("Last Update")
      if (selectedColumns.status) headers.push("Status")

      // Create CSV rows
      const rows = vehicles.map((vehicle) => {
        const row: string[] = []
        if (selectedColumns.plateNumber) row.push(vehicle.plateNumber)
        if (selectedColumns.speed) row.push(vehicle.speed.toString())
        if (selectedColumns.location) row.push(vehicle.location)
        if (selectedColumns.region) row.push(vehicle.region)
        if (selectedColumns.lastUpdate) row.push(new Date(vehicle.lastUpdate).toLocaleString())
        if (selectedColumns.status) row.push(vehicle.status)
        return row.join(",")
      })

      // Combine header and rows
      const csv = [headers.join(","), ...rows].join("\n")

      // Create and download the file
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `vehicle-data-${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setOpen(false)
      toast({
        title: "Export successful",
        description: `Exported ${vehicles.length} vehicle records to CSV`,
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting the data",
        variant: "destructive",
      })
    }
  }

  const atLeastOneSelected = Object.values(selectedColumns).some((value) => value)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="flex items-center gap-2 flex-1 sm:flex-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-9 text-sm"
          disabled={disabled}
          data-testid="export-button"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export to CSV</DialogTitle>
          <DialogDescription>Select the columns you want to include in the export</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="plateNumber"
              checked={selectedColumns.plateNumber}
              onCheckedChange={() => toggleColumn("plateNumber")}
              data-testid="export-column-plateNumber"
              className="h-4 w-4"
            />
            <Label htmlFor="plateNumber" className="text-sm">
              Plate Number
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="speed"
              checked={selectedColumns.speed}
              onCheckedChange={() => toggleColumn("speed")}
              data-testid="export-column-speed"
              className="h-4 w-4"
            />
            <Label htmlFor="speed" className="text-sm">
              Speed
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="location"
              checked={selectedColumns.location}
              onCheckedChange={() => toggleColumn("location")}
              data-testid="export-column-location"
              className="h-4 w-4"
            />
            <Label htmlFor="location" className="text-sm">
              Location
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="region"
              checked={selectedColumns.region}
              onCheckedChange={() => toggleColumn("region")}
              data-testid="export-column-region"
              className="h-4 w-4"
            />
            <Label htmlFor="region" className="text-sm">
              Region
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lastUpdate"
              checked={selectedColumns.lastUpdate}
              onCheckedChange={() => toggleColumn("lastUpdate")}
              data-testid="export-column-lastUpdate"
              className="h-4 w-4"
            />
            <Label htmlFor="lastUpdate" className="text-sm">
              Last Update
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="status"
              checked={selectedColumns.status}
              onCheckedChange={() => toggleColumn("status")}
              data-testid="export-column-status"
              className="h-4 w-4"
            />
            <Label htmlFor="status" className="text-sm">
              Status
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleExport}
            disabled={!atLeastOneSelected}
            data-testid="confirm-export"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm"
          >
            Export {vehicles.length} Records
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
