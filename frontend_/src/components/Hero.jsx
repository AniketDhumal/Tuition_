import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(".EnrollPage.jsx"); // 👈 navigates to Enroll.jsx route
  };

  return (
    <header className="hero text-center text-light">
      {/* Animated Background Elements */}
      <motion.div
        className="floating-circle circle1"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.2, scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      ></motion.div>

      <motion.div
        className="floating-circle circle2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.15, scale: [1, 1.25, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      ></motion.div>

      <div className="container">
        <motion.h1
          className="hero-title text-4xl sm:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Empower Your{" "}
          <span className="highlight text-yellow-400">Learning Journey</span>
        </motion.h1>

        <motion.p
          className="lead"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        >
          Exceptional Tuition Services for{" "}
          <strong>Classes 1–10</strong> — Learn. Grow. Excel.
        </motion.p>

        <motion.button
          className="btn btn-warning"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetStarted}
        >
          Get Started
        </motion.button>
      </div>

      <div className="overlay"></div>

      {/* 🌈 Scoped Styles */}
      <style jsx>{`
        .hero {
          background: radial-gradient(
              circle at top left,
              rgba(0, 188, 212, 0.3),
              transparent 60%
            ),
            linear-gradient(135deg, #007bff 30%, #00c6ff 100%);
          color: white;
          padding: 130px 0;
          text-align: center;
          background-size: cover;
          background-position: center;
          position: relative;
          overflow: hidden;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          animation: fadeInUp 1s ease-out;
          background: linear-gradient(to right, #fff, #ffe082, #fff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .lead {
          font-size: 1.4rem;
          margin-bottom: 35px;
          color: rgba(255, 255, 255, 0.9);
          animation: fadeInUp 1.2s ease-out;
        }

        .btn {
          background-color: #ffc107;
          color: #000;
          font-weight: 600;
          padding: 14px 34px;
          border-radius: 50px;
          text-decoration: none;
          border: none;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(255, 193, 7, 0.4);
        }

        .btn:hover {
          background-color: #ffca2c;
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(255, 193, 7, 0.5);
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.25);
        }

        .floating-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          z-index: 0;
        }

        .circle1 {
          width: 400px;
          height: 400px;
          background: #00c6ff;
          top: -80px;
          left: -100px;
        }

        .circle2 {
          width: 500px;
          height: 500px;
          background: #ffc107;
          bottom: -150px;
          right: -100px;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 🌙 Dark Mode */
        .dark-mode .hero {
          background-image: linear-gradient(135deg, #004d40 30%, #003f3f 100%);
          color: #e0e0e0;
        }

        .dark-mode .hero .btn {
          background-color: #00bcd4;
          color: #fff;
        }

        .dark-mode .hero .btn:hover {
          background-color: #0097a7;
          box-shadow: 0 10px 30px rgba(0, 188, 212, 0.5);
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          .lead {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </header>
  );
}
