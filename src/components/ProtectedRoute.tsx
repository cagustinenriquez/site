import { Navigate, useLocation } from 'react-router-dom'
import { api } from '@/lib/api'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()

  if (!api.isAuthenticated()) {
    return <Navigate to="/blog/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
