// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// If you don't have a config file, the code will fall back to the inline URL below.
import { API_BASE_URL } from "../config";

export default function LoginPage() {
  const navigate = useNavigate();

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If a token already exists, send the user to /dashboard immediately
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const base = typeof API_BASE_URL !== "undefined" ? API_BASE_URL : "http://localhost:5000/api/v1";
      const res = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || `Login failed (${res.status})`;
        setError(msg);
        setLoading(false);
        return;
      }

      const token = data?.token || data?.data?.token || null;
      const user = data?.data || data?.user || null;

      if (!token) {
        localStorage.removeItem("token");
        setError("Authentication token not returned by server.");
        setLoading(false);
        return;
      }

      // persist to localStorage
      localStorage.setItem("token", token);
      if (user) {
        try {
          localStorage.setItem("user", JSON.stringify(user));
        } catch {
          // ignore storage issues
        }
      }

      // dispatch same-tab event with payload so Navbar updates immediately
      window.dispatchEvent(new CustomEvent("authChanged", { detail: { token, user } }));

      // role-based redirect
      const role = (user?.role || data?.role || "").toString().toLowerCase();
      if (role === "teacher" || role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h2 className="text-center mb-4">Login to Your Account</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-semibold">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 fw-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p className="text-center mt-3 mb-0">
              Don't have an account?{" "}
              <button className="btn btn-link p-0" onClick={() => navigate("/register")}>
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>

      <footer className="text-center mt-4">
        <small>© {new Date().getFullYear()} Bright Learning Path</small>
      </footer>
    </div>
  );
}
