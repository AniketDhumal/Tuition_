import React from "react";

export default function ResultPage() {
  // placeholder sample results
  const results = [
    { id: 1, student: "Rohit Sharma", course: "Math", score: "82%" },
    { id: 2, student: "Sana Patel", course: "Science", score: "74%" },
    { id: 3, student: "Ishaan Kumar", course: "English", score: "91%" },
  ];

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ color: "#5b163d", textAlign: "center" }}>Results</h1>

      <div style={{ marginTop: 22, display: "grid", gap: 12 }}>
        {results.map((r) => (
          <div
            key={r.id}
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
              <strong>{r.student}</strong>
              <div style={{ color: "#667" }}>{r.course}</div>
            </div>

            <div style={{ fontWeight: 800 }}>{r.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
