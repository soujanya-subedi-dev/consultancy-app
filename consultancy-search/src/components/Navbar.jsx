import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("public");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole") || "public";
    setIsLoggedIn(!!token);
    setUserRole(role);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    setUserRole("public");
    setIsMenuOpen(false);
    navigate("/");
  };

  // Define navigation based on user role
  const getNavLinks = () => {
    if (!isLoggedIn) {
      // Public users
      return [
        { path: "/", label: "Home", icon: "mdi:home" },
        { path: "/register", label: "Register", icon: "mdi:account-plus" },
        { path: "/login", label: "Login", icon: "mdi:login" },
      ];
    }

    if (userRole === "admin") {
      // Admin users
      return [
        { path: "/", label: "Home", icon: "mdi:home" },
        { path: "/admin", label: "Dashboard", icon: "mdi:shield-admin" },
      ];
    }

    if (userRole === "consultancy") {
      // Consultancy users
      return [
        { path: "/", label: "Home", icon: "mdi:home" },
        { path: "/profile", label: "Dashboard", icon: "mdi:view-dashboard" },
      ];
    }

    return [
      { path: "/", label: "Home", icon: "mdi:home" },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition">
            <Icon icon="mdi:school" className="text-2xl" />
            <span>EduSearch</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
                  isActive(link.path)
                    ? "bg-blue-700 font-semibold"
                    : "hover:bg-blue-700/50"
                }`}
              >
                <Icon icon={link.icon} className="text-lg" />
                <span>{link.label}</span>
              </Link>
            ))}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-red-600 transition ml-2"
              >
                <Icon icon="mdi:logout" className="text-lg" />
                <span>Logout</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-blue-700 rounded-lg transition"
          >
            <Icon
              icon={isMenuOpen ? "mdi:close" : "mdi:menu"}
              className="text-2xl"
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  isActive(link.path)
                    ? "bg-blue-700 font-semibold"
                    : "hover:bg-blue-700/50"
                }`}
              >
                <Icon icon={link.icon} className="text-lg" />
                <span>{link.label}</span>
              </Link>
            ))}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-600 transition text-left"
              >
                <Icon icon="mdi:logout" className="text-lg" />
                <span>Logout</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
