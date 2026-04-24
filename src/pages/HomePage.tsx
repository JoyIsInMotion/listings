import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ListingCard } from '../components/ListingCard'
import { useAuth } from '../lib/auth'
import { getLatestListings } from '../lib/listings'
import type { Listing } from '../types/listing'

export function HomePage() {
  const { user } = useAuth()
  const [latestListings, setLatestListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    getLatestListings(3)
      .then((listings) => {
        if (active) {
          setLatestListings(listings)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="space-y-10">
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-sky-50 via-cyan-50 to-white p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
            Book Marketplace for Bulgaria
          </span>

          <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Find your next favorite book at a fair local price.
          </h1>

          <p className="max-w-2xl text-slate-600">
            NextRead helps readers discover great second-hand and new books from trusted sellers across Bulgarian cities.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/books"
              className="inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Browse all books
            </Link>
            <Link
              to={user ? '/publish' : '/register'}
              className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Start selling
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">Latest added books</h2>
          <Link to="/books" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
            See all
          </Link>
        </div>

        {loading ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Loading latest books...
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {latestListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
