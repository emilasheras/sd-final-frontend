import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'

export default function NavBar() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0()

  if (isLoading) return (
    <nav className="bg-zinc-950 border-b border-zinc-800">
      <div className="container mx-auto px-4 py-3">
        <span className="font-semibold text-zinc-100">Daily Journal</span>
      </div>
    </nav>
  )

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex gap-6 items-center">
          <Link to="/" className="font-semibold text-zinc-100 hover:text-white">Daily Journal</Link>
          <Link to="/public" className="text-sm text-zinc-400 hover:text-zinc-200">Público</Link>
          {isAuthenticated && (
            <Link to="/private" className="text-sm text-zinc-400 hover:text-zinc-200">Journal</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-xs text-zinc-500">{user?.email}</span>
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="bg-zinc-700 text-zinc-100 px-4 py-1 rounded text-sm hover:bg-zinc-600"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <button
              onClick={() => loginWithRedirect()}
              className="bg-zinc-700 text-zinc-100 px-4 py-1 rounded text-sm hover:bg-zinc-600"
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
