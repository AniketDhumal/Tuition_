import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../authContext.jsx";
import { API_BASE_URL } from "../config";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoggedIn) navigate("/dashboard");
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email?.trim(),
          password: form.password,
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!res.ok) {
        const friendly = (data && (data.error || data.message)) || `Login failed (${res.status})`;
        setError(friendly);
        setLoading(false);
        return;
      }

      const token = data?.token;
      const user = data?.data || data?.user || null;

      if (!token) {
        setError("Server did not return a token.");
        setLoading(false);
        return;
      }

      // Use auth context login
      login(token, user);

      // Redirect based on role (adjust to your app)
      const role = user?.role || data?.role || "";
      if (role === "teacher" || role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center py-5">
      <div className="card shadow-lg p-4" style={{ maxWidth: 480, width: "100%" }}>
        <h2 className="text-center mb-4 text-primary fw-bold">Login</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              Email
            </label>
            <input id="email" name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <input id="password" name="password" type="password" className="form-control" value={form.password} onChange={handleChange} required />
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
          <button className="btn btn-link p-0 text-primary" onClick={() => navigate("/register")}>
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
