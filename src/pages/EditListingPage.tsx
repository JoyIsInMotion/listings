import { useParams } from 'react-router-dom'

export function EditListingPage() {
  const { id } = useParams()

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Edit Listing
      </h1>
      <p className="text-slate-600">
        Edit form placeholder for listing ID: <span className="font-medium">{id}</span>
      </p>
    </section>
  )
}
