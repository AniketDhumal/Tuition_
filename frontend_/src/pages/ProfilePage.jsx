// src/pages/ProfilePage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

/**
 * Centered LinkedIn-like ProfilePage
 * - Click avatar to pick file
 * - Immediate preview + auto upload
 * - Updates localStorage user and dispatches `authChanged`
 *
 * Edit form remains for other profile fields.
 */

const API_BASE = API_BASE_URL; // adjust if needed
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("about");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: "Loading...",
    email: "",
    age: "",
    location: "",
    about: "",
    image: "",
  });

  const [form, setForm] = useState({ name: "", age: "", location: "", about: "" });

  const fileRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // message helper
  function showMessage(type, text, ms = 3500) {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), ms);
  }

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(`${API_BASE}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 404) {
          // fallback: try to create minimal profile from /user
          const userRes = await fetch(`${API_BASE}/user`, { headers: { Authorization: `Bearer ${token}` } });
          if (userRes.ok) {
            const u = await userRes.json();
            await fetch(`${API_BASE}/profile`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ name: u.name || u.email, email: u.email }),
            });
            // fetch again
            const fresh = await fetch(`${API_BASE}/profile/me`, { headers: { Authorization: `Bearer ${token}` } });
            if (!fresh.ok) throw new Error("Unable to get profile");
            const data = await fresh.json();
            if (!cancelled) applyProfile(data);
            return;
          } else throw new Error("Profile not found");
        }

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.dispatchEvent(new CustomEvent("authChanged", { detail: { token: null, user: null } }));
            navigate("/login");
            return;
          }
          throw new Error("Failed to load profile");
        }

        const data = await res.json();
        if (!cancelled) applyProfile(data);
      } catch (err) {
        console.error("Profile load error:", err);
        if (!cancelled) showMessage("error", err.message || "Failed to load profile");
      }
    }
    loadProfile();
    return () => (cancelled = true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  function applyProfile(data) {
    const p = {
      name: data.name || "Anonymous",
      email: data.email || "",
      age: data.age || "",
      location: data.location || "",
      about: data.about || "",
      image: data.imageUrl || data.image || "",
    };
    setProfile(p);
    setForm({ name: p.name || "", age: p.age || "", location: p.location || "", about: p.about || "" });

    // sync local user and notify navbar
    try {
      const stored = localStorage.getItem("user");
      const parsed = stored ? JSON.parse(stored) : {};
      const merged = { ...(parsed || {}), name: p.name, image: p.image };
      localStorage.setItem("user", JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent("authChanged", { detail: { token: localStorage.getItem("token"), user: merged } }));
    } catch {}
  }

  // Clicking avatar triggers file input
  function onAvatarClick() {
    if (fileRef.current) fileRef.current.click();
  }

  // File chosen -> immediate preview + auto-upload
  async function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    // optimistic UI: show preview as avatar
    setProfile((p) => ({ ...p, image: url }));

    // auto-upload
    await autoUpload(f);
  }

  async function autoUpload(file) {
    const token = localStorage.getItem("token");
    if (!token) {
      showMessage("error", "Please login to change avatar");
      return;
    }

    const fd = new FormData();
    fd.append("image", file);

    try {
      setUploading(true);
      const res = await fetch(`${API_BASE}/profile/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const img = data.imageUrl || data.image || data.url;
      // set real image url returned by server
      setProfile((p) => ({ ...p, image: img }));
      setPreviewUrl(null);
      showMessage("success", "Avatar updated");

      // persist in localStorage and notify
      try {
        const stored = localStorage.getItem("user");
        const parsed = stored ? JSON.parse(stored) : {};
        const merged = { ...(parsed || {}), image: img };
        localStorage.setItem("user", JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent("authChanged", { detail: { token: localStorage.getItem("token"), user: merged } }));
      } catch {}
    } catch (err) {
      console.error("Upload error:", err);
      showMessage("error", err.message || "Upload failed");
      // revert to previous server image if upload fails
      // try to reload profile image from server
      try {
        const token2 = localStorage.getItem("token");
        if (token2) {
          const r = await fetch(`${API_BASE}/profile/me`, { headers: { Authorization: `Bearer ${token2}` } });
          if (r.ok) {
            const d = await r.json();
            setProfile((p) => ({ ...p, image: d.imageUrl || d.image || p.image }));
          }
        }
      } catch {}
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function cancelPreview() {
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
    // reload image from profile (if server image exists)
    setProfile((p) => ({ ...p }));
  }

  // Save profile form
  async function onSaveProfile(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return showMessage("error", "Please login");

    const payload = { name: form.name, age: form.age, location: form.location, about: form.about };
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      applyProfile(data);
      setActiveTab("about");
      showMessage("success", "Profile updated");
    } catch (err) {
      console.error(err);
      showMessage("error", err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  }

  function imageSrc(src) {
    if (!src) return DEFAULT_AVATAR;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    return src.startsWith("/") ? `${API_BASE.replace(/\/api\/.*$/, "")}${src}` : `${API_BASE.replace(/\/api\/.*$/, "")}/${src}`;
  }

  return (
    <div className="pp-root">
      <main className="pp-main">
        <header className="pp-header">
          <h1>My Profile</h1>
        </header>

        <section className="pp-center">
          <aside className="pp-card">
            <div className="avatar-area">
              <img
                className={`pp-avatar ${uploading ? "uploading" : ""}`}
                src={imageSrc(profile.image)}
                alt="avatar"
                onClick={onAvatarClick}
                role="button"
                title="Click to change avatar"
              />
              <div className="avatar-overlay" onClick={onAvatarClick} role="button" title="Change avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 8l2.5-2.5a2.121 2.121 0 0 0-3-3L14 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>

              {uploading && (
                <div className="spinner-overlay" aria-hidden>
                  <div className="spinner" />
                </div>
              )}

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </div>

            <h2 className="pp-name">{profile.name}</h2>
            <div className="pp-email">{profile.email}</div>

            <div className="pp-meta">
              <div><strong>Age</strong><div className="meta-val">{profile.age || "—"}</div></div>
              <div><strong>Location</strong><div className="meta-val">{profile.location || "—"}</div></div>
            </div>
          </aside>

          <article className="pp-panel">
            <div className="pp-tabs">
              <button className={`tab ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}>About</button>
              <button className={`tab ${activeTab === "edit" ? "active" : ""}`} onClick={() => setActiveTab("edit")}>Edit</button>
            </div>

            {message.text && <div className={`pp-flash ${message.type}`}>{message.text}</div>}

            <div className={`pp-content ${activeTab === "about" ? "open" : ""}`}>
              <h3>About Me</h3>
              <p className="about-text">{profile.about || "No information provided."}</p>
            </div>

            <div className={`pp-content ${activeTab === "edit" ? "open" : ""}`}>
              <form onSubmit={onSaveProfile} className="pp-form">
                <label>Full name
                  <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
                </label>

                <label>Age
                  <input type="number" min="1" value={form.age} onChange={(e) => setForm((s) => ({ ...s, age: e.target.value }))} />
                </label>

                <label>Location
                  <input value={form.location} onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))} />
                </label>

                <label>About
                  <textarea value={form.about} onChange={(e) => setForm((s) => ({ ...s, about: e.target.value }))} rows="6"></textarea>
                </label>

                <div className="pp-actions">
                  <button type="submit" className="btn primary" disabled={loading}>{loading ? "Saving..." : "Save changes"}</button>
                  <button type="button" className="btn ghost" onClick={() => { setForm({ name: profile.name, age: profile.age, location: profile.location, about: profile.about }); showMessage("success", "Reverted"); }}>Revert</button>
                </div>
              </form>
            </div>
          </article>
        </section>
      </main>

      <style>{`
        :root{
          --bg: #f5f8fb;
          --card: #ffffff;
          --muted: #6b7280;
          --accent: #6d28d9;
          --glass: rgba(15,23,42,0.04);
          --shadow: 0 12px 36px rgba(2,6,23,0.08);
          --radius: 14px;
        }
        body.app-dark, body.dark-mode {
          --bg: #07141a;
          --card: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          --muted: #9bb0c6;
          --accent: #06b6d4;
          --glass: rgba(255,255,255,0.02);
          --shadow: 0 14px 40px rgba(1,7,13,0.6);
        }

        .pp-root { background: var(--bg); min-height: 100vh; color: #0b1220; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding-bottom: 48px; }
        body.app-dark .pp-root { color: #e6eef6; }

        .pp-main { max-width: 1100px; margin: 36px auto; padding: 18px; }
        .pp-header h1 { margin: 0 0 10px; font-size: 1.6rem; color: #0b1220; }
        body.app-dark .pp-header h1 { color: #e8f6ff; }

        .pp-center { display:flex; gap:28px; align-items:flex-start; justify-content:center; }
        @media (max-width: 920px) { .pp-center { flex-direction:column; padding: 0 12px; } }

        .pp-card {
          width: 320px;
          background: var(--card);
          border-radius: var(--radius);
          padding: 22px;
          box-shadow: var(--shadow);
          text-align:center;
        }

        .avatar-area { position: relative; display:inline-block; }
        .pp-avatar {
          width:150px; height:150px; object-fit:cover; border-radius:999px;
          border:6px solid rgba(255,255,255,0.9);
          box-shadow: 0 10px 30px rgba(2,6,23,0.08);
          cursor:pointer;
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .pp-avatar:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(2,6,23,0.12); }

        .avatar-overlay {
          position:absolute; right: -4px; bottom: -4px;
          width:46px; height:46px; border-radius:999px;
          background: linear-gradient(180deg,var(--accent), #4c1d95);
          display:flex; align-items:center; justify-content:center; color:#fff;
          box-shadow: 0 10px 30px rgba(79,70,229,0.12); cursor:pointer;
        }
        body.app-dark .avatar-overlay { background: linear-gradient(180deg,var(--accent), #0ea5b6); box-shadow: 0 10px 30px rgba(0,188,212,0.12); }

        .spinner-overlay {
          position:absolute; inset: 0; display:flex; align-items:center; justify-content:center;
          background: rgba(0,0,0,0.18); border-radius: 999px;
        }
        .spinner { width: 40px; height: 40px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.18); border-top-color: rgba(255,255,255,0.9); animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .pp-name { margin: 14px 0 4px; font-size:1.05rem; font-weight:700; color: #0b1220; }
        body.app-dark .pp-name { color: #e6f7ff; }
        .pp-email { color: var(--muted); margin-bottom:12px; }

        .pp-meta { display:flex; gap:12px; justify-content:space-between; margin-top:14px; }
        .pp-meta > div { flex:1; background: var(--glass); padding:10px; border-radius:10px; color:var(--muted); font-weight:700; }

        .pp-panel { flex:1; min-height:360px; background: var(--card); border-radius: var(--radius); padding:22px; box-shadow: var(--shadow); }
        .pp-tabs { display:flex; gap:10px; margin-bottom:12px; }
        .tab { padding:8px 14px; border-radius:10px; background:transparent; border:1px solid transparent; color:var(--muted); cursor:pointer; font-weight:700; }
        .tab.active { background: linear-gradient(90deg, rgba(109,40,217,0.10), rgba(59,130,246,0.06)); color: var(--accent); border-color: rgba(109,40,217,0.06); }

        .pp-flash { padding:10px 12px; border-radius:10px; margin-bottom:12px; font-weight:700; }
        .pp-flash.success { background: rgba(16,185,129,0.08); color:#059669; }
        .pp-flash.error { background: rgba(239,68,68,0.08); color:#dc2626; }

        .pp-content { display:none; }
        .pp-content.open { display:block; }

        .about-text { color: var(--muted); line-height:1.7; }

        .pp-form label { display:block; margin-bottom:10px; font-weight:700; color:var(--muted); }
        .pp-form input, .pp-form textarea { width:100%; padding:12px; border-radius:10px; border:1px solid rgba(2,6,23,0.06); margin-bottom:12px; background:transparent; color:inherit; }
        .pp-form textarea { min-height:120px; }

        .pp-actions { display:flex; gap:12px; margin-top:8px; }
        .btn { padding:10px 14px; border-radius:10px; font-weight:700; cursor:pointer; border:none; }
        .btn.primary { background: linear-gradient(90deg,var(--accent), #4c1d95); color:#fff; box-shadow:0 12px 36px rgba(79,70,229,0.12); }
        .btn.ghost { background:transparent; border:1px solid rgba(2,6,23,0.06); color:var(--muted); }

        .hidden { display:none; }

        @media (max-width: 920px) {
          .pp-center { flex-direction:column; }
          .pp-card, .pp-panel { width:100%; }
          .pp-avatar { width:120px; height:120px; }
          .avatar-overlay { right: calc(50% - 22px); }
        }
      `}</style>
    </div>
  );
}
