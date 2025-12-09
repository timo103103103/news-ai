import { useNavigate, useLocation } from "react-router-dom";
import {
  History,
  Home,
  BarChart3,
  CreditCard,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus
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
            <div className="text-lg font-extrabold tracking-tight flex items-baseline gap-1">
              <span className="text-blue-600">NexVeris</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                AI
              </span>
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
              />
              <NavBtn
                active={isActive("/news-analysis")}
                label="Analyze"
                icon={<BarChart3 className="w-4 h-4 mr-2" />}
                onClick={() => navigate("/news-analysis")}
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
      </div>
    </header>
  );
}

/* ✅ Reusable Nav Button */
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
