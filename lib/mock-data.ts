export type VehicleStatus = "active" | "idle" | "alarm" | "warning"

export interface Vehicle {
  id: string
  plateNumber: string
  speed: number
  location: string
  region: string
  lastUpdate: Date
  status: VehicleStatus
}

// Generate random plate number
const generatePlateNumber = () => {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const numbers = "0123456789"

  let plate = ""

  // Add 3 letters
  for (let i = 0; i < 3; i++) {
    plate += letters.charAt(Math.floor(Math.random() * letters.length))
  }

  plate += " "

  // Add 4 numbers
  for (let i = 0; i < 4; i++) {
    plate += numbers.charAt(Math.floor(Math.random() * numbers.length))
  }

  return plate
}

// Generate random location
const generateLocation = () => {
  const streets = [
    "Main St",
    "Oak Ave",
    "Maple Rd",
    "Broadway",
    "Park Ave",
    "5th Ave",
    "Washington St",
    "Lincoln Rd",
    "Highland Ave",
    "Sunset Blvd",
  ]

  const cities = [
    "Springfield",
    "Riverdale",
    "Oakwood",
    "Maplewood",
    "Lakeside",
    "Hillcrest",
    "Fairview",
    "Georgetown",
    "Kingston",
    "Newport",
  ]

  return `${streets[Math.floor(Math.random() * streets.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}`
}

// Generate random region
const generateRegion = () => {
  const regions = ["North", "South", "East", "West", "Central", "Downtown", "Suburbs"]

  return regions[Math.floor(Math.random() * regions.length)]
}

// Generate random status
const generateStatus = (): VehicleStatus => {
  const statuses: VehicleStatus[] = ["active", "idle", "alarm", "warning"]
  const weights = [0.6, 0.2, 0.1, 0.1] // 60% active, 20% idle, 10% alarm, 10% warning

  const random = Math.random()
  let cumulativeWeight = 0

  for (let i = 0; i < statuses.length; i++) {
    cumulativeWeight += weights[i]
    if (random < cumulativeWeight) {
      return statuses[i]
    }
  }

  return "active" // Default fallback
}

// Generate random date within the last 24 hours
const generateDate = () => {
  const now = new Date()
  const hoursAgo = Math.floor(Math.random() * 24)
  const minutesAgo = Math.floor(Math.random() * 60)
  const secondsAgo = Math.floor(Math.random() * 60)

  return new Date(now.getTime() - hoursAgo * 60 * 60 * 1000 - minutesAgo * 60 * 1000 - secondsAgo * 1000)
}

// Generate mock vehicles data
export const mockVehicles: Vehicle[] = Array.from({ length: 100 }, (_, index) => ({
  id: `vehicle-${index + 1}`,
  plateNumber: generatePlateNumber(),
  speed: Math.floor(Math.random() * 120),
  location: generateLocation(),
  region: generateRegion(),
  lastUpdate: generateDate(),
  status: generateStatus(),
}))
