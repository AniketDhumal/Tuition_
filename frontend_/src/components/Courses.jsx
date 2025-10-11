import React from "react";
import { motion } from "framer-motion";
import lib1 from "../assets/library1.jpg";
import lib2 from "../assets/library2.png";
import lib3 from "../assets/library3 - Copy.jpg";

export default function Courses() {
  const courseData = [
    {
      img: lib1,
      title: "Classes 1–5",
      text: "Engaging and interactive lessons to build a strong foundation in Mathematics, Science, and Languages.",
    },
    {
      img: lib2,
      title: "Classes 6–8",
      text: "In-depth learning strategies and problem-solving techniques to enhance understanding and academic performance in key subjects.",
    },
    {
      img: lib3,
      title: "Classes 9–10",
      text: "Focused preparation for board exams with comprehensive coverage of advanced topics and rigorous practice sessions.",
    },
  ];

  return (
    <section id="courses" className="courses-section py-5">
      <div className="container">
        <motion.h2
          className="text-center mb-5 section-title"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Our <span>Courses</span>
        </motion.h2>

        <div className="row justify-content-center">
          {courseData.map((course, index) => (
            <motion.div
              key={index}
              className="col-md-4 mb-4"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="card h-100 shadow-lg border-0 course-card"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <img
                  src={course.img}
                  className="card-img-top"
                  alt={course.title}
                />
                <div className="card-body text-center">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text">{course.text}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ✨ Hero-only scoped styling */}
      <style jsx>{`
        .courses-section {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f7fa 100%);
          color: #333;
          overflow: hidden;
          transition: background 0.3s ease;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #007bff;
          position: relative;
          display: inline-block;
          text-transform: uppercase;
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

        .card {
          border-radius: 16px;
          overflow: hidden;
          background: white;
          transition: all 0.4s ease;
        }

        .course-card:hover {
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
          transform: translateY(-5px);
        }

        .card-img-top {
          height: 220px;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .course-card:hover .card-img-top {
          transform: scale(1.1);
        }

        .card-body {
          padding: 25px;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 10px;
        }

        .card-text {
          color: #555;
          font-size: 1rem;
          line-height: 1.6;
        }

        /* 🌙 Dark Mode Support */
        .dark-mode .courses-section {
          background: linear-gradient(135deg, #121212 0%, #1e1e1e 100%);
          color: #e0e0e0;
        }

        .dark-mode .card {
          background: #222;
          color: #e0e0e0;
        }

        .dark-mode .card-title {
          color: #00bcd4;
        }

        .dark-mode .card-text {
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
