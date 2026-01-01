import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import InstallPrompt from '@/components/InstallPrompt';
import AuthProvider from "./components/AuthProvider";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";

import ProtectedRoute from "./routes/ProtectedRoute";
import GuestOnly from "./routes/GuestOnly";

// Layout
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pricing from "./pages/Pricing";
import NewsAnalysis from "./pages/NewsAnalysis";
import AnalysisResultPage from "./pages/AnalysisResultPage";
import Account from "./pages/Account";
import History from "./pages/History";
import AnalysisDetail from "./pages/AnalysisDetail";
import AuthCallback from "./pages/AuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Logout from "./pages/Logout";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
          <div className="min-h-screen bg-white text-slate-900 dark:bg-gray-950 dark:text-slate-100 selection:bg-neonCyan selection:text-gray-900">
            <Routes>

              {/* ===== Layout Wrapper ===== */}
              <Route element={<Layout />}>

                {/* ===== Public Pages ===== */}
                <Route path="/" element={<Home />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/logout" element={<Logout />} />

                {/* ===== Guest Only (已登入不可進) ===== */}
                <Route
                  path="/login"
                  element={
                    <GuestOnly>
                      <Login />
                    </GuestOnly>
                  }
                />

                <Route
                  path="/signup"
                  element={
                    <GuestOnly>
                      <Signup />
                    </GuestOnly>
                  }
                />

                {/* ===== Protected Pages (必須登入) ===== */}
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

                {/* ===== Fallback ===== */}
                <Route path="*" element={<Navigate to="/" replace />} />

              </Route>
            </Routes>
          </div>
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
<>
  {/* 你原本嘅內容 */}
  <InstallPrompt />
</>
