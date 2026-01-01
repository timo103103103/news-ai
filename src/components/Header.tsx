import { useNavigate, useLocation } from "react-router-dom";
import { useSubscription } from '@/contexts/SubscriptionContext'
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
  X,
  BookOpen,
  HelpCircle,
  ChevronDown as DropdownIcon,
} from "lucide-react";

import Logo from "./Logo";
import useAuthStore from "../stores/authStore";
import { BRAND_NAME } from "../brand";
import { supabase } from "@/lib/supabase";
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const { plan, loading } = useSubscription()
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const isAuthenticated = !!user;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const goToHomeSection = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setLearnOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    await useAuthStore.getState().signOut();
    navigate("/login");
  };

  const breadcrumbs = location.pathname.split('/').filter(Boolean).map((p, i) => (
    <span key={i} className="text-sm text-gray-500">{p}</span>
  ));

  return (
    <header
  className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-50 h-14"
  style={{ ["--header-height" as any]: "3.5rem" }}
>
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

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8 justify-center flex-1" role="navigation" aria-label="Main navigation"> {/* Increased gap-8 */}
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
            {/* Dropdown for Learn (fixed typos) */}
            <div className="relative" onMouseEnter={() => setLearnOpen(true)} onMouseLeave={() => setLearnOpen(false)}>
              <button
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 rounded-md transition"
                aria-haspopup="true"
                aria-expanded={learnOpen}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Learn
                <DropdownIcon className="w-4 h-4 ml-1" />
              </button>
              {learnOpen && (
                <div className="absolute top-full left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg py-2" style={{ transitionDelay: '150ms' }}>
                  <NavBtn label="How it Works" onClick={() => goToHomeSection("explanation")} />
                  <NavBtn label="Features" onClick={() => goToHomeSection("features")} />
                  <NavBtn label="FAQ" onClick={() => goToHomeSection("faq")} />
                </div>
              )}
            </div>
            <NavBtn
              active={isActive("/account")}
              label="Account"
              icon={<UserIcon className="w-4 h-4 mr-2" />}
              onClick={() => navigate("/account")}
            />
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4"> {/* Increased gap */}
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"> {/* nowrap */}
                  {user?.email}
                </span>

{!loading && (
  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
    {plan.toUpperCase()}
  </span>
)}

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium 
                  text-gray-700 dark:text-gray-300 
                  hover:bg-gray-100 dark:hover:bg-slate-800 
                  rounded-md transition"
                  aria-label="Logout"
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
                  aria-label="Sign Up"
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
              { path: "/pricing", label: "Pricing" },
              { path: "/how-it-works", label: "How it Works" },
              { path: "/features", label: "Features" },
              { path: "/faq", label: "FAQ" },
              { path: "/account", label: "Account" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-md transition whitespace-nowrap 
                  ${
                    isActive(item.path)
                      ? "text-blue-600 bg-blue-50 dark:bg-blue-900/40 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                aria-current={isActive(item.path) ? "page" : undefined}
              >
                {item.label}
              </button>
            ))}
          </div>
          {/* Mobile Breadcrumbs */}
          <div className="px-4 py-2 text-sm flex gap-2 border-t"> {/* Increased gap */}
            {breadcrumbs}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- Reusable Nav Button ---------- */
function NavBtn({
  active = false,
  label,
  icon = null,
  onClick
}: {
  active?: boolean;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition whitespace-nowrap
        ${
          active
            ? "text-blue-600 bg-blue-50 dark:bg-blue-900/40 dark:text-blue-300"
            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
        }`}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      {label}
    </button>
  );
}
