// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import "../styles/dashboard.css"; // adjust path if needed
import { AuthContext } from "../authContext"; // <-- import the context

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout } = useContext(AuthContext); // <-- use logout from context

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark-mode");

  const progressRef = useRef(null);
  const questionRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDark);
    localStorage.setItem("theme", isDark ? "dark-mode" : "light-mode");
  }, [isDark]);

  // sample data
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

  // chart data & options
  const progressData = {
    labels: courses.map((c) => c.title),
    datasets: [
      {
        label: "Progress (%)",
        data: courses.map((c) => c.progress),
        backgroundColor: courses.map((c) => c.color),
        borderColor: "#fff",
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
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const labelColor = isDark ? "#fff" : "#000";
  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: labelColor, font: { weight: "bold" } },
      },
      tooltip: { backgroundColor: "#333", titleColor: "#fff", bodyColor: "#fff" },
    },
    scales: {
      y: { ticks: { color: labelColor }, grid: { display: false } },
      x: { ticks: { color: labelColor }, grid: { display: false } },
    },
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { to: "/courses", label: "Courses", icon: "fas fa-book-open" },
    { to: "/profile", label: "Profile", icon: "fas fa-user" },
    { to: "/students", label: "Result", icon: "fas fa-graduation-cap" },
  ];

  // logout function — use AuthContext.logout so provider updates
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <div className="container-fluid dashboard-root">
        {/* Sidebar */}
        <nav id="sidebar" className={`sidebar ${sidebarOpen ? "sidebar-expanded" : ""}`}>
          <div className="sidebar-header">
            <h3>Tuition Dashboard</h3>
          </div>

          <ul className="menu-list">
            {navItems.map((item) => (
              <li key={item.to} className={location.pathname === item.to ? "active" : ""}>
                <Link to={item.to}>
                  <i className={item.icon} /> <span>{item.label}</span>
                </Link>
              </li>
            ))}

            {/* Logout */}
            <li onClick={handleLogout} style={{ cursor: "pointer" }}>
              <i className="fas fa-sign-out-alt" /> <span>Logout</span>
            </li>
          </ul>
        </nav>

        {/* Main */}
        <main className="main-content" id="mainContent">
          <header>
            <div className="welcome">
              <h1>Welcome, Aniket</h1>
            </div>
            <div
              id="theme-toggle"
              onClick={() => setIsDark((s) => !s)}
              role="button"
              title="Toggle theme"
              style={{ cursor: "pointer" }}
            >
              <i id="sun-icon" className={`fas fa-sun ${isDark ? "d-none" : ""}`} />
              <i id="moon-icon" className={`fas fa-moon ${isDark ? "" : "d-none"}`} />
            </div>
          </header>

          <section className="overview">
            <h2>Course Overview</h2>
            <div className="row">
              {courses.map((c) => (
                <div key={c.id} className="col-md-4">
                  <div className="card">
                    <h3>{c.title}</h3>
                    <p>Progress: {c.progress}%</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="upcoming-assignments">
            <h2>Upcoming Assignments</h2>
            <ul>
              {assignments.map((a) => (
                <li key={a.id}>{a.text}</li>
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

        {/* Floating fa-bars button */}
        <div
          id="fab"
          className="fab"
          role="button"
          aria-label="Toggle sidebar"
          onClick={() => setSidebarOpen((s) => !s)}
        >
          <i className="fas fa-bars" />
        </div>
      </div>
    </>
  );
}
