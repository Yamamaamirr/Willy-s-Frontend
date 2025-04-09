"use client"

import type React from "react"

import { LayoutDashboard, Activity, AlertTriangle, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  activeView: "all" | "active" | "idle" | "alerts"
  setActiveView: (view: "all" | "active" | "idle" | "alerts") => void
  totalVehicles: number
  activeVehicles: number
  alarmVehicles: number
}

export function MobileNav({ activeView, setActiveView, totalVehicles, activeVehicles, alarmVehicles }: MobileNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex items-center justify-around">
        <NavItem
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="All"
          isActive={activeView === "all"}
          onClick={() => setActiveView("all")}
          count={totalVehicles}
        />

        <NavItem
          icon={<Activity className="h-5 w-5" />}
          label="Active"
          isActive={activeView === "active"}
          onClick={() => setActiveView("active")}
          count={activeVehicles}
        />

        <NavItem
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Alerts"
          isActive={activeView === "alerts"}
          onClick={() => setActiveView("alerts")}
          count={alarmVehicles}
          hasAlert={alarmVehicles > 0}
        />

        <NavItem icon={<Settings className="h-5 w-5" />} label="Settings" isActive={false} onClick={() => {}} />
      </div>
    </div>
  )
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
  count?: number
  hasAlert?: boolean
}

function NavItem({ icon, label, isActive, onClick, count, hasAlert }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center py-3 px-4 relative",
        isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
      )}
    >
      <div className="relative">
        {icon}
        {hasAlert && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
      </div>
      <span className="text-xs mt-1">{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "absolute -top-1 right-1 text-xs px-1.5 py-0.5 rounded-full",
            isActive
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}
