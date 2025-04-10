"use client"

import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  FileBarChart,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Car,
  LogOut,
  Menu,
  X,
  Fence,
  UserCog,
  Route,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MainNav() {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: "Dashboard",
      match: (path: string | null) => path === "/dashboard"
    },
    {
      href: "/dashboard/Geofence",
      icon: <Fence className="h-4 w-4" />,
      label: "Geofence",
      match: (path: string | null) => path?.startsWith("/dashboard/Geofence")
    },
    {
      href: "/dashboard/routes",
      icon: <Route className="h-4 w-4" />,
      label: "Routes",
      match: (path: string | null) => path?.startsWith("/dashboard/routes")
    },
    {
      href: "/dashboard/reports",
      icon: <FileBarChart className="h-4 w-4" />,
      label: "Reports",
      match: (path: string | null) => path?.startsWith("/dashboard/reports")
    },
    {
      href: "/dashboard/drivers",
      icon: <UserCog className="h-4 w-4" />,
      label: "Drivers",
      match: (path: string | null) => path?.startsWith("/dashboard/drivers")
    },
    {
      href: "/dashboard/users",
      icon: <Users className="h-4 w-4" />,
      label: "Users",
      match: (path: string | null) => path?.startsWith("/dashboard/users")
    },
    {
      href: "/dashboard/settings",
      icon: <Settings className="h-4 w-4" />,
      label: "Settings",
      match: (path: string | null) => path?.startsWith("/dashboard/settings")
    }
  ]

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-md flex items-center justify-center">
            <Car className="h-4 w-4 text-white" />
          </div>
          {(!isCollapsed || isMobile) && <span className="font-bold text-lg">FleetMonitor</span>}
        </div>
        {isMobile && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMobileOpen(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-6 p-3">
        <div className="space-y-1">
          <div className="px-2 mb-2">
            {(!isCollapsed || isMobile) && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Main Navigation
              </h3>
            )}
            {isCollapsed && !isMobile && <div className="h-4"></div>}
          </div>

          <TooltipProvider delayDuration={0}>
            {navItems.slice(0, 5).map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                isActive={item.match(pathname)}
                isCollapsed={isMobile ? false : isCollapsed}
                setIsMobileOpen={setIsMobileOpen}
                href={item.href}
              />
            ))}
          </TooltipProvider>
        </div>

        <div className="space-y-1">
          <div className="px-2 mb-2">
            {(!isCollapsed || isMobile) && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Administration
              </h3>
            )}
            {isCollapsed && !isMobile && <div className="h-4"></div>}
          </div>

          <TooltipProvider delayDuration={0}>
            {navItems.slice(5).map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                isActive={item.match(pathname)}
                isCollapsed={isMobile ? false : isCollapsed}
                setIsMobileOpen={setIsMobileOpen}
                href={item.href}
              />
            ))}
          </TooltipProvider>
        </div>
      </div>

      <div className="mt-auto p-3">
        <div
          className={cn(
            "flex items-center gap-3 px-2 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 transition-all duration-300",
            isCollapsed && !isMobile ? "justify-center" : "",
          )}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
            TC
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Transport Coordinator</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
            </div>
          )}
          {(!isCollapsed || isMobile) && (
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 h-7 w-7">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {!isMobile && (
        <div className="p-3">
          <Button
            onClick={toggleSidebar}
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2 transition-all duration-300 h-8 text-xs"
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            {!isCollapsed && <span>Collapse</span>}
          </Button>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out z-20",
          isCollapsed ? "w-[60px]" : "w-[220px]",
        )}
      >
        <NavContent />
      </div>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-md flex items-center justify-center">
              <Car className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">FleetMonitor</span>
          </div>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex items-center justify-center">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-full sm:w-[320px]">
              <div className="flex flex-col h-full">
                <NavContent isMobile={true} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  isCollapsed: boolean
  setIsMobileOpen: (open: boolean) => void
  href: string
}

function NavItem({ icon, label, isActive, isCollapsed, setIsMobileOpen, href }: NavItemProps) {
  const handleClick = () => {
    setIsMobileOpen(false)
  }

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 w-full px-2 py-2 text-sm rounded-lg transition-all duration-200",
        isActive
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-400"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
        isCollapsed && "justify-center"
      )}
    >
      <span
        className={cn(
          "transition-all duration-200",
          isActive && "p-1 rounded-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
          isCollapsed && "mx-auto"
        )}
      >
        {icon}
      </span>
      {!isCollapsed && (
        <span className="flex-1 text-left transition-opacity duration-200 ease-in-out text-xs">{label}</span>
      )}
    </div>
  )

  const item = (
    <Link href={href} prefetch={true} onClick={handleClick} className="block">
      {content}
    </Link>
  )

  if (isCollapsed) {
    return (
      <div className="group relative">
        <Tooltip>
          <TooltipTrigger asChild>{item}</TooltipTrigger>
          <TooltipContent 
            side="right" 
            className="rounded-md border border-gray-100 bg-white px-3 py-1.5 text-xs shadow-xl dark:border-gray-700 dark:bg-gray-800"
          >
            <span>{label}</span>
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return <div className="group">{item}</div>
}