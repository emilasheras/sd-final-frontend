import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import HomePage from './pages/HomePage.jsx'
import PublicPage from './pages/PublicPage.jsx'
import PrivatePage from './pages/PrivatePage.jsx'

function App() {
  return (
    <div className="h-screen bg-zinc-900 flex flex-col">
      <NavBar />
      <main className="flex-1 overflow-hidden flex flex-col container mx-auto px-4 py-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/public" element={<PublicPage />} />
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <PrivatePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
