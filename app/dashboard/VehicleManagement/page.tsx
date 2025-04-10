// app/dashboard/vehicle-management/page.tsx
import VehicleMonitoringDashboard from "@/components/Dashboard/VehicleManagement/vehicle-monitoring-dashboard"

export default function VehicleManagementPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
      <VehicleMonitoringDashboard />
    </main>
  )
}