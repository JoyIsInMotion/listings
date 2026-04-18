import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Page not found
      </h1>
      <p className="text-slate-600">The page you requested does not exist.</p>
      <Link to="/" className="text-sm font-medium text-blue-700 hover:underline">
        Back to browse
      </Link>
    </section>
  )
}
