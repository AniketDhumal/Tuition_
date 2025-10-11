// src/pages/EnrollPage.jsx
import React, { useEffect, useState } from "react";

const API_BASE_URL =
  (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ||
  "http://localhost:5000/api/v1";

export default function EnrollPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    course: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [serverErrors, setServerErrors] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(""), 6000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const validate = (data) => {
    const e = {};
    if (!data.fullName.trim()) e.fullName = "Please enter your full name.";
    if (!data.email.trim()) e.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      e.email = "Please enter a valid email address.";
    if (!data.phone.trim()) e.phone = "Please enter your phone number.";
    if (!data.course) e.course = "Please select a course.";
    if (!data.address.trim()) e.address = "Please enter your address.";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    setErrors((s) => ({ ...s, [name]: null }));
    setServerErrors(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors(null);

    const validation = validate(formData);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        if (data && data.errors) {
          setServerErrors(data.errors);
          setErrors((prev) => ({ ...prev, ...data.errors }));
        } else {
          const msg = (data && (data.error || data.message)) || text || `HTTP ${res.status}`;
          throw new Error(msg);
        }
        return;
      }

      setSuccessMessage((data && data.message) || "🎉 Enrollment successful! We'll contact you soon.");
      setFormData({ fullName: "", email: "", phone: "", course: "", address: "" });
      setErrors({});
    } catch (err) {
      console.error("Enrollment error:", err);
      setServerErrors({ _global: err.message || "Server Error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* HERO */}
      <header className="hero-enroll" role="banner" aria-label="Enroll hero">
        <div className="hero-inner">
          <h1 className="hero-title">Enroll Now</h1>
          <p className="hero-sub">Reserve your seat in our top-rated courses — learn with confidence and joy.</p>

          <div className="hero-ctas">
            <a
              className="btn cta-primary"
              href="#form"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("enroll-form")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Enroll Today
            </a>
            <a className="btn cta-ghost" href="/courses">
              Browse Courses
            </a>
          </div>
        </div>

        {/* soft decorative blobs */}
        <div className="blob blob-a" aria-hidden />
        <div className="blob blob-b" aria-hidden />
      </header>

      {/* FORM */}
      <main className="container" role="main">
        <section className="form-wrap" id="form" aria-labelledby="enroll-heading">
          <h2 id="enroll-heading" className="form-title">
            Enrollment Form
          </h2>

          <div className="card form-card" aria-hidden={submitting}>
            <div className="card-body">
              {serverErrors && serverErrors._global && (
                <div className="alert alert-danger" role="alert">
                  {serverErrors._global}
                </div>
              )}

              <form id="enroll-form" onSubmit={handleSubmit} noValidate>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="fullName" className="label">
                      Full Name
                    </label>
                    <div className={`input-with-icon ${errors.fullName ? "invalid" : ""}`}>
                      <svg className="icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                        <path
                          fill="currentColor"
                          d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v1h20v-1c0-3.3-6.7-5-10-5z"
                        />
                      </svg>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        className="form-control"
                        placeholder="Your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={submitting}
                        aria-invalid={!!errors.fullName}
                        aria-describedby={errors.fullName ? "err-fullName" : undefined}
                      />
                    </div>
                    {errors.fullName && (
                      <div id="err-fullName" className="field-error">
                        {errors.fullName}
                      </div>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="email" className="label">
                      Email
                    </label>
                    <div className={`input-with-icon ${errors.email ? "invalid" : ""}`}>
                      <svg className="icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                        <path
                          fill="currentColor"
                          d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
                        />
                      </svg>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="form-control"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={submitting}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "err-email" : undefined}
                      />
                    </div>
                    {errors.email && (
                      <div id="err-email" className="field-error">
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="phone" className="label">
                      Phone
                    </label>
                    <div className={`input-with-icon ${errors.phone ? "invalid" : ""}`}>
                      <svg className="icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                        <path
                          fill="currentColor"
                          d="M6.6 10.8c1.1 2.3 2.9 4.2 5.2 5.3l1.3-1.4c.3-.3.8-.4 1.2-.2 1.3.5 2.7.8 4.1.8.4 0 .8.3.9.7l.8 3c.1.3 0 .6-.3.8-1 .7-2.4 1.3-4.2 1.3C7.6 20 3 15.5 3 9.6 3 7.9 3.6 6.5 4.3 5.5c.2-.3.5-.4.8-.3l3 .8c.4.1.6.5.6.9 0 1.4.3 2.8.8 4.1.1.4 0 .9-.2 1.2L6.6 10.8z"
                        />
                      </svg>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="form-control"
                        placeholder="+1 234 567 890"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={submitting}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "err-phone" : undefined}
                      />
                    </div>
                    {errors.phone && (
                      <div id="err-phone" className="field-error">
                        {errors.phone}
                      </div>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="course" className="label">
                      Course
                    </label>
                    <div className={`select-wrap ${errors.course ? "invalid" : ""}`}>
                      <select
                        id="course"
                        name="course"
                        className="form-select"
                        value={formData.course}
                        onChange={handleChange}
                        disabled={submitting}
                        aria-invalid={!!errors.course}
                        aria-describedby={errors.course ? "err-course" : undefined}
                      >
                        <option value="">Select a course</option>
                        <option value="math">Mathematics</option>
                        <option value="science">Science</option>
                        <option value="english">English</option>
                      </select>
                    </div>
                    {errors.course && (
                      <div id="err-course" className="field-error">
                        {errors.course}
                      </div>
                    )}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="address" className="label">
                    Address / Notes
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows="4"
                    className={`form-control ${errors.address ? "is-invalid" : ""}`}
                    placeholder="Home address, school, or any notes..."
                    value={formData.address}
                    onChange={handleChange}
                    disabled={submitting}
                    aria-invalid={!!errors.address}
                    aria-describedby={errors.address ? "err-address" : undefined}
                  />
                  {errors.address && (
                    <div id="err-address" className="field-error">
                      {errors.address}
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-submit"
                    disabled={submitting}
                    aria-disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Enrollment"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <p className="small muted">
            By submitting you agree to our <a href="/privacy">Privacy Policy</a>.
          </p>
        </section>
      </main>

      {/* Success toast */}
      {successMessage && (
        <div className="toast success" role="status" aria-live="polite">
          <div className="toast-content">
            <strong>{successMessage}</strong>
            <button className="toast-close" aria-label="Close" onClick={() => setSuccessMessage("")}>
              ✕
            </button>
          </div>
        </div>
      )}

      <style>{`
        /* Bright mode palette */
        :root {
          --bg-1: #fff2e8; /* soft peach */
          --bg-2: #e8f4ff; /* soft sky */
          --paper: #ffffff;
          --muted: #6b7280;
          --accent: #ffb020; /* sunny accent */
          --accent-2: #ff8a00;
          --focus: rgba(255,160,50,0.16);
          --error: #d0342c;
        }

        body {
          margin: 0;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          background: linear-gradient(135deg, var(--bg-1) 20%, var(--bg-2) 100%);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          color: #0f1724;
        }

        /* HERO */
        .hero-enroll {
          position: relative;
          padding: 80px 20px 120px;
          background: linear-gradient(180deg, #ffecd5 0%, #e8f4ff 100%);
          overflow: hidden;
          border-bottom-left-radius: 18px;
          border-bottom-right-radius: 18px;
          box-shadow: 0 6px 30px rgba(10,20,40,0.06);
        }

        .hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .hero-title {
          color: #0b1720;
          font-size: clamp(28px, 4.2vw, 42px);
          margin: 0 0 8px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .hero-sub {
          color: #334155;
          margin: 0 0 18px;
          font-size: 1.05rem;
        }

        .hero-ctas {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          border-radius: 999px;
          padding: 10px 18px;
          font-weight: 700;
          cursor: pointer;
          border: 0;
        }

        .cta-primary {
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          color: #07202a;
          box-shadow: 0 12px 40px rgba(255,160,50,0.14);
          transition: transform 0.14s ease, box-shadow 0.14s ease;
        }

        .cta-primary:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 50px rgba(255,160,50,0.18);
        }

        .cta-ghost {
          background: rgba(255,255,255,0.9);
          color: #0b1720;
          border: 1px solid rgba(13, 35, 51, 0.06);
          box-shadow: 0 6px 20px rgba(10,20,40,0.04);
        }

        /* decorative blobs */
        .blob { position: absolute; border-radius: 50%; filter: blur(40px); opacity: 0.9; transform: translateZ(0); }
        .blob-a { width: 360px; height: 360px; background: linear-gradient(90deg, rgba(255,200,120,0.6), rgba(255,180,90,0.45)); top: -120px; left: -80px; }
        .blob-b { width: 480px; height: 480px; background: linear-gradient(90deg, rgba(120,200,255,0.4), rgba(180,220,255,0.28)); bottom: -180px; right: -120px; }

        /* MAIN / FORM */
        .container {
          max-width: 1100px;
          margin: -86px auto 72px;
          padding: 0 20px;
        }
        .form-wrap { display: block; text-align: center; }
        .form-title {
          font-family: Georgia, serif;
          font-weight: 700;
          color: #07202a;
          margin-bottom: 18px;
          display: inline-block;
          padding-bottom: 8px;
          border-bottom: 3px solid var(--accent);
        }

        .form-card {
          max-width: 920px;
          margin: 0 auto;
          border-radius: 14px;
          overflow: visible;
        }

        .card-body {
          padding: 28px;
          background: linear-gradient(180deg, var(--paper), rgba(255,255,255,0.95));
          box-shadow: 0 30px 70px rgba(16,24,40,0.06);
          border-radius: 12px;
        }

        .field-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .field { text-align: left; }
        .label { display: block; margin-bottom: 8px; font-weight: 700; color: #07303a; font-size: 0.95rem; }

        .input-with-icon { position: relative; display: flex; align-items: center; gap: 10px; }
        .input-with-icon .icon { position: absolute; left: 12px; color: var(--accent-2); opacity: 0.95; }
        .input-with-icon input { padding-left: 44px; }

        .select-wrap .form-select { padding-left: 14px; }

        .form-control, .form-select, textarea.form-control {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #eef2f6;
          font-size: 0.95rem;
          color: #07202a;
          transition: box-shadow .16s ease, border-color .16s ease, transform .12s ease;
          background: #fff;
        }

        .form-control::placeholder { color: #9aa7b2; }

        .form-control:focus, .form-select:focus, textarea.form-control:focus {
          outline: none;
          box-shadow: 0 10px 30px var(--focus);
          border-color: var(--accent-2);
          transform: translateY(-1px);
        }

        .field-error { margin-top: 8px; color: var(--error); font-size: 0.92rem; }

        .input-with-icon.invalid .form-control,
        .select-wrap.invalid .form-select { border-color: rgba(208,52,44,0.12); box-shadow: none; }

        .form-actions { margin-top: 18px; display: flex; gap: 12px; justify-content: center; }

        .btn-submit {
          background: linear-gradient(90deg, #ffd54a, #ff9a00);
          color: #07202a;
          padding: 12px 20px;
          border-radius: 999px;
          border: none;
          font-weight: 800;
          box-shadow: 0 18px 50px rgba(255,160,50,0.12);
          transition: transform .12s ease, box-shadow .12s ease;
        }
        .btn-submit:active { transform: translateY(1px) scale(.998); }
        .btn-submit:disabled { opacity: 0.75; cursor: not-allowed; transform: none; box-shadow: none; }

        .muted { color: var(--muted); margin-top: 12px; font-size: 0.9rem; }

        @media (max-width: 860px) {
          .field-grid { grid-template-columns: 1fr; }
          .container { margin-top: -46px; }
          .card-body { padding: 20px; }
        }

        /* toast */
        .toast.success {
          position: fixed;
          right: 18px;
          bottom: 18px;
          background: linear-gradient(90deg, #86efac, #34d399);
          color: #042018;
          padding: 12px 14px;
          border-radius: 12px;
          box-shadow: 0 12px 40px rgba(34,197,94,0.12);
          z-index: 1500;
          display: flex;
          align-items: center;
        }
        .toast .toast-content { display: flex; gap: 12px; align-items: center; }
        .toast .toast-close { margin-left: 12px; background: transparent; border: 0; font-size: 1rem; cursor: pointer; color: rgba(4,32,24,0.8); }

        /* ===== Form — dark mode improvements (paste inside your <style>) ===== */
body.dark-mode .container {
  margin: -86px auto 72px;
  transition: margin .25s ease;
}

body.dark-mode .hero-enroll {
    background: black;
      }

/* card / panel */
body.dark-mode .form-card {
  max-width: 920px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: visible;
  background: transparent;
}

body.dark-mode .card-body {
  padding: 36px;
  border-radius: 14px;
  /* soft glassy card with subtle inner glow */
  background: linear-gradient(180deg, rgba(18,22,28,0.75), rgba(14,16,20,0.62));
  box-shadow:
    0 8px 30px rgba(2,6,12,0.6),           /* outer depth */
    inset 0 1px 0 rgba(255,255,255,0.02),   /* tiny top sheen */
    inset 0 -20px 60px rgba(0,0,0,0.45);    /* inner low light */
  color: #e6eef8;
  border: 1px solid rgba(255,255,255,0.02);
  backdrop-filter: blur(6px) saturate(120%);
}

/* title and labels */
body.dark-mode .form-title {
  color: #f0f7ff;
  border-bottom-color: #fbbf24; /* warm accent underlined */
}
body.dark-mode .label {
  color: #cfe8f8;
  font-weight: 700;
  margin-bottom: 8px;
}

/* grid */
body.dark-mode .field-grid { gap: 18px; }

/* inputs / selects / textarea */
body.dark-mode .form-control,
body.dark-mode .form-select,
body.dark-mode textarea.form-control {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border: 1px solid rgba(255,255,255,0.06);
  color: #e6eef8;
  padding: 12px 14px;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(4,8,12,0.6);
  transition: box-shadow .16s ease, border-color .12s ease, transform .12s ease;
}
body.dark-mode .form-control::placeholder,
body.dark-mode textarea.form-control::placeholder {
  color: #94a6b8;
}

/* input icons */
body.dark-mode .input-with-icon .icon {
  color: rgba(250,190,55,0.95); /* warm icon color for accent */
  left: 12px;
  opacity: 0.98;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
}
body.dark-mode .input-with-icon input { padding-left: 44px; }

/* focus */
body.dark-mode .form-control:focus,
body.dark-mode .form-select:focus,
body.dark-mode textarea.form-control:focus {
  outline: none;
  border-color: rgba(250,190,55,0.95);
  box-shadow: 0 12px 40px rgba(250,190,55,0.09), 0 6px 24px rgba(0,0,0,0.6);
  transform: translateY(-1px);
}

/* invalid / error */
body.dark-mode .input-with-icon.invalid .form-control,
body.dark-mode .select-wrap.invalid .form-select {
  border-color: rgba(255,95,95,0.22);
  box-shadow: 0 6px 22px rgba(255,60,60,0.06);
}
body.dark-mode .field-error {
  color: #ffb4b4;
  margin-top: 8px;
  font-size: 0.92rem;
}

/* submit button */
body.dark-mode .btn-submit {
  background: linear-gradient(90deg, #f59e0b, #f97316);
  color: #071028;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 800;
  box-shadow: 0 18px 50px rgba(249,115,22,0.14), 0 6px 18px rgba(2,6,12,0.6);
  border: none;
  transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
}
body.dark-mode .btn-submit:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.02);
  filter: brightness(1.02);
  box-shadow: 0 26px 70px rgba(249,115,22,0.18);
}
body.dark-mode .btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* subtle separator text (muted text) */
body.dark-mode .muted { color: #9fb4bf; }

/* toast adjustments */
body.dark-mode .toast.success {
  background: linear-gradient(90deg, #16a34a, #059669);
  color: #e6fdf3;
  box-shadow: 0 18px 40px rgba(5,150,105,0.12);
}

/* responsive tweaks for mobile */
@media (max-width: 860px) {
  body.dark-mode .card-body { padding: 22px; }
  body.dark-mode .form-control, body.dark-mode .form-select { padding: 12px; }
}

      `}</style>
    </>
  );
}
