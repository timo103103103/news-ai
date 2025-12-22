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
import { supabase } from "@/lib/supabase";
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const isAuthenticated = !!user;
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    await useAuthStore.getState().signOut();
    navigate("/login");
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center h-14 justify-between">

          {/* LOGO */}
          <div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => navigate("/")}
            aria-label={BRAND_NAME}
          >
            <Logo size={48} showText={false} />
            <div className="text-lg font-extrabold tracking-tight">
              <span className="text-slate-900 dark:text-white">NexVeris</span>
              <span className="text-blue-600">.ai</span>
            </div>
          </div>

          {/* DESKTOP NAV (only when logged in) */}
          <nav className="hidden md:flex items-center gap-6 justify-center flex-1">
              <NavBtn
                active={isActive("/")}
                label="Home"
                icon={<Home className="w-4 h-4 mr-2" />}
                onClick={() => navigate("/")}
              />
              <NavBtn
                active={isActive("/analyze") || isActive("/news-analysis")}
                label="Analyse"
                icon={<BarChart3 className="w-4 h-4 mr-2" />}
                onClick={() => navigate("/analyze")}
              />
              <NavBtn
                active={isActive("/history")}
                label="History"
                icon={<History className="w-4 h-4 mr-2" />}
                onClick={() => navigate("/history")}
              />
              <NavBtn
                active={isActive("/pricing")}
                label="Pricing"
                icon={<CreditCard className="w-4 h-4 mr-2" />}
                onClick={() => navigate("/pricing")}
              />
              <NavBtn
                active={isActive("/account")}
                label="Account"
                icon={<UserIcon className="w-4 h-4 mr-2" />}
                onClick={() => navigate("/account")}
              />
          </nav>

          {/* RIGHT SIDE AUTH PANEL */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
                  {user?.email}
                </span>

                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {user?.plan?.toUpperCase() || "FREE"}
                </span>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium 
                  text-gray-700 dark:text-gray-300 
                  hover:bg-gray-100 dark:hover:bg-slate-800 
                  rounded-md transition"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
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
                  className="inline-flex items-center px-3 py-2 text-sm font-medium 
                  rounded-md bg-blue-600 text-white hover:bg-blue-700 
                  dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden">
              <button
                className="inline-flex items-center p-2 rounded-md 
                text-gray-700 dark:text-gray-200 
                hover:bg-gray-100 dark:hover:bg-slate-800"
                aria-label="Toggle menu"
                onClick={() => setMobileOpen((o) => !o)}
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
        </div>

        {/* MOBILE NAV MENU */}
        <div className={`md:hidden ${mobileOpen ? "block" : "hidden"} border-t border-slate-200 dark:border-slate-800 mt-2`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {[
                { path: "/", label: "Home" },
                { path: "/analyze", label: "Analyse" },
                { path: "/history", label: "History" },
                { path: "/pricing", label: "Pricing" }
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setMobileOpen(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-md transition 
                    ${
                      isActive(item.path)
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-900/40 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
      </div>
    </header>
  );
}

/* ---------- Reusable Nav Button ---------- */
function NavBtn({
  active,
  label,
  icon,
  onClick
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition
        ${
          active
            ? "text-blue-600 bg-blue-50 dark:bg-blue-900/40 dark:text-blue-300"
            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}
