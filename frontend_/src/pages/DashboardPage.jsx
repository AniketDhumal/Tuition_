// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import "../styles/dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const progressRef = useRef(null);
  const questionRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 992);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onThemeChanged = (e) => {
      const newTheme = e?.detail?.theme || localStorage.getItem("theme") || "light";
      setTheme(newTheme);
    };
    window.addEventListener("themeChanged", onThemeChanged);
    const stored = localStorage.getItem("theme");
    if (stored) setTheme(stored);
    return () => window.removeEventListener("themeChanged", onThemeChanged);
  }, []);

  useEffect(() => {
    // Keep document data-theme in sync (Navbar does this too)
    document.documentElement.setAttribute("data-theme", theme);
    document.body.classList.toggle("dark-mode", theme === "dark");
  }, [theme]);

  // close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile) return;
    if (!sidebarOpen) return;
    const onDocClick = (e) => {
      const sidebar = document.getElementById("sidebar");
      if (!sidebar) return;
      if (!sidebar.contains(e.target)) setSidebarOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [isMobile, sidebarOpen]);

  const courses = useMemo(
    () => [
      { id: "math", title: "Math", progress: 80, color: "#db7979" },
      { id: "science", title: "Science", progress: 65, color: "#7dce81" },
      { id: "english", title: "English", progress: 90, color: "#84b4cb" },
    ],
    []
  );

  const assignments = useMemo(
    () => [
      { id: 1, text: "Math Test - Sep 20, 2024" },
      { id: 2, text: "Science Project - Sep 22, 2024" },
      { id: 3, text: "English Essay - Sep 25, 2024" },
    ],
    []
  );

  const labelColor = theme === "dark" ? "#e6e6e6" : "#111827";
  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: labelColor, font: { weight: "600" } } },
      tooltip: { backgroundColor: theme === "dark" ? "#222" : "#333", titleColor: "#fff", bodyColor: "#fff" },
    },
    scales: {
      y: { ticks: { color: labelColor }, grid: { display: false } },
      x: { ticks: { color: labelColor }, grid: { display: false } },
    },
  };

  const progressData = {
    labels: courses.map((c) => c.title),
    datasets: [
      {
        label: "Progress (%)",
        data: courses.map((c) => c.progress),
        backgroundColor: courses.map((c) => c.color),
        borderColor: "rgba(255,255,255,0.06)",
        borderWidth: 2,
      },
    ],
  };

  const questionData = {
    labels: ["Correct", "Wrong", "Unattempted"],
    datasets: [
      {
        label: "Question Analysis",
        data: [40, 10, 5],
        backgroundColor: ["#4caf50", "#f44336", "#ff9800"],
        borderColor: "rgba(255,255,255,0.06)",
        borderWidth: 2,
      },
    ],
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { to: "/courses", label: "Courses", icon: "fas fa-book-open" },
    { to: "/profile", label: "Profile", icon: "fas fa-user" },
    { to: "/results", label: "Results", icon: "fas fa-graduation-cap" },
  ];

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  return (
    <div className={`dashboard-root ${sidebarOpen ? "sidebar-open" : "sidebar-closed"} theme-${theme}`}>
      {/* BACKDROP on mobile when sidebar is open */}
      {isMobile && sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

      <aside
        id="sidebar"
        className={`sidebar ${sidebarOpen ? "open" : "closed"} ${isMobile ? "mobile" : "desktop"}`}
        aria-hidden={!sidebarOpen && isMobile}
        aria-label="Main navigation"
      >
        <div className="sidebar-header">
          <div className="brand">
            <strong>Bright</strong> Learning
          </div>
          <button
            className="collapse-btn"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            title={sidebarOpen ? "Collapse" : "Expand"}
          >
            <i className="fas fa-chevron-left" />
          </button>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Sidebar">
          <ul className="menu-list">
            {navItems.map((item) => (
              <li key={item.to} className={location.pathname === item.to ? "active" : ""}>
                <Link to={item.to} onClick={() => isMobile && setSidebarOpen(false)}>
                  <i className={item.icon} aria-hidden="true" />
                  <span className="menu-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <small>© {new Date().getFullYear()} Bright</small>
        </div>
      </aside>

      <main className="main-content" id="mainContent" tabIndex={-1}>
        <header className="dashboard-header">
          <div className="left-controls">
            <button
              className="icon-btn"
              onClick={toggleSidebar}
              aria-expanded={sidebarOpen}
              aria-controls="sidebar"
              title="Toggle sidebar"
            >
              <i className="fas fa-bars" />
            </button>
            <h1 className="page-title">Welcome, Aniket</h1>
          </div>

          <div className="header-actions">
            <button
              className="btn-ghost"
              onClick={() => {
                const newTheme = theme === "dark" ? "light" : "dark";
                setTheme(newTheme);
                document.documentElement.setAttribute("data-theme", newTheme);
                document.body.classList.toggle("dark-mode", newTheme === "dark");
                localStorage.setItem("theme", newTheme);
                window.dispatchEvent(new CustomEvent("themeChanged", { detail: { theme: newTheme } }));
              }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>

            <button
              className="btn-ghost"
              onClick={() => {
                // quick logout example — replace with real logic if you have it
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <section className="overview">
          <h2>Course Overview</h2>
          <div className="card-grid">
            {courses.map((c) => (
              <div key={c.id} className="card overview-card">
                <div className="card-head">
                  <h3>{c.title}</h3>
                </div>
                <div className="card-body">
                  <div className="progress-row">
                    <div className="progress-bar-outer" aria-hidden>
                      <div className="progress-bar-inner" style={{ width: `${c.progress}%`, background: c.color }} />
                    </div>
                    <div className="progress-value">{c.progress}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="upcoming-assignments">
          <h2>Upcoming Assignments</h2>
          <ul>
            {assignments.map((a) => (
              <li key={a.id} className="assignment">
                {a.text}
              </li>
            ))}
          </ul>
        </section>

        <section className="performance-chart">
          <h2>Performance Overview</h2>
          <div className="chart-container">
            <div style={{ height: 360 }}>
              <Bar ref={progressRef} data={progressData} options={baseChartOptions} />
            </div>
          </div>
        </section>

        <section className="question-analysis">
          <h2>Question Analysis</h2>
          <div className="chart-container">
            <div style={{ height: 360 }}>
              <Pie ref={questionRef} data={questionData} options={baseChartOptions} />
            </div>
          </div>
        </section>
      </main>

      <button
        className="fab-toggle"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        onClick={toggleSidebar}
        title="Toggle sidebar"
      >
        <i className="fas fa-bars" />
      </button>
    </div>
  );
}
