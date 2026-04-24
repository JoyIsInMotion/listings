import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

type LocationState = {
  from?: string
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as LocationState | null)?.from ?? '/dashboard'

  return (
    <section className="mx-auto w-full max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Login
        </h1>
        <p className="text-slate-600">Sign in to manage your books and listings.</p>
      </div>

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()
          setError('')
          setSubmitting(true)

          try {
            const nextUser = await login(email, password)
            if (!nextUser) {
              throw new Error('Sign in succeeded, but no session was returned.')
            }
            navigate(from, { replace: true })
          } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Unable to sign in.')
          } finally {
            setSubmitting(false)
          }
        }}
      >
        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seller@example.com"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
        </label>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {submitting ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        No account yet?{' '}
        <Link to="/register" className="font-semibold text-sky-700 hover:text-sky-800">
          Register
        </Link>
      </p>
    </section>
  )
}
