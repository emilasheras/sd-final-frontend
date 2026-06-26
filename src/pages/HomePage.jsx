import { useAuth0 } from '@auth0/auth0-react'

export default function HomePage() {
  const { isAuthenticated, loginWithRedirect } = useAuth0()

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Daily Journal</h1>
        <p className="text-gray-500">
          Registrá tus conductas diarias y actividades por hora.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-lg shadow border">
          <h2 className="font-semibold text-gray-700 mb-2">Conductas diarias</h2>
          <p className="text-sm text-gray-500">
            Un set de hábitos predefinidos para marcar cada día — tendés la cama, te bañás, mantenés tu rutina.
          </p>
          <p className="text-xs text-gray-400 mt-3 font-mono">GET /api/private/behaviors</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border">
          <h2 className="font-semibold text-gray-700 mb-2">Actividades por hora</h2>
          <p className="text-sm text-gray-500">
            Registrá qué hiciste en cada franja horaria, con disfrute e importancia del 0 al 10.
          </p>
          <p className="text-xs text-gray-400 mt-3 font-mono">GET /api/private/activities</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg shadow border">
        <h2 className="font-semibold text-gray-700 mb-2">Seguridad</h2>
        <p className="text-sm text-gray-500 mb-3">
          Todos los datos están protegidos con Auth0. El backend valida el JWT en cada request
          y filtra las actividades por usuario autenticado.
        </p>
        <div className="flex gap-3 text-xs">
          <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded font-mono">
            /api/public/** → libre
          </span>
          <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 rounded font-mono">
            /api/private/** → JWT requerido
          </span>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="text-center">
          <button
            onClick={() => loginWithRedirect()}
            className="bg-blue-600 text-white px-8 py-2.5 rounded font-medium hover:bg-blue-700"
          >
            Iniciar sesión con Auth0
          </button>
        </div>
      )}
    </div>
  )
}
