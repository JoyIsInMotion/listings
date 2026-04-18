import { Link, NavLink } from 'react-router-dom'

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-slate-900 text-white'
      : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
  }`

export function SiteHeader() {
  return (
    <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <Link to="/" className="text-lg font-semibold text-slate-900">
        Book Listings
      </Link>

      <nav className="flex items-center gap-2">
        <NavLink to="/" end className={navLinkClassName}>
          Browse
        </NavLink>
        <NavLink to="/listings/new" className={navLinkClassName}>
          Publish
        </NavLink>
        <NavLink to="/login" className={navLinkClassName}>
          Login
        </NavLink>
      </nav>
    </header>
  )
}
