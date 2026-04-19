import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { AppLayout } from '../layouts/AppLayout'
import { BookDetailsPage } from '../pages/BookDetailsPage'
import { BookListingsPage } from '../pages/BookListingsPage'
import { CreateSalePage } from '../pages/CreateSalePage'
import { DashboardPage } from '../pages/DashboardPage'
import { DeleteListingPage } from '../pages/DeleteListingPage'
import { EditListingPage } from '../pages/EditListingPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RegisterPage } from '../pages/RegisterPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'books',
        element: <BookListingsPage />,
      },
      {
        path: 'book/:id',
        element: <BookDetailsPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/add',
        element: (
          <ProtectedRoute>
            <CreateSalePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/edit/:id',
        element: (
          <ProtectedRoute>
            <EditListingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/delete/:id',
        element: (
          <ProtectedRoute>
            <DeleteListingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])