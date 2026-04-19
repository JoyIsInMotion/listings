import { useParams } from 'react-router-dom'

export function DeleteListingPage() {
  const { id } = useParams()

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Delete Listing
      </h1>
      <p className="text-slate-600">
        Delete confirmation placeholder for listing ID: <span className="font-medium">{id}</span>
      </p>
    </section>
  )
}
