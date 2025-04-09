"use client"

import type React from "react"

import { Car, Activity, Clock, AlertTriangle, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeView: "all" | "active" | "idle" | "alerts"
  setActiveView: (view: "all" | "active" | "idle" | "alerts") => void
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <div className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-md">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">FleetMonitor</span>
        </div>
      </div>

      <div className="flex-1 py-6 px-4">
        <div className="space-y-1">
          <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Dashboard
          </h3>

          <SidebarItem
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="All Vehicles"
            isActive={activeView === "all"}
            onClick={() => setActiveView("all")}
          />

          <SidebarItem
            icon={<Activity className="h-5 w-5" />}
            label="Active Vehicles"
            isActive={activeView === "active"}
            onClick={() => setActiveView("active")}
          />

          <SidebarItem
            icon={<Clock className="h-5 w-5" />}
            label="Idle Vehicles"
            isActive={activeView === "idle"}
            onClick={() => setActiveView("idle")}
          />

          <SidebarItem
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Alerts"
            isActive={activeView === "alerts"}
            onClick={() => setActiveView("alerts")}
            hasAlert={true}
          />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium">
            TC
          </div>
          <div>
            <p className="text-sm font-medium">Transport Coordinator</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
  hasAlert?: boolean
}

function SidebarItem({ icon, label, isActive, onClick, hasAlert }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-2 py-2 text-sm rounded-lg transition-colors",
        isActive
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-400"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
      )}
    >
      <span
        className={cn(
          "p-1 rounded-md",
          isActive
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
        )}
      >
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {hasAlert && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
    </button>
  )
}
