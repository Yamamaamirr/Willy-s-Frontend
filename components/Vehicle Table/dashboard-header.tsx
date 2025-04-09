"use client"

import { Button } from "./ui/button"
import { RefreshCw, Car } from "lucide-react"
import type { ReactNode } from "react"

interface DashboardHeaderProps {
  onRefresh: () => void
  loading: boolean
  vehicleCount: number
  exportButton: ReactNode
}

export function DashboardHeader({ onRefresh, loading, vehicleCount, exportButton }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-lg border shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <Car className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Vehicle Status Monitoring</h1>
          <p className="text-muted-foreground text-sm">
            Tracking <span className="font-medium">{vehicleCount}</span> vehicles in real-time
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          onClick={onRefresh}
          variant="outline"
          className="flex items-center gap-2 flex-1 sm:flex-auto"
          data-testid="refresh-button"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        {exportButton}
      </div>
    </div>
  )
}
