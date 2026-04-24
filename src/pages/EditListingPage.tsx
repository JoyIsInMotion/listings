import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getListingById, deleteListingPhotos, updateListing, uploadListingPhotos } from '../lib/listings'
import type { ListingPhoto, ListingWithPhotos } from '../types/listing'

export function EditListingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id } = useParams()
  const [listing, setListing] = useState<ListingWithPhotos | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [photosToDelete, setPhotosToDelete] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    let active = true

    getListingById(id)
      .then((record) => {
        if (!active || !record) {
          return
        }

        setListing(record)
        setTitle(record.title)
        setDescription(record.description)
        setPrice(String(record.price))
        setLocation(record.location)
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

  const selectedDeletePhotos = useMemo(() => {
    if (!listing) {
      return []
    }

    return listing.photos.filter((photo) => photosToDelete[photo.id])
  }, [listing, photosToDelete])

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        Loading listing editor...
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
        <h1 className="text-2xl font-bold text-slate-900">You cannot edit this listing</h1>
        <p className="text-sm text-slate-700">
          Only the owner of this book listing can edit it.
        </p>
        <Link to="/dashboard" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
          Return to dashboard
        </Link>
      </section>
    )
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!id) {
      setError('Missing listing ID.')
      return
    }

    if (listing.ownerId !== user.id) {
      setError('Only the owner can edit this listing.')
      return
    }

    if (!title.trim() || !description.trim() || !price.trim() || !location.trim()) {
      setError('Please fill in all fields.')
      return
    }

    const parsedPrice = Number(price)
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError('Price must be a valid positive number.')
      return
    }

    setSubmitting(true)

    try {
      await updateListing(id, {
        title: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        location: location.trim(),
      })

      if (selectedDeletePhotos.length > 0) {
        await deleteListingPhotos(selectedDeletePhotos)
      }

      if (newFiles.length > 0) {
        const highestSortOrder = listing.photos.reduce(
          (maxOrder, photo) => Math.max(maxOrder, photo.sortOrder),
          0,
        )
        await uploadListingPhotos(id, newFiles, highestSortOrder)
      }

      navigate('/dashboard')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save listing changes.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Edit Listing</h1>
        <p className="text-slate-600">Update details and manage uploaded photos.</p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-700">Book title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-700">Description</span>
          <textarea
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700">Price</span>
            <input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              inputMode="decimal"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700">Location</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            />
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Existing photos</p>
          {listing.photos.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              No photos uploaded yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {listing.photos.map((photo: ListingPhoto) => (
                <label
                  key={photo.id}
                  className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <img
                    src={photo.url}
                    alt={listing.title}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                  <span className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(photosToDelete[photo.id])}
                      onChange={(event) =>
                        setPhotosToDelete((current) => ({
                          ...current,
                          [photo.id]: event.target.checked,
                        }))
                      }
                    />
                    Remove this photo
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <label className="block space-y-2 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-4">
          <span className="text-sm font-semibold text-amber-900">Upload new photos</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setNewFiles(Array.from(event.target.files ?? []))}
            className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700"
          />
          <p className="text-xs text-slate-600">
            {newFiles.length > 0
              ? `${newFiles.length} new file${newFiles.length === 1 ? '' : 's'} selected`
              : 'Select additional photos to append to your listing.'}
          </p>
        </label>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
          <Link
            to="/dashboard"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  )
}
