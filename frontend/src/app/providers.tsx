import { type ReactNode, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { LinearProgress } from '@mui/material'
import theme from '@/theme'
import { useAuthStore } from '@/stores/auth.store'
import { usePermissionStore } from '@/stores/permission.store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

function AuthInitializer({ children }: { children: ReactNode }) {
  const checkSession = useAuthStore((s) => s.checkSession)
  const isLoading = useAuthStore((s) => s.isLoading)
  const bootstrap = usePermissionStore((s) => s.bootstrap)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      checkSession().then(() => bootstrap())
    }
  }, [])

  if (isLoading) {
    return <LinearProgress />
  }

  return <>{children}</>
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthInitializer>{children}</AuthInitializer>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
