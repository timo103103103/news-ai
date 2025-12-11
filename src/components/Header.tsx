import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  History,
  Home,
  BarChart3,
  CreditCard,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X
} from "lucide-react";

import Logo from "./Logo";
import useAuthStore from "../stores/authStore";
import { BRAND_NAME } from "../brand";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Single source of truth
  const user = useAuthStore((s) => s.user);

  const isAuthenticated = !!user;
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ✅ LOGO */}
          <div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => navigate("/")}
            aria-label={BRAND_NAME}
          >
            <Logo size={48} showText={false} />
            <div className="text-lg font-extrabold tracking-tight">
              <span className="text-slate-900">NexVeris</span>
              <span className="text-blue-600">.ai</span>
            </div>
          </div>

          {/* ✅ NAVIGATION (ONLY WHEN LOGGED IN) */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-8">
              <NavBtn
                active={isActive("/")}
                label="Home"
                icon={<Home className="w-4 h-4 mr-2" />}
                onClick={() => navigate("/")}
                ariaLabel="Home"
                ariaCurrent={isActive("/") ? "page" : undefined}
              />
              <NavBtn
                active={isActive("/analyze") || isActive("/news-analysis")}
                label="Analyse"
                icon={<BarChart3 className="w-4 h-4 mr-2" />}
                onClick={() => navigate("/analyze")}
                ariaLabel="Analyse"
                ariaCurrent={isActive("/analyze") || isActive("/news-analysis") ? "page" : undefined}
              />
              <NavBtn
                active={isActive("/history")}
                label="History"
                icon={<History className="w-4 h-4 mr-2" />}
                onClick={() => navigate("/history")}
                ariaLabel="History"
                ariaCurrent={isActive("/history") ? "page" : undefined}
              />
              <NavBtn
                active={isActive("/pricing")}
                label="Pricing"
                icon={<CreditCard className="w-4 h-4 mr-2" />}
                onClick={() => navigate("/pricing")}
                ariaLabel="Pricing"
                ariaCurrent={isActive("/pricing") ? "page" : undefined}
              />
              <NavBtn
                active={isActive("/account")}
                label="Account"
                icon={<UserIcon className="w-4 h-4 mr-2" />}
                onClick={() => navigate("/account")}
              />
            </nav>
          )}

          {/* ✅ RIGHT SIDE AUTH */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-sm text-gray-700">
                  {user?.email}
                </span>

                {/* ✅ SHOW PLAN */}
                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                  {user?.plan?.toUpperCase() || "FREE"}
                </span>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center px-3 py-2 text-sm font-bold bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-all"
                >
                  Get Started
                </button>
              </>
            ) : (
              <>
                <NavBtn
                  active={isActive("/login")}
                  label="Login"
                  icon={<LogIn className="w-4 h-4 mr-1" />}
                  onClick={() => navigate("/login")}
                />
                <button
                  onClick={() => navigate("/signup")}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
        {/* Mobile menu toggle and panel */}
        {isAuthenticated && (
          <div className="md:hidden">
            <button
              className="inline-flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Toggle menu"
              aria-controls="mobile-nav"
              aria-expanded={mobileOpen ? "true" : "false"}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div id="mobile-nav" className={`${mobileOpen ? "block" : "hidden"} border-t mt-2`}>
              <div className="px-2 pt-2 pb-3 space-y-1" role="menu" aria-label="Primary">
                <button onClick={() => { navigate("/"); setMobileOpen(false); }} className={`block w-full text-left px-3 py-2 rounded-md ${isActive("/") ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-100"}`}>Home</button>
                <button onClick={() => { navigate("/analyze"); setMobileOpen(false); }} className={`block w-full text-left px-3 py-2 rounded-md ${(isActive("/analyze") || isActive("/news-analysis")) ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-100"}`}>Analyse</button>
                <button onClick={() => { navigate("/history"); setMobileOpen(false); }} className={`block w-full text-left px-3 py-2 rounded-md ${isActive("/history") ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-100"}`}>History</button>
                <button onClick={() => { navigate("/pricing"); setMobileOpen(false); }} className={`block w-full text-left px-3 py-2 rounded-md ${isActive("/pricing") ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-100"}`}>Pricing</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* ✅ Reusable Nav Button */
function NavBtn({
  active,
  label,
  icon,
  onClick,
  ariaLabel,
  ariaCurrent
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  ariaCurrent?: "page" | undefined;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel || label}
      aria-current={ariaCurrent}
      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition ${
        active
          ? "text-blue-600 bg-blue-50"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
