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
