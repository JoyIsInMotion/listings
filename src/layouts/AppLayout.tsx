import { Outlet } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6">
      <SiteHeader />
      <main className="mt-8 flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Outlet />
      </main>
    </div>
  )
}