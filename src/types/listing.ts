export type Listing = {
  id: string
  title: string
  price: number
  condition: 'new' | 'good' | 'used'
  imageUrl: string
  location: string
  createdAt: string
  description: string
  ownerId: string
}