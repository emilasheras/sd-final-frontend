import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect()
    }
  }, [isAuthenticated, isLoading, loginWithRedirect])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return children
}
