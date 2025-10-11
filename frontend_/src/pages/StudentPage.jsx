import React from "react";

export default function StudentPage() {
  const students = [
    { id: 1, name: "Rohit Sharma", course: "Math" },
    { id: 2, name: "Sana Patel", course: "Science" },
    { id: 3, name: "Ishaan Kumar", course: "English" },
  ];

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ color: "#5b163d", textAlign: "center" }}>Students</h1>

      <div style={{ marginTop: 22, display: "grid", gap: 12 }}>
        {students.map((s) => (
          <div
            key={s.id}
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 6px 18px rgba(8,18,30,0.04)",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{s.name}</div>
              <div style={{ color: "#667", marginTop: 6 }}>{s.course}</div>
            </div>

            <div>
              <button style={smallBtn}>View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const smallBtn = {
  background: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 12px",
  cursor: "pointer",
};
