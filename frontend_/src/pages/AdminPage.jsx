// src/pages/AdminPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/admin.css";

export default function Admin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // central theme state derived from html[data-theme]
  const getRootTheme = () =>
    document.documentElement.getAttribute("data-theme") ||
    localStorage.getItem("theme") ||
    "light";

  const [theme, setTheme] = useState(getRootTheme());

  useEffect(() => {
    // Listen for Navbar dispatches
    function onThemeChanged(e) {
      const newTheme = (e && e.detail && e.detail.theme) || getRootTheme();
      setTheme(newTheme);
      // Ensure html attribute is correct (defensive)
      document.documentElement.setAttribute("data-theme", newTheme);
    }

    // Run once to sync at mount
    setTheme(getRootTheme());

    window.addEventListener("themeChanged", onThemeChanged);
    // Also listen to storage in case theme changed in another tab
    function onStorage(e) {
      if (e.key === "theme") setTheme(getRootTheme());
    }
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("themeChanged", onThemeChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // other state + effects unchanged...
  const [stats, setStats] = useState({
    totalResources: 0,
    totalCourses: 0,
    totalResults: 0,
    totalDownloads: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchActivities();
    const onResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  async function fetchStats() {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats({
        totalResources: data.totalResources || 0,
        totalCourses: data.totalCourses || 0,
        totalResults: data.totalResults || 0,
        totalDownloads: data.totalDownloads || 0,
      });
    } catch (err) {
      console.warn("Could not load stats — running with cached/default values.", err);
    } finally {
      setLoadingStats(false);
    }
  }

  async function fetchActivities() {
    setLoadingActivities(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/activities", {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setActivities(Array.isArray(data.activities) ? data.activities : data || []);
    } catch (err) {
      console.warn("Could not load activities — running with cached/default values.", err);
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  }

  function getActivityIcon(type) {
    const icons = {
      resource: "fas fa-file-alt",
      course: "fas fa-book",
      result: "fas fa-graduation-cap",
      download: "fas fa-download",
      system: "fas fa-cog",
    };
    return icons[type] || "fas fa-bell";
  }

  return (
    <div className={`container-fluid admin-page ${theme === "dark" ? "theme-dark" : ""}`}>
      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? "sidebar-expanded" : ""}`} id="sidebar">
        <div className="sidebar-header">
          <h3>Admin Dashboard</h3>
        </div>
        <ul className="menu-list">
          <li>
            <Link to="/admin">
              <i className="fas fa-tachometer-alt" /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/manage-resources">
              <i className="fas fa-file-alt" /> Manage Resources
            </Link>
          </li>
          <li>
            <Link to="/manage-courses">
              <i className="fas fa-book-open" /> Manage Courses
            </Link>
          </li>
          <li>
            <Link to="/manage-results">
              <i className="fas fa-graduation-cap" /> Manage Results
            </Link>
          </li>
          
        </ul>
      </nav>

      {/* Main content */}
      <main className="main-content" id="mainContent">
        <header>
          <div className="welcome">
            <h1>Admin Dashboard</h1>
          </div>
        </header>

        <section className="admin-overview">
          <div className="row">
            <div className="col-md-3">
              <div className="stat-card">
                <div className="stat-icon bg-primary">
                  <i className="fas fa-file-alt" />
                </div>
                <div className="stat-info">
                  <h3 id="total-resources">{loadingStats ? "..." : stats.totalResources}</h3>
                  <p>Total Resources</p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stat-card">
                <div className="stat-icon bg-success">
                  <i className="fas fa-book-open" />
                </div>
                <div className="stat-info">
                  <h3 id="total-courses">{loadingStats ? "..." : stats.totalCourses}</h3>
                  <p>Total Courses</p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stat-card">
                <div className="stat-icon bg-warning">
                  <i className="fas fa-graduation-cap" />
                </div>
                <div className="stat-info">
                  <h3 id="total-results">{loadingStats ? "..." : stats.totalResults}</h3>
                  <p>Results Recorded</p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stat-card">
                <div className="stat-icon bg-info">
                  <i className="fas fa-download" />
                </div>
                <div className="stat-info">
                  <h3 id="total-downloads">{loadingStats ? "..." : stats.totalDownloads}</h3>
                  <p>Resource Downloads</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="recent-activities">
          <h2>Recent Activities</h2>
          <div className="activity-list" id="recent-activities">
            {loadingActivities ? (
              <div className="p-3">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="p-3">No recent activities.</div>
            ) : (
              activities.map((a, i) => (
                <div className="activity-item" key={a.id || i}>
                  <div className="activity-icon">
                    <i className={getActivityIcon(a.type)} />
                  </div>
                  <div className="activity-content">
                    <h5>{a.title}</h5>
                    <p>{a.description}</p>
                    <small>{a.date ? new Date(a.date).toLocaleString() : ""}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="row">
            <div className="col-md-4">
              <button className="btn btn-primary btn-block" onClick={() => (window.location.href = "/manage-resources?action=add")}>
                <i className="fas fa-plus-circle" /> Add New Resource
              </button>
            </div>
            <div className="col-md-4">
              <button className="btn btn-success btn-block" onClick={() => (window.location.href = "/manage-courses")}>
                <i className="fas fa-book-medical" /> Create Course
              </button>
            </div>
            <div className="col-md-4">
              <button className="btn btn-info btn-block" onClick={() => (window.location.href = "/manage-results")}>
                <i className="fas fa-file-import" /> Import Results
              </button>
            </div>
          </div>
        </section>
      </main>

      <div
        className="fab"
        id="fab"
        onClick={() => {
          setSidebarOpen((s) => !s);
        }}
        aria-label="Toggle menu"
      >
        <i className="fas fa-bars" />
      </div>
    </div>
  );
}
