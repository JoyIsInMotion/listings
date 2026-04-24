import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  return (
    <section className="mx-auto w-full max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Register
        </h1>
        <p className="text-slate-600">Create an account to start listing books.</p>
      </div>

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()
          setError('')
          setMessage('')
          setSubmitting(true)

          try {
            const nextUser = await register(name, email, password)

            if (nextUser) {
              navigate('/dashboard')
              return
            }

            setMessage(
              'Account created. If email confirmation is enabled, check your inbox to finish signing in.',
            )
          } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Unable to create account.')
          } finally {
            setSubmitting(false)
          }
        }}
      >
        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-700">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
        </label>

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
            placeholder="Create a password"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
        </label>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-sky-700 hover:text-sky-800">
          Login
        </Link>
      </p>
    </section>
  )
}
