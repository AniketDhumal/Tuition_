// Dashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { NavLink } from "react-router-dom";
import "../styles/dashboard.css";

export default function Dashboard() {
  const progressRef = useRef(null);
  const questionRef = useRef(null);
  const progressChartRef = useRef(null);
  const questionChartRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark-mode" ? "dark" : "light";
  });

  useEffect(() => {
    const isDark = theme === "dark";
    if (isDark) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light-mode");
    }

    const sun = document.getElementById("sun-icon");
    const moon = document.getElementById("moon-icon");
    if (sun && moon) {
      if (isDark) {
        sun.classList.add("d-none");
        moon.classList.remove("d-none");
      } else {
        moon.classList.add("d-none");
        sun.classList.remove("d-none");
      }
    }
  }, [theme]);

  function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const main = document.getElementById("mainContent");
    if (sidebar) sidebar.classList.toggle("sidebar-expanded");
    if (main) main.classList.toggle("active-main");
  }

  function toggleThemeFromNavbar() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  useEffect(() => {
    if (progressChartRef.current) {
      try { progressChartRef.current.destroy(); } catch (e) {}
      progressChartRef.current = null;
    }
    if (questionChartRef.current) {
      try { questionChartRef.current.destroy(); } catch (e) {}
      questionChartRef.current = null;
    }

    const isDark = theme === "dark";
    const textColor = isDark ? "#6faa74ff" : "#6faa74ff";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    const tooltipBg = isDark ? "#111827" : "#ffffff";

    if (progressRef.current) {
      const ctx = progressRef.current.getContext("2d");
      progressChartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Math", "Science", "English"],
          datasets: [{
            label: "Progress (%)",
            data: [80, 65, 90],
            backgroundColor: ["#c62828", "#2e7d32", "#0288d1"],
            borderColor: isDark ? "#ffffff" : "#000000",
            borderWidth: 2,
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { color: textColor } },
            tooltip: {
              backgroundColor: tooltipBg,
              titleColor: textColor,
              bodyColor: textColor,
            },
          },
          scales: {
            x: { ticks: { color: textColor }, grid: { color: gridColor } },
            y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true, suggestedMax: 100 },
          },
        },
      });
    }

    if (questionRef.current) {
      const ctx2 = questionRef.current.getContext("2d");
      questionChartRef.current = new Chart(ctx2, {
        type: "pie",
        data: {
          labels: ["Correct", "Wrong", "Unattempted"],
          datasets: [{
            data: [40, 10, 5],
            backgroundColor: ["#2ecc71", "#e74c3c", "#f1c40f"],
            borderColor: isDark ? "#111827" : "#ffffff",
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { color: textColor } },
            tooltip: { backgroundColor: tooltipBg, titleColor: textColor, bodyColor: textColor },
          },
        },
      });
    }

    return () => {
      if (progressChartRef.current) progressChartRef.current.destroy();
      if (questionChartRef.current) questionChartRef.current.destroy();
    };
  }, [theme]);

  return (
    <div className="container-fluid">
      {/* Sidebar */}
      <nav className="sidebar" id="sidebar" aria-hidden="false">
        <div className="sidebar-header">
          <h3>Tuition Dashboard</h3>
        </div>
        <ul className="menu-list">
          <li>
            <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/course" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <i className="fas fa-book-open"></i> Courses
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <i className="fas fa-user"></i> Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/result" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <i className="fas fa-graduation-cap"></i> Result
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Main content */}
      <main className="main-content" id="mainContent">
        <header>
          <div className="left-section">
            <h1 className="welcome-text">Welcome, Aniket</h1>
          </div>
          
        </header>

        <section className="overview">
          <h2>Course Overview</h2>
          <div className="row">
            <div className="col-md-4"><div className="card" id="math"><h3>Math</h3><p>Progress: 80%</p></div></div>
            <div className="col-md-4"><div className="card" id="Science"><h3>Science</h3><p>Progress: 65%</p></div></div>
            <div className="col-md-4"><div className="card" id="English"><h3>English</h3><p>Progress: 90%</p></div></div>
          </div>
        </section>

        <section className="performance-chart">
          <h2>Performance Overview</h2>
          <div className="chart-container" style={{ height: 420 }}>
            <canvas id="progressChart" ref={progressRef}></canvas>
          </div>
        </section>

        <section className="question-analysis" style={{ marginTop: 24 }}>
          <h2>Question Analysis</h2>
          <div className="chart-container" style={{ height: 300 }}>
            <canvas id="questionChart" ref={questionRef}></canvas>
          </div>
        </section>

        <section className="upcoming-assignments" style={{ marginTop: 24 }}>
          <h2>Upcoming Assignments</h2>
          <ul>
            <li>Math Test - Sep 20, 2024</li>
            <li>Science Project - Sep 22, 2024</li>
            <li>English Essay - Sep 25, 2024</li>
          </ul>
        </section>
      </main>

      {/* FAB */}
      <div className="fab" id="fab" onClick={toggleSidebar} role="button" aria-label="Open menu">
        <i className="fas fa-bars"></i>
      </div>
    </div>
  );
}

