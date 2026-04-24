import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ListingCard } from '../components/ListingCard'
import { useAuth } from '../lib/auth'
import { getMyListings } from '../lib/listings'
import type { Listing } from '../types/listing'

export function DashboardPage() {
  const { user } = useAuth()
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setMyListings([])
      setLoading(false)
      return
    }

    let active = true

    getMyListings(user.id)
      .then((listings) => {
        if (active) {
          setMyListings(listings)
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
  }, [user?.id])

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 sm:p-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            My Books
          </h1>
          <p className="text-slate-600">Manage your book listings from here.</p>
        </div>

        <Link
          to="/dashboard/publish"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Create sale
        </Link>
      </div>

      {loading ? (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          Loading your listings...
        </p>
      ) : myListings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {myListings.map((listing) => (
            <div key={listing.id} className="space-y-2">
              <ListingCard listing={listing} />
              <div className="flex gap-2">
                <Link
                  to={`/dashboard/edit/${listing.id}`}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                >
                  Edit
                </Link>
                <Link
                  to={`/dashboard/delete/${listing.id}`}
                  className="rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:border-red-400"
                >
                  Delete
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-600">You do not have any books listed yet.</p>
          <Link
            to="/dashboard/publish"
            className="mt-3 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Add your first listing
          </Link>
        </div>
      )}
    </section>
  )
}
