import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { HelmetProvider } from 'react-helmet-async';
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
import LandingPage from "@/pages/landing/LandingPage";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthProvider from "@/components/AuthProvider";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import Pricing from "@/pages/Pricing";

function AppLayout() {
  return (
    <HelmetProvider>
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
            
            {/* ✅ SEO Landing Pages - 20 Dynamic Pages */}
            <Route path="/landing/:slug" element={<LandingPage />} />
            
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
            
            {/* 404 Page */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page not found</p>
                  <a href="/" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Return to Homepage
                  </a>
                </div>
              </div>
            } />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}