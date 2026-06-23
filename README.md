# SD Final - Frontend

Frontend React para el examen final de Sistemas Distribuidos.

La aplicacion implementa autenticacion con Auth0, rutas publicas y privadas, y consumo de endpoints de un backend Spring Boot protegido por JWT.


## Tecnologias Utilizadas

- React 18
- Vite
- React Router DOM
- Tailwind CSS 3
- Auth0 React SDK (`@auth0/auth0-react`)

## Requisitos

- Node.js 20.19+ o 22.12+
- npm
- Backend Spring Boot corriendo en `http://localhost:8080`
- Tenant Auth0 configurado para SPA

## Configuracion Auth0

Valores usados localmente para este proyecto:

```env
VITE_AUTH0_DOMAIN=your-auth0-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=auth0_client_id
VITE_AUTH0_AUDIENCE=https://auth0_app_name
VITE_API_BASE_URL=http://localhost:8080
```

Crear `.env.local` en root

En Auth0, la SPA debe tener estos tres campos configurados como `http://localhost:5173`:

- Allowed Callback URLs
- Allowed Logout URLs
- Allowed Web Origins

## Instalacion

```bash
git clone https://github.com/emilasheras/sd-final-frontend.git
cd sd-final-frontend
npm install
```

## Ejecutar en Desarrollo

```bash
npm run dev
```

Abrir:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

Resultado verificado:

```text
vite v8.0.16 building client environment for production
build completed successfully
```

## Auditoria de Dependencias

```bash
npm audit --audit-level=high
```

Resultado verificado:

```text
found 0 vulnerabilities
```

## Rutas

| Ruta | Descripcion | Acceso |
|------|-------------|--------|
| `/` | Pagina de inicio | Publico |
| `/public` | Llama a `GET /api/public/ping` | Publico |
| `/private` | Llama a `GET /api/private/hello` y `GET /api/private/items` | Requiere login |

## Integracion con Backend

El frontend espera que el backend exponga:

```text
GET http://localhost:8080/api/public/ping
GET http://localhost:8080/api/private/hello
GET http://localhost:8080/api/private/items
```

Los endpoints privados se llaman con:

```http
Authorization: Bearer <access_token>
```

El backend debe usar el mismo audience:

```text
https://sd-final-api
```

Y el issuer debe corresponder al tenant:

```text
https://dev-ym26lu2aglwbsv3n.us.auth0.com/
```

## Estructura Principal

```text
src/
├── App.jsx
├── components/
│   ├── NavBar.jsx
│   └── ProtectedRoute.jsx
├── index.css
├── main.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── PrivatePage.jsx
│   └── PublicPage.jsx
└── services/
    └── api.js
```
