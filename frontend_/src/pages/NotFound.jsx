// src/pages/NotFound.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column justify-content-center align-items-center text-center py-5" style={{ minHeight: "80vh" }}>
      <motion.h1
        className="display-1 fw-bold text-danger mb-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        404
      </motion.h1>

      <motion.h4
        className="fw-semibold mb-3 text-secondary"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Oops! Page Not Found
      </motion.h4>

      <motion.p
        className="text-muted mb-4"
        style={{ maxWidth: "480px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        The page you’re looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <button className="btn btn-primary px-4 fw-semibold" onClick={() => navigate("/home")}>
          Go Back Home
        </button>
      </motion.div>
    </div>
  );
}
