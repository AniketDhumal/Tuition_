// src/pages/ResultPage.jsx
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import "../styles/manage_result.css";

export default function ResultManage() {
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    student: "",
    course: "",
    semester: "",
    score: "",
    grade: "",
  });

  // Load initial data
  useEffect(() => {
    loadCourses();
    loadStudents();
    loadResults();
  }, []);

  // Fetch helpers
  const loadCourses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCourses(data.data?.courses || []);
    } catch (err) {
      console.error("Error loading courses", err);
    }
  };

  const loadStudents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudents(data.data?.students || []);
    } catch (err) {
      console.error("Error loading students", err);
    }
  };

  const loadResults = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResults(data.data?.results || []);
    } catch (err) {
      console.error("Error loading results", err);
    }
  };

  // Save (create / update)
  const saveResult = async (e) => {
    e.preventDefault();
    const method = editingResult ? "PUT" : "POST";
    const url = editingResult ? `${API_BASE_URL}/results/${editingResult._id}` : `${API_BASE_URL}/results`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setFormVisible(false);
      setEditingResult(null);
      await loadResults();
    } catch (err) {
      console.error("Error saving result", err);
      alert("Error saving result");
    }
  };

  const deleteResult = async (id) => {
    if (!window.confirm("Are you sure you want to delete this result?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/results/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadResults();
    } catch (err) {
      console.error("Error deleting result", err);
      alert("Error deleting result");
    }
  };

  const editResult = (r) => {
    setEditingResult(r);
    setForm({
      student: r.student?._id || "",
      course: r.course?._id || "",
      semester: r.semester || "",
      score: r.score || "",
      grade: r.grade || "",
    });
    setFormVisible(true);
  };

  const handleFilter = (list) =>
    list.filter(
      (r) =>
        (!filterCourse || r.course?._id === filterCourse) &&
        (!filterSemester || String(r.semester) === String(filterSemester))
    );

  return (
    <div className="result-page">
      <div className="page-header">
        <h2>Manage Results</h2>
        <div className="actions">
          <button className="btn btn-success" onClick={() => setImportVisible(true)}>
            <i className="fas fa-file-import" /> Import
          </button>
          <button className="btn btn-primary ml-2" onClick={() => setFormVisible(true)}>
            <i className="fas fa-plus" /> Add Result
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <select
          className="form-control"
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.code} - {c.name}
            </option>
          ))}
        </select>

        <select
          className="form-control"
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4].map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
      </div>

      {/* Form Modal */}
      {formVisible && (
        <div className="card form-card" role="dialog" aria-modal="true">
          <div className="card-header">
            <h4>{editingResult ? "Edit Result" : "Add Result"}</h4>
          </div>
          <div className="card-body">
            <form onSubmit={saveResult}>
              <div className="form-row">
                <select
                  className="form-control"
                  required
                  value={form.student}
                  onChange={(e) => setForm({ ...form, student: e.target.value })}
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>

                <select
                  className="form-control"
                  required
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._1} value={c._id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <select
                  className="form-control"
                  required
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>

                <select
                  className="form-control"
                  required
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                >
                  <option value="">Select Grade</option>
                  {["A", "B", "C", "D", "F"].map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  className="form-control"
                  placeholder="Score"
                  min="0"
                  max="100"
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: e.target.value })}
                />
              </div>

              <div className="actions" style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" type="submit">
                  Save
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    setFormVisible(false);
                    setEditingResult(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-responsive result-table">
        <table className="table table-striped" role="table" aria-label="Results table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Semester</th>
              <th>Score</th>
              <th>Grade</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {handleFilter(results).map((r) => (
              <tr key={r._id}>
                <td data-label="Student">{r.student?.name}</td>
                <td data-label="Course">
                  {r.course?.code} - {r.course?.name}
                </td>
                <td data-label="Semester">{r.semester}</td>
                <td data-label="Score">{r.score}</td>
                <td data-label="Grade">{r.grade}</td>
                <td data-label="Date">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</td>
                <td data-label="Actions">
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-warning"
                      onClick={() => editResult(r)}
                      aria-label={`Edit result for ${r.student?.name || "student"}`}
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteResult(r._id)}
                      aria-label={`Delete result for ${r.student?.name || "student"}`}
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {handleFilter(results).length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
