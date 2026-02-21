import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type ProtectedRouteProps = {
  children: React.ReactNode
  requireStudent?: boolean
  requireTeacher?: boolean
}

export function ProtectedRoute({ children, requireStudent, requireTeacher }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const path = location.pathname

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 rounded-xl border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  if (path === '/swot' && user.role === 'teacher') {
    return <Navigate to="/dashboard" replace />
  }

  if (path === '/dashboard' && user.role === 'student' && !user.swot_complete) {
    return <Navigate to="/swot" replace />
  }

  return <>{children}</>
}
