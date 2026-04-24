export type Listing = {
  id: string
  title: string
  price: number
  condition?: 'new' | 'good' | 'used'
  imageUrl: string
  photoUrls: string[]
  location: string
  createdAt: string
  updatedAt: string
  description: string
  ownerId: string
}

export type ListingPhoto = {
  id: string
  listingId: string
  objectPath: string
  caption: string | null
  sortOrder: number
  url: string
}

export type ListingWithPhotos = Listing & {
  photos: ListingPhoto[]
}

export type ListingInput = {
  title: string
  description: string
  price: number
  location: string
}