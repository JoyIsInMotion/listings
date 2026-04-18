import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { BookListingsPage } from '../pages/BookListingsPage'
import { LoginPage } from '../pages/LoginPage'
import { NewListingPage } from '../pages/NewListingPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <BookListingsPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'listings/new',
        element: <NewListingPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])