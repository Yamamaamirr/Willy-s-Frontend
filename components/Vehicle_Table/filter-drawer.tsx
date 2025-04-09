"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Button } from "./ui/button"
import { Search, SlidersHorizontal, RotateCcw, X } from "lucide-react"
import type { VehicleStatus } from "@/lib/mock-data"
import { Badge } from "./ui/badge"

interface FilterDrawerProps {
  filters: {
    status: VehicleStatus | ""
    region: string
    search: string
  }
  onFilterChange: (filters: {
    status: VehicleStatus | ""
    region: string
    search: string
  }) => void
  disabled: boolean
  onClose: () => void
}

export function FilterDrawer({ filters, onFilterChange, disabled, onClose }: FilterDrawerProps) {
  const [searchInput, setSearchInput] = useState(filters.search)
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)

  // Apply search filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  //new test
  // Apply search filter when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFilterChange({
        ...filters,
        search: debouncedSearch,
      })
    }
  }, [debouncedSearch, filters, onFilterChange])

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value as VehicleStatus | "",
    })
  }

  const handleRegionChange = (value: string) => {
    onFilterChange({
      ...filters,
      region: value,
    })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleClearFilters = () => {
    setSearchInput("")
    setDebouncedSearch("")
    onFilterChange({
      status: "",
      region: "",
      search: "",
    })
  }

  const regions = ["North", "South", "East", "West", "Central", "Downtown", "Suburbs"]

  const hasActiveFilters = filters.status !== "" || filters.region !== "" || filters.search !== ""
  const activeFilterCount = [filters.status, filters.region, filters.search].filter(Boolean).length

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full flex items-center justify-center">
            <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-base">Filter Vehicles</h3>
          {hasActiveFilters && (
            <Badge
              variant="outline"
              className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-xs ml-2"
            >
              {activeFilterCount} active
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden flex ml-auto h-8 w-8"  // Changed from 'hidden md:flex'
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close filters</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Vehicle Status
          </label>
          <Select
            value={filters.status}
            onValueChange={handleStatusChange}
            disabled={disabled}
            data-testid="status-filter"
          >
            <SelectTrigger
              id="status-filter"
              className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 h-10 text-sm"
            >
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="alarm">Alarm</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="region-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Region
          </label>
          <Select
            value={filters.region}
            onValueChange={handleRegionChange}
            disabled={disabled}
            data-testid="region-filter"
          >
            <SelectTrigger
              id="region-filter"
              className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 h-10 text-sm"
            >
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="search-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search-filter"
              type="search"
              placeholder="Plate number or location"
              className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 h-10 text-sm"
              value={searchInput}
              onChange={handleSearchChange}
              disabled={disabled}
              data-testid="search-input"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="w-full flex items-center justify-center gap-2 group border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 h-10 text-sm"
            disabled={disabled}
            data-testid="clear-filters"
          >
            <RotateCcw className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
            Reset All Filters
          </Button>
        </div>
      )}
    </div>
  )
}
