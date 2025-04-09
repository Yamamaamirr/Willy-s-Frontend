"use client"

import { useState } from "react"
import { MainNav } from "@/components/Navbar/main-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<"dashboard">("dashboard")
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* This will be the shared navbar across all dashboard pages */}
      <MainNav activeView={activeView} setActiveView={setActiveView} />

      {/* This will render the specific content of each dashboard page */}
      <div className="flex-1 overflow-y-auto pt-14 md:pt-0">
        {children}
      </div>
    </div>
  )
}