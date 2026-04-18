export type Listing = {
  id: string
  title: string
  price: number
  condition: 'new' | 'good' | 'used'
  createdAt: string
}