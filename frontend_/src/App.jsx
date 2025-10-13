// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./authContext";

// Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CoursesPage from "./pages/CoursesPage";
import CoursePage from  "./pages/CoursePage";
import EnrollPage from "./pages/EnrollPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/DashboardPage";
import ManageCoursesPage from "./pages/ManageCoursesPage";
import ManageResourcesPage from "./pages/ManageResourcesPage";
import ManageResult from "./pages/ResultPage";

export default function App() {
  return (
    <AuthProvider>
      <Navbar /> {/* Navbar will hide itself internally when logged in */}
      <main className="flex-grow-1" style={{ minHeight: "80vh" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/course" element={<CoursePage />} />
          <Route path="/enroll" element={<EnrollPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/manage-courses" element={<ManageCoursesPage />} />
          <Route path="/manage-resources" element={<ManageResourcesPage />} />
          <Route path="/manage-results" element={<ManageResult />} />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}
