"use client"

import { useState, useMemo, useCallback } from "react"
import { Input } from "../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Button } from "../../../components/ui/button"
import { Search, X, SlidersHorizontal } from "lucide-react"
import type { VehicleStatus } from "@/lib/mock-data"
import { Card, CardContent } from "../../../components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion"
import { Badge } from "../../../components/ui/badge"

interface FilterPanelProps {
  filters: {
    status: VehicleStatus | "all"
    region: string
    search: string
  }
  onFilterChange: (filters: {
    status: VehicleStatus | "all"
    region: string
    search: string
  }) => void
  disabled: boolean
  onClose?: () => void
}

export function FilterPanel({ filters, onFilterChange, disabled, onClose = () => {} }: FilterPanelProps) {
  // Memoize regions to prevent recreation on every render
  const regions = useMemo(() => ["North", "South", "East", "West", "Central", "Downtown", "Suburbs"], [])
  
  const [searchInput, setSearchInput] = useState(filters.search)
  const [isExpanded] = useState(false) // Removed unused setter

  // Memoize handlers to prevent unnecessary recreations
  const handleStatusChange = useCallback((value: string) => {
    onFilterChange({
      ...filters,
      status: value as VehicleStatus | "all",
    })
  }, [filters, onFilterChange])

  const handleRegionChange = useCallback((value: string) => {
    onFilterChange({
      ...filters,
      region: value,
    })
  }, [filters, onFilterChange])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }, [])

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({
      ...filters,
      search: searchInput,
    })
  }, [filters, onFilterChange, searchInput])

  const handleClearFilters = useCallback(() => {
    setSearchInput("")
    onFilterChange({
      status: "all",
      region: "all",
      search: "",
    })
  }, [onFilterChange])

  // Memoize derived values
  const hasActiveFilters = useMemo(() => 
    filters.status !== "all" || filters.region !== "all" || filters.search !== "",
    [filters]
  )

  const activeFilterCount = useMemo(() => 
    [filters.status !== "all" ? filters.status : null, 
     filters.region !== "all" ? filters.region : null, 
     filters.search].filter(Boolean).length,
    [filters]
  )

  return (
    <Card className="border shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="md:hidden">
          <Accordion type="single" collapsible value={isExpanded ? "filters" : undefined}>
            <AccordionItem value="filters" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters & Search</span>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 rounded-full">
                      {activeFilterCount}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 px-4 pb-4">
                  <div className="space-y-2">
                    <label htmlFor="mobile-status-filter" className="text-sm font-medium leading-none">
                      Vehicle Status
                    </label>
                    <Select
                      value={filters.status}
                      onValueChange={handleStatusChange}
                      disabled={disabled}
                    >
                      <SelectTrigger id="mobile-status-filter" className="w-full">
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

                  <div className="space-y-2">
                    <label htmlFor="mobile-region-filter" className="text-sm font-medium leading-none">
                      Region
                    </label>
                    <Select
                      value={filters.region}
                      onValueChange={handleRegionChange}
                      disabled={disabled}
                    >
                      <SelectTrigger id="mobile-region-filter" className="w-full">
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

                  <form onSubmit={handleSearchSubmit} className="space-y-2">
                    <label htmlFor="mobile-search-filter" className="text-sm font-medium leading-none">
                      Search
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="mobile-search-filter"
                          type="search"
                          placeholder="Plate number or location"
                          className="pl-8"
                          value={searchInput}
                          onChange={handleSearchChange}
                          disabled={disabled}
                        />
                      </div>
                      <Button type="submit" variant="default" disabled={disabled}>
                        Search
                      </Button>
                    </div>
                  </form>

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      className="flex items-center gap-1 w-full mt-2"
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="hidden md:block p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <h3 className="font-semibold">Filters</h3>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 rounded-full">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close filters</span>
            </Button>
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
              <div className="space-y-2">
                <label htmlFor="status-filter" className="text-sm font-medium leading-none">
                  Vehicle Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={handleStatusChange}
                  disabled={disabled}
                >
                  <SelectTrigger id="status-filter" className="w-full">
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

              <div className="space-y-2">
                <label htmlFor="region-filter" className="text-sm font-medium leading-none">
                  Region
                </label>
                <Select
                  value={filters.region}
                  onValueChange={handleRegionChange}
                  disabled={disabled}
                >
                  <SelectTrigger id="region-filter" className="w-full">
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

              <form onSubmit={handleSearchSubmit} className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <label htmlFor="search-filter" className="text-sm font-medium leading-none">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-filter"
                      type="search"
                      placeholder="Plate number or location"
                      className="pl-8"
                      value={searchInput}
                      onChange={handleSearchChange}
                      disabled={disabled}
                    />
                  </div>
                </div>
                <Button type="submit" variant="default" disabled={disabled}>
                  Search
                </Button>
              </form>
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="flex items-center gap-1"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}