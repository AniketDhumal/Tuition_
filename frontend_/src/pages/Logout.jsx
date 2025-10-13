// src/pages/Logout.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new CustomEvent("authChanged", { detail: { token: null, user: null } }));
    navigate("/login", { replace: true });
  }, [navigate]);

  return <div className="p-4 text-center">Signing out…</div>;
}
