import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { deleteListing, getListingById } from '../lib/listings'
import type { ListingWithPhotos } from '../types/listing'

export function DeleteListingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id } = useParams()
  const [listing, setListing] = useState<ListingWithPhotos | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    let active = true

    getListingById(id)
      .then((record) => {
        if (active) {
          setListing(record)
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
  }, [id])

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        Loading listing...
      </section>
    )
  }

  if (!listing) {
    return (
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">Listing not found</h1>
        <Link to="/dashboard" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
          Return to dashboard
        </Link>
      </section>
    )
  }

  if (!user || listing.ownerId !== user.id) {
    return (
      <section className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">You cannot delete this listing</h1>
        <p className="text-sm text-slate-700">
          Only the owner of this book listing can delete it.
        </p>
        <Link to="/dashboard" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
          Return to dashboard
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-5 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Delete Listing</h1>
      <p className="text-slate-700">
        Are you sure you want to delete <span className="font-semibold">{listing.title}</span>?
      </p>
      <p className="text-sm text-slate-600">
        This action removes the listing record and all uploaded photos from storage.
      </p>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={deleting}
          onClick={async () => {
            if (!id) {
              return
            }

            if (listing.ownerId !== user.id) {
              setError('Only the owner can delete this listing.')
              return
            }

            setDeleting(true)
            setError('')

            try {
              await deleteListing(id)
              navigate('/dashboard')
            } catch (deleteError) {
              setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete listing.')
            } finally {
              setDeleting(false)
            }
          }}
          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {deleting ? 'Deleting...' : 'Confirm delete'}
        </button>

        <Link
          to="/dashboard"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
        >
          Cancel
        </Link>
      </div>
    </section>
  )
}
