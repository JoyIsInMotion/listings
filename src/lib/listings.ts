import { supabase } from './supabase'
import type { Listing, ListingInput, ListingPhoto, ListingWithPhotos } from '../types/listing'

type ListingRow = {
  id: number
  owner_id: string
  title: string
  description: string
  price: number
  location: string
  created_at: string
  updated_at: string
  listing_photos: ListingPhotoRow[] | null
}

type ListingPhotoRow = {
  id: number
  listing_id: number
  object_path: string
  caption: string | null
  sort_order: number
}

type UserProfileRow = {
  id: string
  name: string
  email: string
  phone_number: string | null
}

export type UserContactProfile = {
  id: string
  name: string
  email: string
  phoneNumber: string | null
}

const photosBucket = 'listing-photos'

function toPublicUrl(objectPath: string) {
  const { data } = supabase.storage.from(photosBucket).getPublicUrl(objectPath)
  return data.publicUrl
}

function toPhoto(row: ListingPhotoRow): ListingPhoto {
  return {
    id: String(row.id),
    listingId: String(row.listing_id),
    objectPath: row.object_path,
    caption: row.caption,
    sortOrder: row.sort_order,
    url: toPublicUrl(row.object_path),
  }
}

function toUserContactProfile(row: UserProfileRow): UserContactProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phoneNumber: row.phone_number,
  }
}

function toListing(row: ListingRow): ListingWithPhotos {
  const photos = (row.listing_photos ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toPhoto)

  return {
    id: String(row.id),
    ownerId: row.owner_id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    location: row.location,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    imageUrl: photos[0]?.url ?? 'https://images.unsplash.com/photo-1512820790803-83ca734da794',
    photoUrls: photos.map((photo) => photo.url),
    photos,
  }
}

const listingSelect = `
  id,
  owner_id,
  title,
  description,
  price,
  location,
  created_at,
  updated_at,
  listing_photos (
    id,
    listing_id,
    object_path,
    caption,
    sort_order
  )
`

async function fetchListings(
  query: PromiseLike<{
    data: ListingRow[] | null
    error: { code?: string; message: string } | null
  }>,
) {
  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => toListing(row as ListingRow))
}

export async function getAllListings() {
  return fetchListings(
    supabase.from('listings').select(listingSelect).order('created_at', { ascending: false }),
  )
}

export async function getLatestListings(limit: number) {
  return fetchListings(
    supabase
      .from('listings')
      .select(listingSelect)
      .order('created_at', { ascending: false })
      .limit(limit),
  )
}

export async function getMyListings(ownerId: string) {
  return fetchListings(
    supabase
      .from('listings')
      .select(listingSelect)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false }),
  )
}

export async function getListingById(id: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(listingSelect)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return toListing(data as ListingRow)
}

export async function getUserProfileById(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, name, email, phone_number')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return toUserContactProfile(data as UserProfileRow)
}

export async function upsertUserContactProfile(input: {
  id: string
  name: string
  email: string
  phoneNumber: string
}) {
  const { error } = await supabase.from('user_profiles').upsert(
    {
      id: input.id,
      name: input.name,
      email: input.email,
      phone_number: input.phoneNumber,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'id',
    },
  )

  if (error) {
    throw error
  }
}

function getFileExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot < 0) {
    return 'jpg'
  }

  return fileName.slice(lastDot + 1).toLowerCase()
}

export async function uploadListingPhotos(listingId: string, files: File[], startSortOrder = 0) {
  const insertedRows: ListingPhotoRow[] = []

  for (const [index, file] of files.entries()) {
    const ext = getFileExtension(file.name)
    const timestamp = Date.now()
    const randomPart = crypto.randomUUID().slice(0, 8)
    const objectPath = `${listingId}/${timestamp}-${randomPart}-${index + 1}.${ext}`

    const { error: uploadError } = await supabase.storage.from(photosBucket).upload(objectPath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })

    if (uploadError) {
      throw uploadError
    }

    const sortOrder = startSortOrder + index + 1
    const { data: insertedPhoto, error: insertError } = await supabase
      .from('listing_photos')
      .insert({
        listing_id: Number(listingId),
        object_path: objectPath,
        sort_order: sortOrder,
      })
      .select('id, listing_id, object_path, caption, sort_order')
      .single()

    if (insertError) {
      await supabase.storage.from(photosBucket).remove([objectPath])
      throw insertError
    }

    insertedRows.push(insertedPhoto as ListingPhotoRow)
  }

  return insertedRows.map(toPhoto)
}

export async function createListing(input: ListingInput, ownerId: string, files: File[]) {
  const { data, error } = await supabase
    .from('listings')
    .insert({
      owner_id: ownerId,
      title: input.title,
      description: input.description,
      price: input.price,
      location: input.location,
    })
    .select('id')
    .single()

  if (error) {
    throw error
  }

  const listingId = String(data.id)

  if (files.length > 0) {
    try {
      await uploadListingPhotos(listingId, files)
    } catch (uploadError) {
      await supabase.from('listings').delete().eq('id', listingId)
      throw uploadError
    }
  }

  return getListingById(listingId)
}

export async function updateListing(id: string, input: ListingInput) {
  const { error } = await supabase
    .from('listings')
    .update({
      title: input.title,
      description: input.description,
      price: input.price,
      location: input.location,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function deleteListingPhotos(photos: Pick<ListingPhoto, 'id' | 'objectPath'>[]) {
  if (photos.length === 0) {
    return
  }

  const objectPaths = photos.map((photo) => photo.objectPath)
  const photoIds = photos.map((photo) => Number(photo.id))

  const { error: storageError } = await supabase.storage.from(photosBucket).remove(objectPaths)
  if (storageError) {
    throw storageError
  }

  const { error: dbError } = await supabase.from('listing_photos').delete().in('id', photoIds)
  if (dbError) {
    throw dbError
  }
}

export async function deleteListing(id: string) {
  const listing = await getListingById(id)
  if (!listing) {
    return
  }

  if (listing.photos.length > 0) {
    const { error: storageError } = await supabase
      .storage
      .from(photosBucket)
      .remove(listing.photos.map((photo) => photo.objectPath))

    if (storageError) {
      throw storageError
    }
  }

  const { error } = await supabase.from('listings').delete().eq('id', id)
  if (error) {
    throw error
  }
}

export function filterListings(listings: Listing[], query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return listings
  }

  return listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(normalizedQuery) ||
      listing.location.toLowerCase().includes(normalizedQuery),
  )
}
