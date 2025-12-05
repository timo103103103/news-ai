import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import NewsIntelligenceLanding from "@/pages/NewsIntelligenceLanding";
import History from "@/pages/History";
import AnalysisDetail from "@/pages/AnalysisDetail";
import AnalysisResultPage from "@/pages/AnalysisResultPage";
import Account from "@/pages/Account";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Logout from "@/pages/Logout";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AuthCallback from "@/pages/AuthCallback";
import NewsAnalysis from "@/pages/NewsAnalysis";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthProvider from "@/components/AuthProvider";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import Pricing from "@/pages/Pricing";

function AppLayout() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* News Intelligence Landing Page - Public */}
          <Route path="/news-intelligence" element={<NewsIntelligenceLanding />} />
          
          {/* ✅ News Analysis Page - Public with SubscriptionProvider */}
          <Route path="/news-analysis" element={
            <SubscriptionProvider>
              <NewsAnalysis />
            </SubscriptionProvider>
          } />
          
          {/* ✅ Analysis Results Page - Public with SubscriptionProvider */}
          <Route path="/results" element={
            <SubscriptionProvider>
              <AnalysisResultPage />
            </SubscriptionProvider>
          } />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          
          <Route path="/history" element={
            <ProtectedRoute>
              <SubscriptionProvider>
                <History />
              </SubscriptionProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/analysis/:id" element={
            <ProtectedRoute>
              <SubscriptionProvider>
                <AnalysisDetail />
              </SubscriptionProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/account" element={
            <ProtectedRoute>
              <SubscriptionProvider>
                <Account />
              </SubscriptionProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/pricing" element={
            <SubscriptionProvider>
              <Pricing />
            </SubscriptionProvider>
          } />
          
          <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}