# SD Final - Frontend

## Integrantes
- [Nombre Apellido]

## Tecnologias utilizadas
- React 18 (JavaScript)
- Vite
- React Router DOM
- Tailwind CSS 3
- Auth0 React SDK (`@auth0/auth0-react`)

## Requisitos de ejecucion
- Node.js 18 o superior
- npm 9+
- Cuenta Auth0 configurada (SPA Application)
- Backend corriendo en `http://localhost:8080`

## Variables de entorno
Crear archivo `.env.local` en la raiz del proyecto:

```env
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://sd-final-api
VITE_API_BASE_URL=http://localhost:8080
```

## Instrucciones paso a paso

### 1. Clonar el repositorio
```bash
git clone https://github.com/emilasheras/sd-final-frontend.git
cd sd-final-frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear `.env.local` con los valores de tu tenant Auth0 (ver seccion anterior).

### 4. Ejecutar
```bash
npm run dev
```

Abrir http://localhost:5173

## Paginas
| Ruta | Descripcion | Acceso |
|------|-------------|--------|
| `/` | Pagina de inicio | Publico |
| `/public` | Llama a `/api/public/ping` | Publico |
| `/private` | Llama a `/api/private/hello` y `/api/private/items` | Requiere login |
