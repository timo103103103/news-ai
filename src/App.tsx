import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider from './components/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'

// Components
import Header from './components/Header'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Pricing from './pages/Pricing'
import NewsAnalysis from './pages/NewsAnalysis'
import AnalysisResultPage from './pages/AnalysisResultPage'
import Account from './pages/Account'
import History from './pages/History'
import AnalysisDetail from './pages/AnalysisDetail'
import AuthCallback from './pages/AuthCallback'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Logout from './pages/Logout'
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        
        {/* Header always visible */}
        <Header />

        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />  {/* LANDING PAGE - PUBLIC */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/logout" element={<Logout />} />
		  <Route path="/privacy" element={<Privacy />} />
		  <Route path="/terms" element={<Terms />} />


          {/* Protected Pages */}
          <Route
            path="/analyze"
            element={
              <ProtectedRoute>
                <NewsAnalysis />
              </ProtectedRoute>
            }
          />

          <Route
            path="/news-analysis"
            element={
              <ProtectedRoute>
                <NewsAnalysis />
              </ProtectedRoute>
            }
          />

          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <AnalysisResultPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analysis/:id"
            element={
              <ProtectedRoute>
                <AnalysisDetail />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
