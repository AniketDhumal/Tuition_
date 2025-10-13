import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/manage_course.css";
import { API_BASE_URL } from "../config";

const getCurrentTheme = () =>
  document.documentElement.getAttribute("data-theme") ||
  localStorage.getItem("theme") ||
  "light";

export default function ManageCourses() {
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  // Data & UI state
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [theme, setTheme] = useState(getCurrentTheme());

  // form state for add/edit
  const [formVisible, setFormVisible] = useState(false);
  const [formTitle, setFormTitle] = useState("Add New Course");
  const [form, setForm] = useState({
    _id: "",
    code: "",
    name: "",
    description: "",
    credits: 3,
    duration: 4,
  });

  useEffect(() => {
    mountedRef.current = true;
    const token = localStorage.getItem("token");
    if (!token) {
      setAlert({ type: "danger", msg: "Not authenticated — redirecting to login..." });
      setTimeout(() => navigate("/login"), 900);
      return;
    }
    loadCourses(1);

    const onThemeChange = (e) => setTheme((e?.detail?.theme) || getCurrentTheme());
    window.addEventListener("themeChanged", onThemeChange);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("themeChanged", onThemeChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // reload when page changes
    loadCourses(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ---- API helpers ----
  async function loadCourses(requestPage = 1) {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setAlert(null);

    try {
      const params = new URLSearchParams();
      params.set("page", requestPage);
      params.set("limit", limit);
      if (query && query.trim()) params.set("search", query.trim());

      // Add timestamp to bypass stale proxies if needed; cache: 'no-store' prevents browser cache
      const url = `${API_BASE_URL}/courses?${params.toString()}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (res.status === 401 || res.status === 403) {
        setAlert({ type: "danger", msg: "Unauthorized — please login again." });
        setTimeout(() => navigate("/login"), 900);
        return;
      }

      if (res.status === 304) {
        // unlikely with cache: 'no-store', but handle gracefully
        // fallback: force-refetch with unique query
        const r2 = await fetch(`${url}&_=${Date.now()}`, {
          headers: { Authorization: "Bearer " + token, Accept: "application/json" },
          cache: "no-store",
        });
        if (!r2.ok) throw new Error(`Failed to load courses: ${r2.status}`);
        const json2 = await r2.json();
        applyCoursesResponse(json2);
        return;
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed to load courses: ${res.status} ${txt}`);
      }

      const json = await res.json();
      applyCoursesResponse(json);
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", msg: err.message || "Failed to load courses." });
      setCourses([]);
      setTotalPages(1);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  function applyCoursesResponse(json) {
    // accommodate common shapes: { data: { courses: [...] , totalPages } } or { courses: [...], totalPages } or raw array
    let list = [];
    if (json?.data?.courses) list = json.data.courses;
    else if (json?.courses) list = json.courses;
    else if (Array.isArray(json)) list = json;
    else if (json?.data && Array.isArray(json.data)) list = json.data;
    else list = [];

    setCourses(list);
    if (json?.totalPages) setTotalPages(Number(json.totalPages));
    else if (json?.total_pages) setTotalPages(Number(json.total_pages));
    else if (json?.meta?.totalPages) setTotalPages(Number(json.meta.totalPages));
    else setTotalPages(1);
  }

  // ---- form helpers ----
  function showAddForm() {
    setForm({
      _id: "",
      code: "",
      name: "",
      description: "",
      credits: 3,
      duration: 4,
    });
    setFormTitle("Add New Course");
    setFormVisible(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loadCourseForEdit(courseId) {
    const token = localStorage.getItem("token");
    if (!token) return setAlert({ type: "danger", msg: "Not authenticated" });

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}`, {
        headers: { Authorization: "Bearer " + token, Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to load course: ${res.status}`);
      }
      const json = await res.json();

      // handle server shape { status: 'success', data: { course } }
      const course = json?.data?.course || json?.course || json;
      setForm({
        _id: course._id || course.id || "",
        code: course.code || "",
        name: course.name || "",
        description: course.description || "",
        credits: course.credits || 3,
        duration: course.duration || 4,
      });
      setFormTitle("Edit Course");
      setFormVisible(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", msg: err.message || "Failed to load course" });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  async function saveCourse(e) {
    e && e.preventDefault && e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return setAlert({ type: "danger", msg: "Not authenticated" });

    if (!form.code.trim() || !form.name.trim()) {
      setAlert({ type: "danger", msg: "Course code and name are required" });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const payload = {
        code: form.code,
        name: form.name,
        description: form.description,
        credits: Number(form.credits),
        duration: Number(form.duration),
      };

      let res;
      if (form._id) {
        // update
        res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(form._id)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
          cache: "no-store",
        });

        if (res.status === 304) {
          // fallback re-fetch updated resource
          const r2 = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(form._id)}?_=${Date.now()}`, {
            headers: { Authorization: "Bearer " + token, Accept: "application/json" },
            cache: "no-store",
          });
          if (!r2.ok) throw new Error(`Update returned 304 and refetch failed: ${r2.status}`);
          // continue to success
        }
      } else {
        // create
        res = await fetch(`${API_BASE_URL}/courses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
          cache: "no-store",
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Save failed: ${res.status}`);
      }

      const json = await res.json().catch(() => ({}));
      // Use server response message if provided
      if (json?.status === "success") {
        setAlert({ type: "success", msg: form._id ? "Course updated." : "Course created." });
      } else {
        setAlert({ type: "success", msg: json?.message || "Saved successfully." });
      }

      setFormVisible(false);
      // refresh list (go to first page to reflect new created item)
      loadCourses(1);
      setPage(1);
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", msg: err.message || "Save failed" });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  async function deleteCourse(courseId) {
    if (!window.confirm("Delete this course? This action cannot be undone.")) return;
    const token = localStorage.getItem("token");
    if (!token) return setAlert({ type: "danger", msg: "Not authenticated" });

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token, Accept: "application/json" },
        cache: "no-store",
      });

      // server returns 204 No Content on success in your controller
      if (res.status === 204) {
        setAlert({ type: "success", msg: "Course deleted." });
        // reload page 1 to avoid empty page issues
        loadCourses(1);
        setPage(1);
        return;
      }

      // if server sends JSON success (200)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Delete failed: ${res.status}`);
      }

      const json = await res.json().catch(() => ({}));
      if (json?.status === "success") {
        setAlert({ type: "success", msg: "Course deleted." });
      } else {
        setAlert({ type: "success", msg: json?.message || "Deleted" });
      }

      loadCourses(1);
      setPage(1);
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", msg: err.message || "Delete failed" });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  // UI helpers
  function onChangeFormField(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function onSearchSubmit(e) {
    e && e.preventDefault && e.preventDefault();
    setPage(1);
    loadCourses(1);
  }

  function changePage(p) {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  }

  function renderAlert() {
    if (!alert) return null;
    return (
      <div className={`mc-alert mc-alert-${alert.type}`}>
        <div className="mc-alert-msg">{alert.msg}</div>
        <button className="mc-alert-close" onClick={() => setAlert(null)}>
          &times;
        </button>
      </div>
    );
  }

  return (
    <div className="mc-page container-narrow">
      <header className="mc-header" style={{ marginBottom: 18 }}>
        <div className="mc-title">
          <h1>Manage Courses</h1>
        </div>

        <div className="mc-actions">

          <button className="btn-add" onClick={showAddForm}>
            <i className="fa fa-plus" /> Add Course
          </button>
        </div>
      </header>

      {renderAlert()}

      {formVisible && (
        <section className="mc-form-card card" style={{ marginBottom: 18 }}>
          <div className="card-header">
            <h4 style={{ margin: 0 }}>{formTitle}</h4>
            <div style={{ marginLeft: "auto" }}>
              <button className="btn btn-secondary" onClick={() => setFormVisible(false)}>Close</button>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={saveCourse}>
              <div className="mc-form-grid">
                <div className="form-group">
                  <label>Course Code</label>
                  <input name="code" value={form.code} onChange={onChangeFormField} className="form-control" required />
                </div>

                <div className="form-group">
                  <label>Course Name</label>
                  <input name="name" value={form.name} onChange={onChangeFormField} className="form-control" required />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={onChangeFormField} className="form-control" rows="3" />
                </div>

                <div className="form-group">
                  <label>Credits</label>
                  <input type="number" name="credits" min="1" max="10" value={form.credits} onChange={onChangeFormField} className="form-control" required />
                </div>

                <div className="form-group">
                  <label>Duration (weeks)</label>
                  <input type="number" name="duration" min="1" max="52" value={form.duration} onChange={onChangeFormField} className="form-control" required />
                </div>
              </div>

              <div className="mc-form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Saving..." : (form._id ? "Update Course" : "Save Course")}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setFormVisible(false)} style={{ marginLeft: 8 }}>Cancel</button>
              </div>
            </form>
          </div>
        </section>
      )}

      <section className="mc-table card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Credits</th>
                  <th>Duration</th>
                  <th>Resources</th>
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <i className="fa fa-spinner fa-spin" /> Loading...
                    </td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">No courses found</td>
                  </tr>
                ) : (
                  courses.map((c) => {
                    const id = c._id || c.id || c.code;
                    return (
                      <tr key={id}>
                        <td data-label="Code">{c.code}</td>
                        <td data-label="Name">{c.name}</td>
                        <td data-label="Credits">{c.credits ?? "-"}</td>
                        <td data-label="Duration">{c.duration ? `${c.duration} weeks` : "-"}</td>
                        <td data-label="Resources" className="small-muted">{c.resourceCount ?? 0}</td>
                        <td className="actions-cell" data-label="Actions">
                          <button className="action-btn view" title="View" onClick={() => navigate(`/courses/${id}`)}>
                            <i className="fa fa-eye" />
                          </button>
                          <button className="action-btn edit" title="Edit" onClick={() => loadCourseForEdit(id)}>
                            <i className="fa fa-edit" />
                          </button>
                          <button className="action-btn delete" title="Delete" onClick={() => deleteCourse(id)}>
                            <i className="fa fa-trash" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <nav aria-label="Course pagination" className="mc-pagination-wrap">
            <ul className="pagination">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => changePage(page - 1)} disabled={page === 1}>Previous</button>
              </li>

              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                  <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                    <button className="page-link" onClick={() => changePage(p)}>{p}</button>
                  </li>
                );
              })}

              <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => changePage(page + 1)} disabled={page === totalPages}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </section>
    </div>
  );
}
