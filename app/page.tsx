import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect visitors from the homepage to the dashboard
  redirect('/dashboard')
}