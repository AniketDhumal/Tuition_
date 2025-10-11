import React from "react";

export default function CoursePage() {
  const courses = [
    { id: 1, title: "Algebra Basics", students: 24 },
    { id: 2, title: "Fundamentals of Physics", students: 18 },
    { id: 3, title: "Grammar & Composition", students: 30 },
  ];

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ color: "#5b163d", textAlign: "center" }}>Courses</h1>

      <div style={{ marginTop: 22, display: "grid", gap: 16 }}>
        {courses.map((c) => (
          <div
            key={c.id}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 18,
              boxShadow: "0 8px 22px rgba(8,18,30,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong style={{ fontSize: 18 }}>{c.title}</strong>
              <div style={{ color: "#566", marginTop: 6 }}>Enrolled: {c.students}</div>
            </div>

            <div>
              <button style={btnStyle}>Manage</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const btnStyle = {
  background: "linear-gradient(90deg,#f59e0b,#f97316)",
  border: "none",
  color: "#06121a",
  fontWeight: 700,
  padding: "8px 14px",
  borderRadius: 10,
  cursor: "pointer",
};
