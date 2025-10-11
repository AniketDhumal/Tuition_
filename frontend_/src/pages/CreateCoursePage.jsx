// src/pages/CreateCoursePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "../styles/dashboard.css";

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    code: "",
    description: "",
    durationWeeks: 4,
    price: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = (data) => {
    const err = {};
    if (!data.title) err.title = "Title is required";
    if (!data.code) err.code = "Course code is required";
    if (!data.description) err.description = "Description is required";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    const err = validate(form);
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", /* add Authorization if required */ },
        body: JSON.stringify({
          title: form.title,
          code: form.code,
          description: form.description,
          durationWeeks: Number(form.durationWeeks),
          price: form.price ? Number(form.price) : undefined,
        }),
      });

      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }

      if (!res.ok) {
        const message = (data && (data.error || data.message)) || `Create failed (${res.status})`;
        setErrors({ server: message });
        setLoading(false);
        return;
      }

      setSuccess("Course created successfully");
      setForm({ title: "", code: "", description: "", durationWeeks: 4, price: "" });
      setTimeout(() => navigate("/manage-courses"), 900);
    } catch (err) {
      console.error(err);
      setErrors({ server: err.message || "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm p-4" style={{ maxWidth: 880, margin: "0 auto" }}>
        <h3 className="mb-3">Create New Course</h3>

        {errors.server && <div className="alert alert-danger">{errors.server}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Course Title</label>
              <input name="title" className={`form-control ${errors.title ? "is-invalid" : ""}`} value={form.title} onChange={handleChange} />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label">Course Code</label>
              <input name="code" className={`form-control ${errors.code ? "is-invalid" : ""}`} value={form.code} onChange={handleChange} />
              {errors.code && <div className="invalid-feedback">{errors.code}</div>}
            </div>

            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea name="description" className={`form-control ${errors.description ? "is-invalid" : ""}`} rows="4" value={form.description} onChange={handleChange}></textarea>
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>

            <div className="col-md-4">
              <label className="form-label">Duration (weeks)</label>
              <input name="durationWeeks" type="number" min="1" className="form-control" value={form.durationWeeks} onChange={handleChange} />
            </div>

            <div className="col-md-4">
              <label className="form-label">Price (optional)</label>
              <input name="price" type="number" min="0" step="0.01" className="form-control" value={form.price} onChange={handleChange} />
            </div>

            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Course"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
