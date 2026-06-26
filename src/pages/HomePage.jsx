import { useAuth0 } from '@auth0/auth0-react'

export default function HomePage() {
  const { isAuthenticated, loginWithRedirect } = useAuth0()

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Daily Journal</h1>
        <p className="text-zinc-400">
          Registrá tus conductas diarias y actividades por hora.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-zinc-800 p-5 rounded-lg border border-zinc-700">
          <h2 className="font-semibold text-zinc-100 mb-2">Conductas diarias</h2>
          <p className="text-base text-zinc-400">
            Hábitos fijos que marcás cada día - higiene, comidas, sueño, cuidado personal.
          </p>
          <p className="text-sm text-zinc-600 mt-3 font-mono">GET /api/private/behaviors</p>
        </div>
        <div className="bg-zinc-800 p-5 rounded-lg border border-zinc-700">
          <h2 className="font-semibold text-zinc-100 mb-2">Actividades por hora</h2>
          <p className="text-base text-zinc-400">
            Anotá qué hiciste en cada franja horaria, con disfrute e importancia del 0 al 10.
          </p>
          <p className="text-sm text-zinc-600 mt-3 font-mono">GET /api/private/activities</p>
        </div>
      </div>

      <div className="bg-zinc-800 p-5 rounded-lg border border-zinc-700">
        <h2 className="font-semibold text-zinc-100 mb-2">Seguridad</h2>
        <p className="text-base text-zinc-400 mb-3">
          Todos los datos están protegidos con Auth0. El backend valida el JWT en cada request
          y filtra las actividades por usuario autenticado.
        </p>
        <div className="flex gap-3 flex-wrap text-sm">
          <span className="bg-zinc-700 text-emerald-400 border border-zinc-600 px-2 py-1 rounded font-mono">
            /api/public/** → libre
          </span>
          <span className="bg-zinc-700 text-amber-400 border border-zinc-600 px-2 py-1 rounded font-mono">
            /api/private/** → JWT requerido
          </span>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="text-center">
          <button
            onClick={() => loginWithRedirect()}
            className="bg-blue-500 text-white px-8 py-2.5 rounded font-medium hover:bg-blue-400"
          >
            Iniciar sesión con Auth0
          </button>
        </div>
      )}
    </div>
  )
}
