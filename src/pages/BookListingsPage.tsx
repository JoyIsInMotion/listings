import { useEffect, useMemo, useState } from 'react'
import { ListingCard } from '../components/ListingCard'
import { filterListings, getAllListings } from '../lib/listings'
import type { Listing } from '../types/listing'

const pageSize = 4

export function BookListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let active = true

    getAllListings()
      .then((rows) => {
        if (active) {
          setListings(rows)
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

  const filteredListings = useMemo(() => {
    return filterListings(listings, query)
  }, [listings, query])

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const pagedListings = filteredListings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Browse Books
        </h1>
        <p className="max-w-2xl text-slate-600">
          Search by title or city and browse listings from sellers across Bulgaria.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Search books</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Try: Time Shelter or Sofia"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-slate-300 focus:ring"
          />
        </label>
        <p className="mt-2 text-xs text-slate-600">
          Showing {filteredListings.length} result{filteredListings.length === 1 ? '' : 's'}
        </p>
      </div>

      {loading ? (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          Loading books from marketplace...
        </p>
      ) : pagedListings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {pagedListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          No books found for your search.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
        <p className="text-sm text-slate-600">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage === 1}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage === totalPages}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
