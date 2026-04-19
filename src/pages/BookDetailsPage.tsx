import { Link, useParams } from 'react-router-dom'
import { mockListings } from '../lib/mockListings'

export function BookDetailsPage() {
  const { id } = useParams()
  const listing = mockListings.find((item) => item.id === id)

  if (!listing) {
    return (
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Book not found
        </h1>
        <Link to="/books" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
          Back to browse books
        </Link>
      </section>
    )
  }

  return (
    <article className="space-y-6">
      <img
        src={listing.imageUrl}
        alt={listing.title}
        className="h-72 w-full rounded-2xl border border-slate-200 object-cover"
      />

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {listing.title}
        </h1>
        <p className="text-2xl font-extrabold text-emerald-700">€{listing.price}</p>
      </div>

      <dl className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-slate-700">Condition</dt>
          <dd className="text-slate-600">{listing.condition}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-700">Location</dt>
          <dd className="text-slate-600">{listing.location}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-700">Created at</dt>
          <dd className="text-slate-600">
            {new Date(listing.createdAt).toLocaleString('bg-BG')}
          </dd>
        </div>
      </dl>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">Description</h2>
        <p className="leading-7 text-slate-700">{listing.description}</p>
      </div>

      <button
        type="button"
        className="inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Contact seller
      </button>
    </article>
  )
}
