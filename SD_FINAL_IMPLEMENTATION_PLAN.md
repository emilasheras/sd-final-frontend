# Sistemas Distribuidos — Examen Final: Implementation Plan
> **Stack:** React (plain JS) + Vite | Spring Boot 3.x + Auth0 | H2  
> **Scope:** Minimal viable. No extras. 2-day window.  
> **This doc is the source of truth for delegated execution.**

## STATUS — 2026-06-23
| Part | Component | Status |
|------|-----------|--------|
| A | Auth0 Setup | ✅ DONE — real values confirmed below |
| A | Backend | ⏳ TODO — human-executed |
| B | Frontend | ✅ DONE — agent completed in 5m, `npm run build` passes, 0 vulnerabilities |

---

## PART A — OVERVIEW & BACKEND (Human-executed)

### A1. Auth0 Setup — ✅ DONE

Auth0 tenant, API, and SPA Application are already created and confirmed working.

#### Confirmed values
```
AUTH0_DOMAIN=dev-ym26lu2aglwbsv3n.us.auth0.com
AUTH0_CLIENT_ID=2GOpjlAAhBl5IPIF6GEaPeWkuk8vnjba
AUTH0_AUDIENCE=https://sd-final-api
```

#### Still verify in Auth0 dashboard (if login redirects break)
SPA Application → Settings → Application URIs — all three must be `http://localhost:5173`:
- Allowed Callback URLs
- Allowed Logout URLs
- Allowed Web Origins

---

### A2. Backend File Tree

```
sd-final-backend/
├── pom.xml
├── README.md
└── src/main/
    ├── java/com/sdexamen/backend/
    │   ├── BackendApplication.java
    │   ├── config/
    │   │   ├── SecurityConfig.java
    │   │   └── AudienceValidator.java
    │   ├── controller/
    │   │   ├── PublicController.java
    │   │   └── PrivateController.java
    │   ├── model/
    │   │   └── Item.java
    │   ├── repository/
    │   │   └── ItemRepository.java
    │   └── service/
    │       └── ItemService.java
    └── resources/
        └── application.yml
```

---

### A3. `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>
    <groupId>com.sdexamen</groupId>
    <artifactId>backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>sd-final-backend</name>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

### A4. `src/main/resources/application.yml`

```yaml
server:
  port: 8080

spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          # TRAILING SLASH IS REQUIRED - do not remove it
          issuer-uri: https://${AUTH0_DOMAIN}/

  datasource:
    url: jdbc:h2:mem:sddb
    driver-class-name: org.h2.Driver
    username: sa
    password:

  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: create-drop
    show-sql: true

  h2:
    console:
      enabled: true
      path: /h2-console

auth0:
  audience: ${AUTH0_AUDIENCE}
```

---

### A5. `BackendApplication.java`

```java
package com.sdexamen.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
```

---

### A6. `config/AudienceValidator.java`

```java
package com.sdexamen.backend.config;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

public class AudienceValidator implements OAuth2TokenValidator<Jwt> {

    private final String audience;

    public AudienceValidator(String audience) {
        this.audience = audience;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        if (jwt.getAudience().contains(audience)) {
            return OAuth2TokenValidatorResult.success();
        }
        OAuth2Error error = new OAuth2Error("invalid_token", "Required audience missing", null);
        return OAuth2TokenValidatorResult.failure(error);
    }
}
```

---

### A7. `config/SecurityConfig.java`

```java
package com.sdexamen.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${auth0.audience}")
    private String audience;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuer;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.decoder(jwtDecoder()))
            );
        return http.build();
    }

    @Bean
    JwtDecoder jwtDecoder() {
        NimbusJwtDecoder jwtDecoder = JwtDecoders.fromOidcIssuerLocation(issuer);
        OAuth2TokenValidator<Jwt> audienceValidator = new AudienceValidator(audience);
        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);
        OAuth2TokenValidator<Jwt> combined = new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator);
        jwtDecoder.setJwtValidator(combined);
        return jwtDecoder;
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

---

### A8. `model/Item.java`

```java
package com.sdexamen.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
}
```

---

### A9. `repository/ItemRepository.java`

```java
package com.sdexamen.backend.repository;

import com.sdexamen.backend.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
}
```

---

### A10. `service/ItemService.java`

```java
package com.sdexamen.backend.service;

import com.sdexamen.backend.model.Item;
import com.sdexamen.backend.repository.ItemRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    @PostConstruct
    public void seedData() {
        if (itemRepository.count() == 0) {
            itemRepository.save(new Item(null, "Item A", "Descripción del item A"));
            itemRepository.save(new Item(null, "Item B", "Descripción del item B"));
            itemRepository.save(new Item(null, "Item C", "Descripción del item C"));
        }
    }

    public List<Item> findAll() {
        return itemRepository.findAll();
    }

    public Item save(Item item) {
        return itemRepository.save(item);
    }
}
```

---

### A11. `controller/PublicController.java`

```java
package com.sdexamen.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of(
            "status", "ok",
            "message", "Endpoint público — no se requiere autenticación."
        );
    }
}
```

---

### A12. `controller/PrivateController.java`

```java
package com.sdexamen.backend.controller;

import com.sdexamen.backend.model.Item;
import com.sdexamen.backend.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/private")
@RequiredArgsConstructor
public class PrivateController {

    private final ItemService itemService;

    @GetMapping("/hello")
    public Map<String, String> hello(@AuthenticationPrincipal Jwt jwt) {
        return Map.of(
            "message", "Hola, usuario autenticado!",
            "subject", jwt.getSubject()
        );
    }

    @GetMapping("/items")
    public List<Item> getItems() {
        return itemService.findAll();
    }

    @PostMapping("/items")
    public Item createItem(@RequestBody Item item) {
        return itemService.save(item);
    }
}
```

---

### A13. How to run the backend

```bash
# Real values — confirmed from Auth0 tenant
export AUTH0_DOMAIN=dev-ym26lu2aglwbsv3n.us.auth0.com
export AUTH0_AUDIENCE=https://sd-final-api

mvn spring-boot:run
```

**Smoke test (no token needed):**
```
GET http://localhost:8080/api/public/ping  →  200 OK
GET http://localhost:8080/api/private/hello  →  401 Unauthorized  ✓ correct
```

---

---

## PART B — FRONTEND AGENT EXECUTION CONTRACT — ✅ COMPLETED 2026-06-23

> Implemented by CLI agent in 5 minutes, 47.9K tokens.  
> `npm run build` passes. `npm audit --audit-level=high` → 0 vulnerabilities.  
> Committed as `7318afa feat: scaffold Auth0 frontend`.

### Deviations from spec (agent-initiated, both correct)

**1. No nested directory.**  
Agent was already inside `sd-final-frontend/` so skipped `npm create vite@latest` scaffold. Implemented directly in repo root. Correct call — avoided `sd-final-frontend/sd-final-frontend/` nesting.

**2. `ProtectedRoute` uses `useEffect` for redirect.**  
Spec called `loginWithRedirect()` directly during render. Agent moved it into `useEffect`. Correct — calling side effects during render violates React's execution model and causes warnings in StrictMode.

**3. Vite upgraded to 8.0.16.**  
`npm audit` flagged vulnerable esbuild chain in Vite 5. Agent upgraded to Vite 8 + `@vitejs/plugin-react` 6 (compatible with Node 22). Correct.

---

### B0. PRECONDITIONS — ✅ confirmed

```
VITE_AUTH0_DOMAIN=dev-ym26lu2aglwbsv3n.us.auth0.com
VITE_AUTH0_CLIENT_ID=2GOpjlAAhBl5IPIF6GEaPeWkuk8vnjba
VITE_AUTH0_AUDIENCE=https://sd-final-api
VITE_API_BASE_URL=http://localhost:8080
```

`.env.local` written and confirmed. Not committed (gitignored). ✅

---

### B1. SCAFFOLD

Run from the directory where the repo folder should be created.  
If prompted "Ok to proceed? (y)", respond `y`.

```bash
npm create vite@latest sd-final-frontend -- --template react
cd sd-final-frontend
```

---

### B2. INSTALL DEPENDENCIES

Run these commands sequentially. Each must exit code 0 before proceeding.

```bash
npm install
npm install @auth0/auth0-react react-router-dom
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

---

### B3. CREATE `.env.local`

Create file at project root `sd-final-frontend/.env.local`.  
Substitute actual values for the three placeholders from B0.

```
VITE_AUTH0_DOMAIN=AUTH0_DOMAIN_VALUE
VITE_AUTH0_CLIENT_ID=AUTH0_CLIENT_ID_VALUE
VITE_AUTH0_AUDIENCE=AUTH0_AUDIENCE_VALUE
VITE_API_BASE_URL=http://localhost:8080
```

---

### B4. OVERWRITE `tailwind.config.js`

Full replacement of file generated by Step B2:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

### B5. DELETE BOILERPLATE FILES

```bash
rm src/App.css
rm src/assets/react.svg
```

---

### B6. OVERWRITE `src/index.css`

Full replacement — three lines only:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### B7. OVERWRITE `index.html`

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SD Final — Auth0</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### B8. OVERWRITE `src/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App.jsx'
import './index.css'

const domain   = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const audience = import.meta.env.VITE_AUTH0_AUDIENCE

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: audience,
        }}
      >
        <App />
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>
)
```

---

### B9. OVERWRITE `src/App.jsx`

```jsx
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import HomePage from './pages/HomePage.jsx'
import PublicPage from './pages/PublicPage.jsx'
import PrivatePage from './pages/PrivatePage.jsx'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/"        element={<HomePage />} />
          <Route path="/public"  element={<PublicPage />} />
          <Route path="/private" element={
            <ProtectedRoute>
              <PrivatePage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App
```

---

### B10. CREATE `src/components/NavBar.jsx`

Create directory `src/components/` first if it does not exist.

```jsx
import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'

export default function NavBar() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0()

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">

        <div className="flex gap-6 items-center">
          <Link to="/"       className="font-bold text-lg hover:text-blue-200">SD Final</Link>
          <Link to="/public" className="hover:text-blue-200">Público</Link>
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
                Cerrar Sesión
              </button>
            </>
          ) : (
            <button
              onClick={() => loginWithRedirect()}
              className="bg-white text-blue-600 px-4 py-1 rounded text-sm font-medium hover:bg-blue-50"
            >
              Iniciar Sesión
            </button>
          )}
        </div>

      </div>
    </nav>
  )
}
```

---

### B11. CREATE `src/components/ProtectedRoute.jsx`

```jsx
import { useAuth0 } from '@auth0/auth0-react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    loginWithRedirect()
    return null
  }

  return children
}
```

---

### B12. CREATE `src/services/api.js`

Create directory `src/services/` first if it does not exist.

```js
const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function fetchPublic() {
  const res = await fetch(`${BASE_URL}/api/public/ping`)
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function fetchPrivateHello(token) {
  const res = await fetch(`${BASE_URL}/api/private/hello`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function fetchPrivateItems(token) {
  const res = await fetch(`${BASE_URL}/api/private/items`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}
```

---

### B13. CREATE `src/pages/HomePage.jsx`

Create directory `src/pages/` first if it does not exist.

```jsx
export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Sistemas Distribuidos — Examen Final
      </h1>
      <p className="text-gray-600 text-lg mb-10">
        Autenticación con Auth0 · Spring Boot · H2
      </p>
      <div className="grid grid-cols-2 gap-4 text-left">
        <div className="bg-white p-5 rounded-lg shadow border">
          <h2 className="font-semibold text-gray-700 mb-1">🌐 Endpoint Público</h2>
          <p className="text-sm text-gray-500">Accesible sin autenticación · <code className="bg-gray-100 px-1 rounded text-xs">/api/public/ping</code></p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border">
          <h2 className="font-semibold text-gray-700 mb-1">🔒 Endpoint Privado</h2>
          <p className="text-sm text-gray-500">Requiere JWT válido · <code className="bg-gray-100 px-1 rounded text-xs">/api/private/*</code></p>
        </div>
      </div>
    </div>
  )
}
```

---

### B14. CREATE `src/pages/PublicPage.jsx`

```jsx
import { useEffect, useState } from 'react'
import { fetchPublic } from '../services/api.js'

export default function PublicPage() {
  const [data,    setData]    = useState(null)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublic()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Página Pública</h1>
      <div className="bg-white rounded-lg shadow p-6 border">
        <p className="text-sm text-gray-400 mb-4">
          <code>GET /api/public/ping</code> — sin token de autenticación
        </p>
        {loading && <p className="text-gray-400">Llamando al backend...</p>}
        {error   && <p className="text-red-500">Error: {error}</p>}
        {data    && (
          <pre className="bg-gray-50 p-4 rounded text-sm text-green-700 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
```

---

### B15. CREATE `src/pages/PrivatePage.jsx`

```jsx
import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { fetchPrivateHello, fetchPrivateItems } from '../services/api.js'

export default function PrivatePage() {
  const { getAccessTokenSilently } = useAuth0()

  const [hello,   setHello]   = useState(null)
  const [items,   setItems]   = useState([])
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = await getAccessTokenSilently()
        const [helloData, itemsData] = await Promise.all([
          fetchPrivateHello(token),
          fetchPrivateItems(token),
        ])
        setHello(helloData)
        setItems(itemsData)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getAccessTokenSilently])

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Página Privada 🔒</h1>

      {loading && <p className="text-gray-400">Cargando datos protegidos...</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
          <p className="text-red-600 text-sm">Error: {error}</p>
        </div>
      )}

      {hello && (
        <div className="bg-white rounded-lg shadow p-6 border mb-4">
          <p className="text-xs text-gray-400 mb-2">GET /api/private/hello</p>
          <pre className="bg-gray-50 p-3 rounded text-sm text-green-700 overflow-auto">
            {JSON.stringify(hello, null, 2)}
          </pre>
        </div>
      )}

      {items.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 border">
          <p className="text-xs text-gray-400 mb-3">GET /api/private/items — datos de H2 DB</p>
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item.id} className="border rounded p-3 text-sm flex gap-2">
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className="text-gray-400">—</span>
                <span className="text-gray-500">{item.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

---

### B16. CREATE `README.md`

```markdown
# SD Final — Frontend

## Integrantes
- [Nombre Apellido]

## Tecnologías utilizadas
- React 18 (JavaScript)
- Vite
- React Router DOM
- Tailwind CSS 3
- Auth0 React SDK (`@auth0/auth0-react`)

## Requisitos de ejecución
- Node.js 18 o superior
- npm 9+
- Cuenta Auth0 configurada (SPA Application)
- Backend corriendo en `http://localhost:8080`

## Variables de entorno
Crear archivo `.env.local` en la raíz del proyecto:
```
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://sd-final-api
VITE_API_BASE_URL=http://localhost:8080
```

## Instrucciones paso a paso

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/sd-final-frontend.git
cd sd-final-frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear `.env.local` con los valores de tu tenant Auth0 (ver sección anterior).

### 4. Ejecutar
```bash
npm run dev
```
Abrir http://localhost:5173

## Páginas
| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Página de inicio | Público |
| `/public` | Llama a `/api/public/ping` | Público |
| `/private` | Llama a `/api/private/hello` y `/api/private/items` | Requiere login |
```

---

### B17. CREATE `.gitignore`

```
node_modules/
dist/
.env.local
.env.*.local
*.log
.DS_Store
```

---

### B18. VERIFICATION — agent runs this, must pass before declaring done

```bash
npm run build
```

**Expected:** exits with code `0`. Output contains `dist/` directory. No error messages.

If exit code is non-zero, read the error output and fix only the file(s) referenced in the error. Do not modify any other files.

---

### B19. FINAL FILE TREE — agent verifies this structure exists

```
sd-final-frontend/
├── .env.local                     ← has real Auth0 values
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── vite.config.js
├── public/
└── src/
    ├── index.css
    ├── main.jsx
    ├── App.jsx
    ├── components/
    │   ├── NavBar.jsx
    │   └── ProtectedRoute.jsx
    ├── pages/
    │   ├── HomePage.jsx
    │   ├── PublicPage.jsx
    │   └── PrivatePage.jsx
    └── services/
        └── api.js
```

---

## PART C — COMMON FAILURE TABLE

| Symptom | Root Cause | Fix |
|---------|------------|-----|
| `401` on private endpoints even with token | Audience mismatch | `AUTH0_AUDIENCE` in backend must exactly equal `VITE_AUTH0_AUDIENCE` in frontend |
| CORS error in browser console | Spring CORS not accepting origin | `SecurityConfig.corsConfigurationSource()` must list `http://localhost:5173` |
| `invalid_token` from Spring | Wrong issuer-uri format | `issuer-uri` in `application.yml` must end with trailing slash: `https://TENANT.us.auth0.com/` |
| Auth0 redirect loop after login | Wrong Callback URL in Auth0 dashboard | Set Allowed Callback URLs = `http://localhost:5173` (no trailing slash) |
| H2 console blocked (403/frame) | X-Frame-Options | `.headers(h -> h.frameOptions(f -> f.disable()))` must be in SecurityConfig |
| `getAccessTokenSilently` throws | Audience not set in `Auth0Provider` | `authorizationParams.audience` must be set in `main.jsx` |

---

## PART D — VIDEO OUTLINE (10–12 min)

1. **(0:00–1:30)** Architecture overview — show the flow: browser → Auth0 → JWT → Spring → H2
2. **(1:30–3:00)** Auth0 dashboard — show API and SPA App settings
3. **(3:00–5:30)** Backend walkthrough — `SecurityConfig`, `AudienceValidator`, public vs private controllers
4. **(5:30–8:00)** Live demo — login → private page → show JWT subject + H2 items
5. **(8:00–10:00)** Frontend walkthrough — `Auth0Provider` in `main.jsx`, `ProtectedRoute`, `getAccessTokenSilently`
6. **(10:00–end)** Logout demo + summary