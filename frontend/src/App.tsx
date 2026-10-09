import { createBrowserRouter, RouterProvider } from 'react-router'
import { AppProviders } from './AppProviders'
import { routes } from './routes'

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
