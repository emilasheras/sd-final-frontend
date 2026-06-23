# Decision Log

This file records the design and development decisions taken while implementing the frontend app from `SD_FINAL_IMPLEMENTATION_PLAN.md`.

## 2026-06-23

### Repository Setup

- Implemented the Vite React frontend directly in the current repository root.
- Did not run `npm create vite@latest sd-final-frontend` because the shell was already positioned inside the `sd-final-frontend` git repository.
- Avoided creating a nested `sd-final-frontend/sd-final-frontend` directory.
- Preserved the existing `LICENSE`.
- Left `SD_FINAL_IMPLEMENTATION_PLAN.md` untracked and out of the implementation commit because it existed as source material, not app code.

### Stack

- Used React with plain JavaScript and Vite, matching the implementation plan.
- Used React Router DOM for `/`, `/public`, and `/private`.
- Used Tailwind CSS 3 with PostCSS and Autoprefixer.
- Used Auth0 React SDK via `@auth0/auth0-react`.

### Dependency Decisions

- Initially implemented the app with Vite 5-compatible dependencies.
- `npm audit` reported a vulnerable `esbuild` chain through Vite.
- Upgraded Vite to `8.0.16` and `@vitejs/plugin-react` to `6.0.2` because the local Node version was `v22.22.1`, which satisfies their engine requirement.
- Kept runtime packages in `dependencies`: `@auth0/auth0-react`, `react`, `react-dom`, `react-router-dom`.
- Kept build tooling in `devDependencies`: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`.
- Verified after upgrade with `npm run build` and `npm audit --audit-level=high`.

### Auth0 Configuration

- Added `.env.local` locally with Vite environment variables.
- Added `.env.local` and `.env.*.local` to `.gitignore` so Auth0 tenant configuration is not committed.
- Updated local `.env.local` with:
  - `VITE_AUTH0_DOMAIN=dev-ym26lu2aglwbsv3n.us.auth0.com`
  - `VITE_AUTH0_CLIENT_ID=2GOpjlAAhBl5IPIF6GEaPeWkuk8vnjba`
  - `VITE_AUTH0_AUDIENCE=https://sd-final-api`
  - `VITE_API_BASE_URL=http://localhost:8080`
- Did not request or store the Auth0 client secret because this is a SPA frontend. The client secret must remain server-side and must never be placed in frontend code or frontend environment files.

### App Structure

- Created `src/main.jsx` to mount React, configure `BrowserRouter`, and wrap the app with `Auth0Provider`.
- Configured Auth0 with:
  - `domain` from `VITE_AUTH0_DOMAIN`
  - `clientId` from `VITE_AUTH0_CLIENT_ID`
  - `authorizationParams.redirect_uri=window.location.origin`
  - `authorizationParams.audience` from `VITE_AUTH0_AUDIENCE`
- Created `src/App.jsx` with the route layout:
  - `/` renders `HomePage`
  - `/public` renders `PublicPage`
  - `/private` renders `PrivatePage` through `ProtectedRoute`
- Created `src/components/NavBar.jsx` with public navigation, login, logout, authenticated user email, and conditional private route link.
- Created `src/components/ProtectedRoute.jsx` to redirect unauthenticated users to Auth0 login.
- Created `src/services/api.js` to isolate backend fetch calls.
- Created page components:
  - `HomePage.jsx`
  - `PublicPage.jsx`
  - `PrivatePage.jsx`

### Protected Route Behavior

- The implementation plan called `loginWithRedirect()` directly during render when unauthenticated.
- Implemented the redirect inside `useEffect` instead.
- Rationale: calling `loginWithRedirect()` during render is a side effect and can cause React warnings or repeated render behavior. `useEffect` preserves the same user behavior while following React execution rules.

### UI Decisions

- Followed the plan's minimal Tailwind layout and page structure.
- Kept the app visually simple because the implementation plan explicitly required minimal viable scope and no extras.
- Used responsive grid behavior on the home page so the two cards work on small screens.
- Used ASCII text in newly created files where practical to match repository editing constraints.

### API Integration

- Public page calls `GET /api/public/ping` without a token.
- Private page calls `getAccessTokenSilently()` and then calls:
  - `GET /api/private/hello`
  - `GET /api/private/items`
- Authorization headers use `Bearer ${token}`.
- API base URL comes from `VITE_API_BASE_URL`, defaulting locally to `http://localhost:8080`.

### Git Decisions

- Created one verified implementation commit:
  - `7318afa feat: scaffold Auth0 frontend`
- Did not commit `.env.local` because it is ignored intentionally.
- Did not commit `SD_FINAL_IMPLEMENTATION_PLAN.md` because it was pre-existing untracked source material.

### Verification Performed

- Ran `npm install` to generate `node_modules` and `package-lock.json`.
- Ran `npm run build`; build passed.
- Ran `npm audit --audit-level=high`; initial audit found a vulnerable Vite/esbuild chain.
- Upgraded Vite and React plugin.
- Ran `npm run build` again; build passed.
- Ran `npm audit --audit-level=high` again; result was `0 vulnerabilities`.
- After updating Auth0 values in `.env.local`, ran `npm run build` again; build passed.

### Current Known State

- The frontend compiles successfully.
- Auth0 domain and client ID are configured locally in `.env.local`.
- The Auth0 audience is `https://sd-final-api`, matching the backend plan.
- Runtime login behavior still depends on the Auth0 dashboard being configured with `http://localhost:5173` for:
  - Allowed Callback URLs
  - Allowed Logout URLs
  - Allowed Web Origins
- Backend integration depends on the Spring Boot backend running at `http://localhost:8080`.
- The backend must use the same Auth0 audience and issuer for private endpoint authentication to work.
