"use client"

import type React from "react"

import { Card, CardContent } from "../../../components/ui/card"
import { TrendingUp, Car, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Progress } from "../../../components/ui/progress"

interface DashboardStatsProps {
  activeVehicles: number
  idleVehicles: number
  alarmVehicles: number
  warningVehicles: number
  totalVehicles: number
}

export function DashboardStats({
  activeVehicles,
  idleVehicles,
  alarmVehicles,
  warningVehicles,
  totalVehicles,
}: DashboardStatsProps) {

  const activePercentage = totalVehicles ? Math.round((activeVehicles / totalVehicles) * 100) : 0
  const idlePercentage = totalVehicles ? Math.round((idleVehicles / totalVehicles) * 100) : 0
  const alertPercentage = totalVehicles ? Math.round(((alarmVehicles + warningVehicles) / totalVehicles) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Fleet"
        value={totalVehicles}
        icon={<Car className="h-4 w-4" />}
        trend={{ value: "+2.5%", up: true, label: "from last month" }}
        color="blue"
      />
      <StatCard
        title="Active Vehicles"
        value={activeVehicles}
        percentage={activePercentage}
        icon={<TrendingUp className="h-4 w-4" />}
        trend={{ value: "+4.3%", up: true, label: "from yesterday" }}
        color="green"
      />
      <StatCard
        title="Idle Vehicles"
        value={idleVehicles}
        percentage={idlePercentage}
        icon={<Clock className="h-4 w-4" />}
        trend={{ value: "-1.2%", up: false, label: "from yesterday" }}
        color="gray"
      />
      <StatCard
        title="Alerts"
        value={alarmVehicles + warningVehicles}
        percentage={alertPercentage}
        icon={<AlertTriangle className="h-4 w-4" />}
        detail={`${alarmVehicles} critical, ${warningVehicles} warnings`}
        color="red"
        alert={alarmVehicles > 0}
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  percentage?: number
  icon: React.ReactNode
  trend?: { value: string; up: boolean; label: string }
  detail?: string
  color: "blue" | "green" | "gray" | "red"
  alert?: boolean
}

function StatCard({ title, value, percentage, icon, trend, detail, color, alert }: StatCardProps) {
  const getGradient = () => {
    switch (color) {
      case "blue":
        return "from-blue-500 to-indigo-600"
      case "green":
        return "from-emerald-500 to-green-600"
      case "gray":
        return "from-gray-500 to-gray-600"
      case "red":
        return "from-red-500 to-rose-600"
    }
  }

  const getIconBg = () => {
    switch (color) {
      case "blue":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
      case "green":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
      case "gray":
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
      case "red":
        return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
    }
  }

  const getProgressColor = () => {
    switch (color) {
      case "blue":
        return "bg-blue-600"
      case "green":
        return "bg-emerald-600"
      case "gray":
        return "bg-gray-600"
      case "red":
        return "bg-red-600"
    }
  }

  const getTrendColor = () => {
    if (!trend) return ""
    return trend.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
  }

  return (
    <Card className="border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className={`h-1 w-full bg-gradient-to-r ${getGradient()}`} />
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline mt-1">
              <h3 className="text-2xl font-bold">{value}</h3>
              {trend && (
                <div className={`ml-2 flex items-center text-xs font-medium ${getTrendColor()}`}>
                  {trend.up ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {trend.value}
                </div>
              )}
            </div>
            {percentage !== undefined && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Fleet percentage</span>
                  <span className="font-medium">{percentage}%</span>
                </div>
                <Progress value={percentage} className={`h-1.5 ${getProgressColor()}`} />
              </div>
            )}
            {detail && <p className="text-xs text-muted-foreground mt-1">{detail}</p>}
            {trend && <p className="text-xs text-muted-foreground mt-1">{trend.label}</p>}
          </div>
          <div className={`rounded-full p-1.5 ${getIconBg()} transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
