import type { Listing } from '../types/listing'

export const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Time Shelter',
    price: 14,
    condition: 'good',
    imageUrl:
      'https://placehold.co/600x800/e2e8f0/0f172a?text=Time+Shelter',
    location: 'Sofia',
    createdAt: '2026-04-16T09:00:00.000Z',
    description: 'Booker-winning novel by Bulgarian author Georgi Gospodinov.',
    ownerId: 'u1',
  },
  {
    id: '2',
    title: 'Under the Yoke',
    price: 17,
    condition: 'used',
    imageUrl:
      'https://placehold.co/600x800/f1f5f9/0f172a?text=Under+the+Yoke',
    location: 'Plovdiv',
    createdAt: '2026-04-14T15:25:00.000Z',
    description: 'Classic Bulgarian novel by Ivan Vazov, readable condition.',
    ownerId: 'u2',
  },
  {
    id: '3',
    title: 'The Physics of Sorrow',
    price: 16,
    condition: 'new',
    imageUrl:
      'https://placehold.co/600x800/e2e8f0/0f172a?text=The+Physics+of+Sorrow',
    location: 'Varna',
    createdAt: '2026-04-18T08:05:00.000Z',
    description: 'Excellent copy of Georgi Gospodinov\'s acclaimed work.',
    ownerId: 'u1',
  },
  {
    id: '4',
    title: 'East of the West',
    price: 20,
    condition: 'good',
    imageUrl:
      'https://placehold.co/600x800/f8fafc/0f172a?text=East+of+the+West',
    location: 'Burgas',
    createdAt: '2026-04-10T11:42:00.000Z',
    description: 'Short story collection by Bulgarian writer Miroslav Penkov.',
    ownerId: 'u3',
  },
  {
    id: '5',
    title: 'Bai Ganyo',
    price: 18,
    condition: 'good',
    imageUrl:
      'https://placehold.co/600x800/e2e8f0/0f172a?text=Bai+Ganyo',
    location: 'Ruse',
    createdAt: '2026-04-12T13:17:00.000Z',
    description: 'Satirical Bulgarian classic by Aleko Konstantinov.',
    ownerId: 'u1',
  },
  {
    id: '6',
    title: 'Stork Mountain',
    price: 19,
    condition: 'used',
    imageUrl:
      'https://placehold.co/600x800/f1f5f9/0f172a?text=Stork+Mountain',
    location: 'Stara Zagora',
    createdAt: '2026-04-08T16:30:00.000Z',
    description: 'Set in rural Bulgaria, clean copy with minor shelf wear.',
    ownerId: 'u2',
  },
  {
    id: '7',
    title: 'Bulgaria Travel Guide 2026',
    price: 15,
    condition: 'good',
    imageUrl:
      'https://placehold.co/600x800/f8fafc/0f172a?text=Bulgaria+Travel+Guide+2026',
    location: 'Veliko Tarnovo',
    createdAt: '2026-04-11T07:45:00.000Z',
    description: 'Practical guide for Sofia, Plovdiv, Varna, and mountain routes.',
    ownerId: 'u3',
  },
  {
    id: '8',
    title: 'Bulgarian Folk Tales',
    price: 21,
    condition: 'used',
    imageUrl:
      'https://placehold.co/600x800/e2e8f0/0f172a?text=Bulgarian+Folk+Tales',
    location: 'Blagoevgrad',
    createdAt: '2026-04-13T18:14:00.000Z',
    description: 'Collection of traditional Bulgarian stories for all ages.',
    ownerId: 'u1',
  },
]
