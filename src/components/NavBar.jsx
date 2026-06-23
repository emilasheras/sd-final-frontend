import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'

export default function NavBar() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0()

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex gap-6 items-center">
          <Link to="/" className="font-bold text-lg hover:text-blue-200">SD Final</Link>
          <Link to="/public" className="hover:text-blue-200">Publico</Link>
          {isAuthenticated && (
            <Link to="/private" className="hover:text-blue-200">Privado</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-blue-100">{user?.email}</span>
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="bg-white text-blue-600 px-4 py-1 rounded text-sm font-medium hover:bg-blue-50"
              >
                Cerrar Sesion
              </button>
            </>
          ) : (
            <button
              onClick={() => loginWithRedirect()}
              className="bg-white text-blue-600 px-4 py-1 rounded text-sm font-medium hover:bg-blue-50"
            >
              Iniciar Sesion
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
