export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Sistemas Distribuidos - Examen Final
      </h1>
      <p className="text-gray-600 text-lg mb-10">
        Autenticacion con Auth0 - Spring Boot - H2
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <div className="bg-white p-5 rounded-lg shadow border">
          <h2 className="font-semibold text-gray-700 mb-1">Endpoint Publico</h2>
          <p className="text-sm text-gray-500">
            Accesible sin autenticacion -{' '}
            <code className="bg-gray-100 px-1 rounded text-xs">/api/public/ping</code>
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border">
          <h2 className="font-semibold text-gray-700 mb-1">Endpoint Privado</h2>
          <p className="text-sm text-gray-500">
            Requiere JWT valido -{' '}
            <code className="bg-gray-100 px-1 rounded text-xs">/api/private/*</code>
          </p>
        </div>
      </div>
    </div>
  )
}
