import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import {Login} from './pages/Login.jsx'
import {Register} from './pages/Register.jsx'
import Prescription from './pages/Prescription.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RedirectIfAuth from './components/RedirectAuth.jsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-200 p-4 font-sans">
        <nav className="flex gap-4 mb-6 text-blue-400 max-w-4xl mx-auto">
          <Link className="hover:underline" to="/login">Login</Link>
          <Link className="hover:underline" to="/register">Register</Link>
          <Link className="hover:underline" to="/upload">Upload Prescription</Link>
        </nav>
        <div className="max-w-4xl mx-auto">
        <Routes>
          <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />
          <Route path="/upload" element={<ProtectedRoute><Prescription /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><Prescription /></ProtectedRoute>} />
          <Route path="*" element={<Login />} />
        </Routes>
        </div>
      </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
