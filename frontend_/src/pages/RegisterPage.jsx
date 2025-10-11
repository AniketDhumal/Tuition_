// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "../styles/register.css"; // optional - import if you use the register CSS

export default function RegisterPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    grade: "",
  });

  const [errors, setErrors] = useState({}); // field-level errors
  const [serverError, setServerError] = useState(""); // server message
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((s) => ({ ...s, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: "" })); // clear field error on change
    setServerError("");
  };

  const validateForm = (data) => {
    const errs = {};
    if (!data.username || data.username.trim().length < 3) {
      errs.username = data.username ? "Name must be at least 3 characters" : "Name is required";
    }
    if (!data.email) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!data.password) {
      errs.password = "Password is required";
    } else if (data.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }
    if (!data.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (data.password !== data.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    if (role === "student" && !data.grade) {
      errs.grade = "Grade is required for students";
    }
    return errs;
  };

  const extractMessage = (res, payload) => {
    if (!payload) return `Request failed with status ${res.status}`;
    if (typeof payload === "string") return payload;
    if (payload.error) {
      if (Array.isArray(payload.error)) return payload.error.join(", ");
      if (typeof payload.error === "string") return payload.error;
    }
    if (payload.message) return payload.message;
    const values = Object.values(payload).filter((v) => typeof v === "string");
    if (values.length) return values.join(", ");
    return `Request failed with status ${res.status}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");
    const payload = {
      name: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      role,
      grade: form.grade,
    };

    const validationErrors = validateForm({
      username: payload.name,
      email: payload.email,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
      grade: payload.grade,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          password: payload.password,
          role: payload.role,
          ...(payload.role === "student" && { grade: payload.grade }),
        }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      if (!res.ok) {
        const friendly = extractMessage(res, data);
        // If server returns object with field errors, merge them
        if (data && typeof data === "object") {
          // attempt to set field-specific errors if present (common shapes)
          const fieldErrors = {};
          if (data.errors && typeof data.errors === "object") {
            Object.assign(fieldErrors, data.errors);
          } else {
            // fallback: check for direct field keys
            ["name", "email", "password", "grade"].forEach((k) => {
              if (data[k]) fieldErrors[k === "name" ? "username" : k] = data[k];
            });
          }
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            setLoading(false);
            return;
          }
        }

        setServerError(friendly);
        setLoading(false);
        return;
      }

      const successMessage =
        typeof data === "object" && (data.message || data.success)
          ? data.message || data.success
          : "Registration successful";

      setSuccessMsg(successMessage);
      setForm({ username: "", email: "", password: "", confirmPassword: "", grade: "" });
      setErrors({});
      // after short delay navigate to login
      setTimeout(() => {
        navigate("/login");
      }, 1300);
    } catch (err) {
      console.error("Registration error:", err);
      setServerError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container d-flex justify-content-center align-items-center py-5">
      <div className="card shadow-lg border-0 p-4 register-card" style={{ maxWidth: 520, width: "100%" }}>
        <h2 className="text-center mb-3 text-primary fw-bold">Create Your Account</h2>

        {serverError && <div className="alert alert-danger">{serverError}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="username" className="form-label fw-semibold">Full Name</label>
            <input
              id="username"
              type="text"
              className={`form-control ${errors.username ? "is-invalid" : ""}`}
              value={form.username}
              onChange={handleChange}
              required
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">Email</label>
            <input
              id="email"
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={form.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="password" className="form-label fw-semibold">Password</label>
              <input
                id="password"
                type="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                value={form.password}
                onChange={handleChange}
                required
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="confirmPassword" className="form-label fw-semibold">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="role" className="form-label fw-semibold">Role</label>
            <select
              id="role"
              className="form-select"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setErrors((prev) => ({ ...prev, grade: "" }));
              }}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {role === "student" && (
            <div className="mb-3">
              <label htmlFor="grade" className="form-label fw-semibold">Grade</label>
              <input
                id="grade"
                type="text"
                className={`form-control ${errors.grade ? "is-invalid" : ""}`}
                value={form.grade}
                onChange={handleChange}
              />
              {errors.grade && <div className="invalid-feedback">{errors.grade}</div>}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100 fw-semibold" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already have an account?{" "}
          <button className="btn btn-link p-0 text-primary" onClick={() => navigate("/login")}>
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}
