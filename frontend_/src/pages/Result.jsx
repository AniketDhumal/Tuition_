// ResultsReadOnly.jsx
import React, { useEffect, useState } from "react";
import "../styles/result.css";
import { API_BASE_URL } from "../config";

export default function ResultsReadOnly({ pageSize = 10 }) {
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ course: "", semester: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadResults(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters, query]);

  function authHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function fetchInitial() {
    try {
      const res = await fetch(`${API_BASE_URL}/courses`, { headers: authHeaders() });
      const data = await res.json();
      const list = data?.data?.courses ?? data?.data ?? [];
      setCourses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("fetchInitial error", err);
    }
  }

  async function loadResults(p = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", p);
      params.set("limit", pageSize);
      if (filters.course) params.set("course", filters.course);
      if (filters.semester) params.set("semester", filters.semester);
      if (query) params.set("search", query);

      const res = await fetch(`${API_BASE_URL}/results?${params.toString()}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      const items = data?.data?.results ?? data?.data ?? [];
      const total = data?.data?.totalPages ?? 1;
      setResults(Array.isArray(items) ? items : []);
      setTotalPages(total || 1);
      setPage(p);
    } catch (err) {
      console.error("loadResults error", err);
      showAlert("Unable to load results", "danger");
    } finally {
      setLoading(false);
    }
  }

  function showAlert(message, type = "info", timeout = 4000) {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), timeout);
  }

  function calculateGrade(score) {
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 55) return "C";
    if (score >= 40) return "D";
    return "F";
  }

  function badgeFromGrade(g) {
    const map = { A: "success", B: "primary", C: "info", D: "warning", F: "danger" };
    return map[g] || "secondary";
  }

  function exportCSV() {
    if (!results.length) return showAlert("No results to export", "warning");
    const header = ["Student", "Course", "Semester", "Score", "Grade", "Date"];
    const rows = results.map((r) => [
      r.student?.name ?? r.student ?? "",
      r.course?.code ? `${r.course.code} - ${r.course.name ?? ""}` : r.course?.name ?? "",
      r.semester ?? "",
      r.score ?? "",
      r.grade ?? calculateGrade(r.score),
      r.date ? new Date(r.date).toLocaleDateString() : "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results_page_${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="results-readonly" style={{ padding: 20 }}>
      {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="form-control"
            placeholder="Search student or course..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            style={{ minWidth: 220 }}
            aria-label="Search"
          />

          <select
            className="form-control"
            value={filters.course}
            onChange={(e) => { setFilters((f) => ({ ...f, course: e.target.value })); setPage(1); }}
            aria-label="Filter by course"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id ?? c.id ?? c.code} value={c._id ?? c.id}>
                {(c.code ? `${c.code} - ` : "") + (c.name ?? c.title ?? "")}
              </option>
            ))}
          </select>

          <select
            className="form-control"
            value={filters.semester}
            onChange={(e) => { setFilters((f) => ({ ...f, semester: e.target.value })); setPage(1); }}
            aria-label="Filter by semester"
          >
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>{`Semester ${s}`}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline-secondary" onClick={() => { setQuery(""); setFilters({ course: "", semester: "" }); setPage(1); }}>
            Reset
          </button>
          <button className="btn" onClick={exportCSV} aria-label="Export shown results to CSV">
            <i className="fas fa-file-export" /> Export CSV
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-bordered" aria-live="polite">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Semester</th>
              <th>Score</th>
              <th>Grade</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: "center" }}>Loading...</td></tr>
            ) : results.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: "center" }}>No results found</td></tr>
            ) : (
              results.map((r) => (
                <tr key={r._id ?? `${r.student ?? ""}-${r.course ?? ""}-${r.date ?? ""}`}>
                  <td>{r.student?.name ?? r.student ?? "N/A"}</td>
                  <td>{r.course?.code ? `${r.course.code} - ${r.course.name ?? ""}` : (r.course?.name ?? "N/A")}</td>
                  <td>{r.semester ?? "N/A"}</td>
                  <td>{r.score ?? "N/A"}</td>
                  <td>
                    <span className={`badge badge-${badgeFromGrade(r.grade ?? calculateGrade(r.score))}`}>
                      {r.grade ?? calculateGrade(r.score)}
                    </span>
                  </td>
                  <td>{r.date ? new Date(r.date).toLocaleDateString() : "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <nav aria-label="Results pagination" style={{ marginTop: 12 }}>
        <ul className="pagination" style={{ display: "flex", gap: 8, listStyle: "none", padding: 0 }}>
          <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => page > 1 && setPage(page - 1)} aria-label="Previous page">Previous</button>
          </li>

          {Array.from({ length: totalPages }).map((_, i) => {
            const idx = i + 1;
            // only show reasonable page buttons; keep simple if many pages
            if (totalPages > 8) {
              // show first, last, current +-1 and ellipses
              if (idx === 1 || idx === totalPages || Math.abs(idx - page) <= 1) {
                return (
                  <li key={idx} className={`page-item ${page === idx ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setPage(idx)}>{idx}</button>
                  </li>
                );
              }
              if (idx === 2 && page > 4) {
                return <li key="dots-left" className="page-item"><span className="page-link">...</span></li>;
              }
              if (idx === totalPages - 1 && page < totalPages - 3) {
                return <li key="dots-right" className="page-item"><span className="page-link">...</span></li>;
              }
              return null;
            }
            return (
              <li key={idx} className={`page-item ${page === idx ? "active" : ""}`}>
                <button className="page-link" onClick={() => setPage(idx)}>{idx}</button>
              </li>
            );
          })}

          <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => page < totalPages && setPage(page + 1)} aria-label="Next page">Next</button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
