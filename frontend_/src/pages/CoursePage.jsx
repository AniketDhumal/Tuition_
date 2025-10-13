import React from "react";
import { motion } from "framer-motion";
import mathImg from "../assets/math.jpg";
import scienceImg from "../assets/science.jpg";
import englishImg from "../assets/English.jpg";

export default function CoursesPage() {
  const courses = [
    {
      id: "mathematics",
      title: "Mathematics",
      img: mathImg,
      desc:
        "Strengthen your fundamentals in Arithmetic, Algebra, Geometry, and Trigonometry through structured lessons, examples, and tests.",
    },
    {
      id: "science",
      title: "Science",
      img: scienceImg,
      desc:
        "Discover core concepts in Physics, Chemistry, and Biology with simple explanations, practical experiments, and interactive learning modules.",
    },
    {
      id: "english",
      title: "English",
      img: englishImg,
      desc:
        "Improve your grammar, writing, comprehension, and vocabulary with well-organized lessons and daily language activities.",
    },
  ];

  const listMotion = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const cardMotion = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="container-fluid py-4 courses-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Courses Offered</h2>
          <p className="text-muted mb-0">
            Explore the key subjects taught at Bright Learning Path.
          </p>
        </div>
      </div>

      <motion.div
        className="row g-4"
        variants={listMotion}
        initial="hidden"
        animate="show"
      >
        {courses.map((c) => (
          <motion.div key={c.id} className="col-md-6 col-lg-4" variants={cardMotion}>
            <div className="card course-card h-100 shadow-sm border-0">
              <div className="course-image-wrap">
                <img
                  src={c.img}
                  alt={c.title}
                  className="img-fluid rounded-top"
                  loading="lazy"
                />
              </div>
              <div className="card-body d-flex flex-column">
                <h5 className="fw-bold mb-2">{c.title}</h5>
                <p className="text-secondary flex-grow-1">{c.desc}</p>
                <button className="btn btn-outline-primary mt-auto">
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <style jsx>{`
        .courses-dashboard {
          background: var(--dashboard-bg, transparent);
        }

        .course-card {
          border-radius: 12px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          background-color: var(--card-bg, #fff);
        }

        .course-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.1);
        }

        .course-image-wrap img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        /* Dark mode styling */
        body.dark-mode .course-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.1);
        }

        body.dark-mode h5,
        body.dark-mode h2 {
          color: #e2e8f0;
        }

        body.dark-mode p {
          color: #cbd5e1;
        }

        body.dark-mode .btn-outline-primary {
          color: #00bcd4;
          border-color: #00bcd4;
        }

        body.dark-mode .btn-outline-primary:hover {
          background: #00bcd4;
          color: #fff;
        }

        @media (max-width: 768px) {
          .course-image-wrap img {
            height: 160px;
          }
        }
      `}</style>
    </div>
  );
}
