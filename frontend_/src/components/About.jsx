import React from "react";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="about-section py-5">
      <div className="container">
        <motion.h2
          className="text-center mb-5 section-title"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          About <span>Us</span>
        </motion.h2>

        <div className="row gy-4 align-items-stretch">
          <motion.div
            className="col-md-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="about-card">
              <h3>Who We Are</h3>
              <p>
                <strong>Bright Learning Path</strong> offers top-notch tuition
                services for students from Classes 1 to 10. Our mission is to
                provide personalized learning experiences that help students
                excel academically and develop a love for learning.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="col-md-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="about-card">
              <h3>Our Vision</h3>
              <p>
                Our vision is to foster a nurturing environment that empowers
                students to achieve their full potential. We believe in creating
                a supportive and engaging learning atmosphere where every
                student can thrive.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 🎨 Scoped CSS for About Section */}
      <style jsx>{`
        .about-section {
          background: linear-gradient(135deg, #f7fbff 0%, #eaf7ff 100%);
          color: #333;
          transition: background 0.4s ease;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #007bff;
          text-transform: uppercase;
          position: relative;
          display: inline-block;
        }

        .section-title span {
          color: #ff9800;
        }

        .section-title::after {
          content: "";
          position: absolute;
          width: 80px;
          height: 4px;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: #007bff;
          border-radius: 2px;
        }

        .about-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          height: 100%;
        }

        .about-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .about-card h3 {
          font-size: 1.8rem;
          font-weight: 700;
          color: #007bff;
          margin-bottom: 15px;
        }

        .about-card p {
          font-size: 1rem;
          line-height: 1.7;
          color: #444;
        }

        /* 🌙 Dark Mode Styles */
        .dark-mode .about-section {
          background: linear-gradient(135deg, #121212 0%, #1e1e1e 100%);
          color: #e0e0e0;
        }

        .dark-mode .about-card {
          background: rgba(30, 30, 30, 0.9);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .dark-mode .about-card h3 {
          color: #00bcd4;
        }

        .dark-mode .about-card p {
          color: #b0b0b0;
        }

        .dark-mode .section-title {
          color: #00bcd4;
        }

        .dark-mode .section-title span {
          color: #ffc107;
        }
      `}</style>
    </section>
  );
}
