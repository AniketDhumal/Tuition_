import React from "react";
import { Link } from "react-router-dom";

export default function AdminPage() {
  return (
    <div className="container-fluid">
      {/* Sidebar */}
      <nav className="sidebar bg-dark text-white p-3" style={{ minHeight: "100vh" }}>
        <h3 className="mb-4">Admin Dashboard</h3>
        <ul className="list-unstyled">
          <li className="mb-2">
            <Link to="/admin" className="text-white text-decoration-none">
              <i className="fas fa-tachometer-alt me-2"></i> Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/manage-resources" className="text-white text-decoration-none">
              <i className="fas fa-file-alt me-2"></i> Manage Resources
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/manage-courses" className="text-white text-decoration-none">
              <i className="fas fa-book-open me-2"></i> Manage Courses
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/dashboard" className="text-white text-decoration-none">
              <i className="fas fa-user-graduate me-2"></i> Student Dashboard
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="p-4" style={{ marginLeft: "220px" }}>
        <h1>Admin Overview</h1>
        <p>Welcome to the admin panel. Use the sidebar to manage resources, courses, and users.</p>
      </main>
    </div>
  );
}
