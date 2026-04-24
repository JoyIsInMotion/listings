import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { createListing, getUserProfileById, upsertUserContactProfile } from '../lib/listings'

const MAX_FILES = 8

export function CreateSalePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [contactName, setContactName] = useState(user?.name ?? '')
  const [contactPhone, setContactPhone] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user?.id) {
      setContactName('')
      setContactPhone('')
      return
    }

    let active = true

    getUserProfileById(user.id)
      .then((profile) => {
        if (!active) {
          return
        }

        setContactName(profile?.name ?? user.name)
        setContactPhone(profile?.phoneNumber ?? '')
      })
      .catch(() => {
        if (active) {
          setContactName(user.name)
        }
      })

    return () => {
      active = false
    }
  }, [user?.id, user?.name])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!user?.id) {
      setError('You need to be logged in to create a listing.')
      return
    }

    if (!title.trim() || !description.trim() || !price.trim() || !location.trim()) {
      setError('Please fill in all fields.')
      return
    }

    if (!contactName.trim() || !contactPhone.trim()) {
      setError('Please add seller contact name and phone number.')
      return
    }

    const parsedPrice = Number(price)
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError('Price must be a valid positive number.')
      return
    }

    setSubmitting(true)

    try {
      await upsertUserContactProfile({
        id: user.id,
        name: contactName.trim(),
        email: user.email,
        phoneNumber: contactPhone.trim(),
      })

      const created = await createListing(
        {
          title: title.trim(),
          description: description.trim(),
          price: parsedPrice,
          location: location.trim(),
        },
        user.id,
        files,
      )

      if (!created) {
        throw new Error('Book listing was created, but could not be loaded after saving.')
      }

      navigate('/dashboard')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create listing.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Publish Book</h1>
        <p className="text-slate-600">
          Add your book details and upload photos of your book.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-700">Book title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="The Pragmatic Programmer"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-700">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            placeholder="Describe the condition, edition, and pickup options."
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700">Price</span>
            <input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="18.99"
              inputMode="decimal"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700">Location</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Sofia"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            />
          </label>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Seller contact details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700">Contact name</span>
              <input
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                placeholder="Jane Seller"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700">Phone number</span>
              <input
                value={contactPhone}
                onChange={(event) => setContactPhone(event.target.value)}
                placeholder="+359 88 123 4567"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              />
            </label>
          </div>

          <p className="text-xs text-slate-600">
            These contact details are shown in book details to logged-in users.
          </p>
        </div>

        <label className="block space-y-2 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-4">
          <span className="text-sm font-semibold text-amber-900">Add Book photos (max {MAX_FILES})</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              const pickedFiles = Array.from(event.target.files ?? []).slice(0, MAX_FILES)
              setFiles(pickedFiles)
            }}
            className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700"
          />
          <p className="text-xs text-slate-600">
            {files.length > 0
              ? `${files.length} file${files.length === 1 ? '' : 's'} selected`
              : 'Choose clear book photos to increase buyer trust.'}
          </p>
        </label>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Publishing...' : 'Publish listing'}
        </button>
      </form>
    </section>
  )
}
