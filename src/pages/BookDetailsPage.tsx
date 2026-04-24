import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ImageSlider } from '../components/ImageSlider'
import { useAuth } from '../lib/auth'
import { getListingById, getUserProfileById, type UserContactProfile } from '../lib/listings'
import type { ListingWithPhotos } from '../types/listing'

export function BookDetailsPage() {
  const { user } = useAuth()
  const { id } = useParams()
  const [listing, setListing] = useState<ListingWithPhotos | null>(null)
  const [sellerContact, setSellerContact] = useState<UserContactProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingContact, setLoadingContact] = useState(false)

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

  useEffect(() => {
    if (!listing || !user) {
      setSellerContact(null)
      setLoadingContact(false)
      return
    }

    let active = true
    setLoadingContact(true)

    getUserProfileById(listing.ownerId)
      .then((profile) => {
        if (active) {
          setSellerContact(profile)
        }
      })
      .finally(() => {
        if (active) {
          setLoadingContact(false)
        }
      })

    return () => {
      active = false
    }
  }, [listing, user])

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        Loading book details...
      </section>
    )
  }

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
    <article className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start">
      <ImageSlider
        images={listing.photoUrls}
        alt={listing.title}
        className="h-56 w-full sm:h-64 lg:h-[28rem]"
      />

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {listing.title}
          </h1>
          <p className="text-2xl font-extrabold text-emerald-700">€{listing.price}</p>
        </div>

        <dl className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
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

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-base font-bold text-slate-900">Seller contact details</h2>

          {user ? (
            loadingContact ? (
              <p className="text-sm text-slate-600">Loading seller contact details...</p>
            ) : sellerContact ? (
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-slate-700">Name</dt>
                  <dd className="text-slate-600">{sellerContact.name}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Phone</dt>
                  <dd className="text-slate-600">{sellerContact.phoneNumber ?? 'Not provided'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-slate-700">Email</dt>
                  <dd className="text-slate-600">{sellerContact.email}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-slate-600">Seller contact details are not available yet.</p>
            )
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="space-y-2 blur-sm">
                <p className="text-sm text-slate-700">Name: Jane Seller</p>
                <p className="text-sm text-slate-700">Phone: +359 88 123 4567</p>
                <p className="text-sm text-slate-700">Email: seller@example.com</p>
              </div>
              <div className="absolute inset-0 grid place-items-center bg-white/70 p-3 text-center">
                <p className="text-sm font-semibold text-slate-900">
                  Login to see seller&apos;s contact information.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </article>
  )
}
