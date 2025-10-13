// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  // --- Auth state using localStorage ---
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  // --- Listen for auth changes from same tab + other tabs ---
  useEffect(() => {
    const handleAuthChange = (event) => {
      if (event.detail) {
        // ✅ Same-tab update with payload
        const { token, user } = event.detail;
        setIsLoggedIn(!!token);
        setUser(user || null);
      } else {
        // Fallback for cross-tab/localStorage updates
        setIsLoggedIn(!!localStorage.getItem("token"));
        try {
          const u = localStorage.getItem("user");
          setUser(u ? JSON.parse(u) : null);
        } catch {
          setUser(null);
        }
      }
    };

    // For same-tab updates
    window.addEventListener("authChanged", handleAuthChange);

    // For cross-tab sync (storage event)
    const handleStorage = () => handleAuthChange({});
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // --- Theme system ---
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    return stored || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // keep legacy class for older css bits if you used it
    document.body.classList.toggle("dark-mode", theme === "dark");
    localStorage.setItem("theme", theme);

    // Notify same-tab listeners and any components listening for theme changes.
    // detail includes the theme value so listeners can react if needed.
    window.dispatchEvent(new CustomEvent("themeChanged", { detail: { theme } }));
  }, [theme]);

  // --- Logout handler ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Notify all listeners
    window.dispatchEvent(new CustomEvent("authChanged", { detail: { token: null, user: null } }));
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  // --- Role-based dashboard redirect ---
  const handleDashboardRedirect = () => {
    const role = user?.role?.toLowerCase?.();
    if (role === "teacher" || role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const baseLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Courses", path: "/courses" },
    { name: "Enroll", path: "/enroll" },
  ];

  // --- Navbar render ---
  return (
    <nav
      className={`navbar navbar-expand-lg shadow-sm sticky-top ${
        theme === "dark" ? "navbar-dark bg-dark" : "navbar-light bg-light"
      }`}
    >
      <div className="container-fluid">
        <NavLink to="/" className="navbar-brand fw-bold">
          Bright Learning Path
        </NavLink>

        <div className="d-flex align-items-center">
          {/* Theme toggle */}
          <button
            className={`btn btn-sm me-2 ${theme === "dark" ? "btn-light" : "btn-dark"}`}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
        </div>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {baseLinks.map((link) => (
              <li className="nav-item" key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active fw-semibold" : ""}`
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}

            {/* Auth Buttons */}
            {!isLoggedIn ? (
              <>
                <li className="nav-item">
                  <NavLink to="/register" className="nav-link">
                    Register
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link">
                    Login
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle btn btn-link"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {user?.name || "Account"}
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="userDropdown"
                  >
                    <li>
                      <button className="dropdown-item" onClick={handleDashboardRedirect}>
                        Dashboard
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
