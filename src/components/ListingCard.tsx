import { Link } from 'react-router-dom'
import type { Listing } from '../types/listing'

type ListingCardProps = {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const createdAt = new Date(listing.createdAt).toLocaleDateString('bg-BG')
  const totalPhotos = listing.photoUrls.length

  return (
    <article className="group overflow-hidden rounded-2xl border border-amber-100/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-100/70">
      <div className="relative overflow-hidden">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {listing.condition ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
            {listing.condition}
          </span>
        ) : null}
        {totalPhotos > 1 ? (
          <span className="absolute right-3 top-3 rounded-full bg-amber-100/90 px-2.5 py-1 text-xs font-semibold text-amber-900 backdrop-blur">
            {totalPhotos} photos
          </span>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">
            {listing.title}
          </h3>
          <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-sm font-bold text-emerald-800">
            €{listing.price}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-2.5 py-1">{listing.location}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1">Listed {createdAt}</span>
        </div>

        <Link
          to={`/book/${listing.id}`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          View details
        </Link>
      </div>
    </article>
  )
}
