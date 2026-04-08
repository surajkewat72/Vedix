import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '48px', height: '48px',
          border: '3px solid rgba(124, 58, 237, 0.3)',
          borderTop: '3px solid #7c3aed',
          borderRadius: '50%',
          animation: 'spin-slow 1s linear infinite',
        }} />
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
          Reading the stars…
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}
