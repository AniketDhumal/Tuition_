// src/pages/Logout.jsx
import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../authContext"; // adjust path if needed

export default function Logout() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    // clear auth via context so all components update
    logout();

    // Optionally clear theme or other keys:
    // localStorage.removeItem('theme');

    // redirect to login or home
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return (
    <div style={{ padding: 28, textAlign: "center" }}>
      <h2 style={{ color: "#5b163d" }}>Signing out…</h2>
      <p style={{ color: "#556" }}>You will be redirected shortly.</p>
    </div>
  );
}
