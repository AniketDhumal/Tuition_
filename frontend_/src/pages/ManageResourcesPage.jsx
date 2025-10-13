// src/pages/ResourcePage.jsx
import React, { useEffect, useState, useRef } from "react";
import "../styles/resources.css";
import { API_BASE_URL } from "../config";

export default function ResourcePage() {
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Theme: read from navbar (document attribute or localStorage). Do NOT overwrite it.
  const getCurrentTheme = () =>
    document.documentElement.getAttribute("data-theme") ||
    localStorage.getItem("theme") ||
    "light";

  const [theme, setTheme] = useState(getCurrentTheme);

  const titleRef = useRef(null);
  const descRef = useRef(null);
  const courseRef = useRef(null);
  const typeRef = useRef(null);
  const fileRef = useRef(null);
  const linkRef = useRef(null);

  const ITEMS_PER_PAGE = 10;

  // ---- Listen for theme changes coming from Navbar (or storage) ----
  useEffect(() => {
    function handleThemeChangeFromOutside(e) {
      // if event carries detail, use it; otherwise read from DOM / localStorage
      const detailTheme = e?.detail?.theme;
      const t = detailTheme || getCurrentTheme();
      setTheme(t);
    }

    // storage event covers cross-tab and writes to localStorage
    window.addEventListener("storage", handleThemeChangeFromOutside);

    // custom event allows same-tab explicit dispatch: window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }))
    window.addEventListener("themeChanged", handleThemeChangeFromOutside);

    // initial sync
    handleThemeChangeFromOutside({});

    return () => {
      window.removeEventListener("storage", handleThemeChangeFromOutside);
      window.removeEventListener("themeChanged", handleThemeChangeFromOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Load Data on Mount ----
  useEffect(() => {
    loadCourses();
    loadResources(1, ""); // load all resources
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Search debounce ----
  useEffect(() => {
    const t = setTimeout(() => loadResources(1, query), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function authHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function loadCourses() {
    try {
      const res = await fetch(`${API_BASE_URL}/courses?isActive=true`, {
        headers: { "Content-Type": "application/json", ...authHeader() },
      });
      if (res.status === 401) return handleUnauthorized();
      const data = await res.json();
      const list = data.data?.courses || data.data || [];
      setCourses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("loadCourses", err);
    }
  }

  async function loadResources(p = 1, searchValue = "") {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: p, limit: ITEMS_PER_PAGE });
      if (searchValue) q.append("search", searchValue);
      const res = await fetch(`${API_BASE_URL}/resources?${q.toString()}`, {
        headers: { "Content-Type": "application/json", ...authHeader() },
      });
      if (res.status === 401) return handleUnauthorized();
      const data = await res.json();
      const list = data.data?.resources || data.data || [];
      setResources(Array.isArray(list) ? list : []);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(p);
    } catch (err) {
      console.error("loadResources", err);
      setResources([]);
    } finally {
      setLoading(false);
    }
  }

  function handleUnauthorized() {
    localStorage.removeItem("token");
    alert("Session expired. Please login again.");
    window.location.href = "/login";
  }

  // ---- Form Logic ----
  function openAdd() {
    setEditing(null);
    setShowForm(true);
    if (titleRef.current) titleRef.current.value = "";
    if (descRef.current) descRef.current.value = "";
    if (courseRef.current) courseRef.current.value = "";
    if (typeRef.current) typeRef.current.value = "pdf";
    if (fileRef.current) fileRef.current.value = null;
    if (linkRef.current) linkRef.current.value = "";
  }

  function openEdit(r) {
    setEditing(r);
    setShowForm(true);
    setTimeout(() => {
      if (titleRef.current) titleRef.current.value = r.title || "";
      if (descRef.current) descRef.current.value = r.description || "";
      if (courseRef.current) courseRef.current.value = r.course?._id || r.course || "";
      if (typeRef.current) typeRef.current.value = r.type || "pdf";
      if (linkRef.current) linkRef.current.value = r.fileUrl || "";
      if (fileRef.current) fileRef.current.value = null;
    }, 0);
  }

  async function saveResource(e) {
    e.preventDefault();
    if (saving) return;
    const title = titleRef.current?.value?.trim();
    const description = descRef.current?.value?.trim();
    const courseId = courseRef.current?.value;
    const type = typeRef.current?.value;
    const link = linkRef.current?.value?.trim();
    const file = fileRef.current?.files?.[0];

    if (!title || !description || !courseId) return alert("Please fill all required fields.");
    if (type === "link" && !link) return alert("External link is required.");
    if (type !== "link" && !editing && !file) return alert("Please upload a file.");

    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("courseId", courseId);
      fd.append("type", type);
      if (type === "link") fd.append("fileUrl", link);
      else if (file) fd.append("resourceFile", file);

      const url = editing ? `${API_BASE_URL}/resources/${editing._id}` : `${API_BASE_URL}/resources`;
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, { method, headers: { ...authHeader() }, body: fd });
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Save failed");

      alert(`Resource ${editing ? "updated" : "created"} successfully.`);
      setShowForm(false);
      await loadResources(1);
    } catch (err) {
      console.error("saveResource", err);
      alert("Failed to save resource.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteResource(id) {
    if (!window.confirm("Delete this resource?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/resources/${id}`, {
        method: "DELETE",
        headers: { ...authHeader() },
      });
      if (!res.ok) throw new Error("Delete failed");
      alert("Resource deleted.");
      loadResources(1);
    } catch (err) {
      console.error("deleteResource", err);
    }
  }

async function downloadResource(id) {
  const token = localStorage.getItem("token"); // optional, left in case you want to re-enable auth
  const url = `${API_BASE_URL}/resources/${id}/download`;

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow"
      // if you later require auth: headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (!res.ok) {
      let errText = "";
      try { errText = await res.text(); } catch (_) {}
      console.error("Download request failed:", res.status, errText);
      alert("Download failed: " + (errText || res.status));
      return;
    }

    // If server redirected to a different (external) URL -> open it in new tab
    if (res.url && res.url !== url) {
      window.open(res.url, "_blank", "noopener,noreferrer");
      // optional: still call track endpoint (non-blocking)
      try {
        await fetch(`${API_BASE_URL}/resources/${id}/track-download`, {
          method: "POST",
          headers: { "Content-Type": "application/json" /*, ...(token ? { Authorization: `Bearer ${token}` } : {})*/ }
        });
      } catch (e) { /* ignore */ }
      return;
    }

    // Otherwise get response as blob and download
    const blob = await res.blob();

    // Try to get filename from Content-Disposition header
    const contentDisp = res.headers.get("content-disposition") || "";
    let filename = "";
    const fnMatch = contentDisp.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
    if (fnMatch && fnMatch[1]) {
      try { filename = decodeURIComponent(fnMatch[1]); }
      catch (e) { filename = fnMatch[1].replace(/["']/g, ""); }
    } else {
      // fallback: get last segment of res.url
      try {
        const u = new URL(res.url);
        const seg = u.pathname.split("/").filter(Boolean).pop();
        if (seg) filename = seg;
      } catch (e) { /* ignore */ }
    }
    if (!filename) filename = "resource";

    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 20000);

    // Optional: track download (non-blocking)
    try {
      await fetch(`${API_BASE_URL}/resources/${id}/track-download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" /*, ...(token ? { Authorization: `Bearer ${token}` } : {})*/ }
      });
    } catch (e) { /* ignore tracking errors */ }
  } catch (err) {
    console.error("downloadResource error", err);
    alert("Download failed");
  }
}

// paste into ManageResourcesPage.jsx (replace existing viewResource function)
async function viewResource(id) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/resources/${id}/view`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    // If response is not ok, try to read meaningful error message
    if (!res.ok) {
      let text;
      try {
        const json = await res.json();
        text = json.error || json.message || JSON.stringify(json);
      } catch (e) {
        text = await res.text();
      }
      throw new Error(text || `Request failed with status ${res.status}`);
    }

    const contentType = (res.headers.get("content-type") || "").toLowerCase();

    // If API returned JSON (for example: { url: "https://..." } or some metadata)
    if (contentType.includes("application/json")) {
      const json = await res.json();
      // If server gives a URL to the resource, open it
      if (json.url) {
        window.open(json.url, "_blank", "noopener,noreferrer");
        return;
      }
      // If server returned resource metadata or inline content, show it in a modal or alert
      // (You may want to replace this with your app's UI modal.)
      console.log("Resource JSON:", json);
      alert(typeof json === "object" ? JSON.stringify(json, null, 2) : String(json));
      return;
    }

    // Otherwise treat response as binary (file/blob)
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    // Try to get filename from Content-Disposition header if present
    const contentDisp = res.headers.get("content-disposition") || "";
    let filename = "";
    const fnMatch = contentDisp.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i);
    if (fnMatch && fnMatch[1]) {
      filename = decodeURIComponent(fnMatch[1].replace(/["']/g, ""));
    }

    // Decide whether to preview in new tab (for PDFs/images) or trigger download
    if (contentType.includes("pdf") || contentType.startsWith("image/")) {
      // Open a new tab to preview
      const newWindow = window.open(blobUrl, "_blank", "noopener,noreferrer");
      if (!newWindow) {
        // fallback: create a temporary anchor to download if popup blocked
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename || (`resource.${contentType.split("/").pop() || "bin"}`);
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // If filename available, set title after load (best-effort; may be restricted by browser)
        // We still keep object URL alive for a short while; revoke after 60s.
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      }
    } else {
      // Trigger download for other types (e.g., zip, docx, etc.)
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || (`resource.${contentType.split("/").pop() || "bin"}`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoke the object URL after a brief delay to ensure download started
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    }
  } catch (err) {
    console.error("Error viewing resource:", err);
    // Replace with your app's toast/modal if you have one
    alert("Could not view resource: " + (err?.message || err));
  }
}

  // ---- JSX ----
  return (
    <div className={`resource-page ${theme}`}>
      <div className="d-flex justify-content-between align-items-center mb-4" style={{ marginTop: 20 }}>
        <h2>Manage Resources</h2>
        <div>
          <input
            className="form-control d-inline-block"
            style={{ width: 250, marginRight: 12 }}
            placeholder="Search resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-add" onClick={openAdd}>
            <i className="fas fa-plus" /> Add Resource
          </button>
        </div>
      </div>

      {/* ---- Add/Edit Form ---- */}
      {showForm && (
        <div className="resource-card-form card mb-4">
          <div className="card-body">
            <form onSubmit={saveResource} className="resource-form">
              <div className="full">
                <label>Title *</label>
                <input ref={titleRef} className="form-control" required />
              </div>

              <div className="full">
                <label>Description *</label>
                <textarea ref={descRef} className="form-control" rows={3} required />
              </div>

              <div>
                <label>Course *</label>
                <select ref={courseRef} className="form-control" required>
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code ? `${c.code} - ${c.name}` : c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Type *</label>
                <select ref={typeRef} className="form-control" defaultValue="pdf">
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="link">External Link</option>
                  <option value="document">Document</option>
                  <option value="presentation">Presentation</option>
                </select>
              </div>

              <div>
                <label>File</label>
                <input ref={fileRef} type="file" className="form-control-file" />
              </div>

              <div>
                <label>External Link</label>
                <input ref={linkRef} type="url" className="form-control" placeholder="https://example.com" />
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update Resource" : "Save Resource"}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Table ---- */}
      <div className="table-responsive resource-list">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Title</th>
              <th>Course</th>
              <th>Type</th>
              <th>Downloads</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : resources.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  No resources found
                </td>
              </tr>
            ) : (
              resources.map((r) => (
                <tr key={r._id}>
                  <td>{r.title}</td>
                  <td>{r.course?.name || "N/A"}</td>
                  <td>
                    <span className="type-badge">{(r.type || "").toUpperCase()}</span>
                  </td>
                  <td>{r.downloadCount || 0}</td>
                  <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"}</td>
                  <td>
                    <div className="btn-group">
                      <button className="action-btn action-view" onClick={() => viewResource(r._id)}>
                        <i className="fas fa-eye" />
                      </button>
                      <button className="action-btn action-edit" onClick={() => openEdit(r)}>
                        <i className="fas fa-edit" />
                      </button>
                      <button className="action-btn action-del" onClick={() => deleteResource(r._id)}>
                        <i className="fas fa-trash" />
                      </button>
                      <button className="action-btn action-dl" onClick={() => downloadResource(r._id)}>
                        <i className="fas fa-download" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
