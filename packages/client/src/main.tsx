import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import './styles.css'

// Create a new QueryClient instance
const queryClient = new QueryClient()

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    <div className="p-2 text-2xl">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  defaultErrorComponent: ({ error }: { error: Error }) => (
    <div className="p-4 text-red-600">
      <h2 className="text-lg font-semibold mb-2">出错了</h2>
      <p>{error.message}</p>
    </div>
  ),
  context: {
    auth: undefined!, // We'll inject this when we render
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}
