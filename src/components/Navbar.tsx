import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-slate-900 text-white shadow-sm'
      : 'text-slate-700 hover:bg-white hover:text-slate-900'
  }`

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-4 z-20 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-lg shadow-slate-200/60 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <Link to="/" className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-base font-bold text-white">
          NR
        </span>
        <span className="text-lg font-extrabold tracking-tight text-slate-900">
          NextRead
        </span>
      </Link>

      <nav className="flex flex-wrap items-center gap-2">
        <NavLink to="/" end className={navLinkClassName}>
          Home
        </NavLink>
        <NavLink to="/books" className={navLinkClassName}>
          Browse Books
        </NavLink>

        {user ? (
          <>
            <NavLink to="/dashboard" className={navLinkClassName}>
              My Books
            </NavLink>
            <NavLink to="/dashboard/add" className={navLinkClassName}>
              Create Sale
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={navLinkClassName}>
              Login
            </NavLink>
            <NavLink to="/register" className={navLinkClassName}>
              Register
            </NavLink>
          </>
        )}
      </nav>
    </header>
  )
}
