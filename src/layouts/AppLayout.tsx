import { Outlet } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
      <Navbar />
      <main className="mt-6 flex-1 rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-lg shadow-slate-200/60 backdrop-blur sm:p-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}