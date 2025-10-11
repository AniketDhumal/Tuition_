// src/pages/CoursesPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import mathImg from "../assets/math.jpg";
import scienceImg from "../assets/science.jpg";
import englishImg from "../assets/English.jpg";
import Footer from "../components/Footer"; // optional; remove if you don't have it

export default function CoursesPage() {
  const navigate = useNavigate();

  const courses = [
    {
      id: "mathematics",
      title: "Mathematics",
      img: mathImg,
      desc:
        "Dive into the fundamentals of mathematics, covering arithmetic, algebra, and geometry with interactive lessons and practice problems.",
    },
    {
      id: "science",
      title: "Science",
      img: scienceImg,
      desc:
        "Explore the wonders of science, including physics, chemistry, and biology, through engaging experiments and lessons.",
    },
    {
      id: "english",
      title: "English",
      img: englishImg,
      desc:
        "Enhance your language skills with comprehensive English courses, including grammar, vocabulary, and literature.",
    },
  ];

  const listMotion = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.12 } },
  };

  const cardMotion = {
    hidden: { opacity: 0, y: 20, scale: 0.995 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45 } },
  };

  return (
    <>
      {/* HERO */}
      <header
        className="hero-courses text-center text-light"
        role="banner"
        aria-label="Courses hero"
      >
        <div className="container hero-inner">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="display-4"
          >
            Our Courses
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="lead"
          >
            Explore courses designed for students from 1st to 10th grade — crafted with care and proven methods.
          </motion.p>

          <div className="cta-row">
            <button
              className="btn primary-cta"
              onClick={() => navigate("/enroll")}
              aria-label="Enroll now"
            >
              Enroll Now
            </button>

            <a
              className="btn ghost-cta"
              href="#course-grid"
              aria-label="Browse courses"
            >
              Browse Courses
            </a>
          </div>
        </div>
      </header>

      {/* COURSES GRID */}
      <main className="container py-5" id="course-grid">
        <h2 className="section-title text-center">Available Courses</h2>
        <p className="section-sub text-center">
          Carefully curated lessons, practice and assessments tailored to each grade.
        </p>

        <motion.div
          className="row gap-4 mt-4"
          variants={listMotion}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {courses.map((c, idx) => (
            <motion.article
              key={c.id}
              className="col-md-4"
              variants={cardMotion}
              whileHover={{ translateY: -8, boxShadow: "0 18px 50px rgba(2,6,23,0.12)" }}
            >
              <div className="course-card card h-100 border-0">
                <div className="media-wrap">
                  <img
                    src={c.img}
                    alt={c.title}
                    className="course-img card-img-top"
                    loading="lazy"
                  />
                </div>

                <div className="card-body course-body d-flex flex-column">
                  <h3 className="course-title">{c.title}</h3>
                  <p className="course-description">{c.desc}</p>

                  <div className="mt-auto d-flex gap-2 align-items-center">
                    <button
                      className="btn btn-enroll"
                      onClick={() => navigate("/enroll")}
                      aria-label={`Enroll in ${c.title}`}
                    >
                      Enroll Now
                    </button>

                    <a
                      className="learn-more"
                      href={`/#/courses/${c.id}`}
                      onClick={(e) => {
                        // if using client routing prefer navigate, otherwise allow href
                        e.preventDefault();
                        navigate(`/courses/${c.id}`);
                      }}
                      aria-label={`Learn more about ${c.title}`}
                    >
                      Learn more →
                    </a>
                  </div>
                </div>

                <div className="ribbon">Popular</div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </main>

      {/* Optional Footer */}
      <footer className="mt-5">
        <Footer />
      </footer>

      {/* Scoped styles */}
      <style jsx>{`
        /* HERO */
        .hero-courses {
          background: linear-gradient(135deg, #0d6efd 0%, #4f7bff 100%);
          color: #fff;
          padding: 4rem 0;
          position: relative;
          overflow: hidden;
        }
        .hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .display-4 {
          font-size: 2.25rem;
          font-weight: 800;
          margin: 0;
        }
        .lead {
          color: rgba(255, 255, 255, 0.92);
          margin-top: 0.6rem;
          margin-bottom: 1.15rem;
        }
        .cta-row {
          margin-top: 1.25rem;
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn {
          cursor: pointer;
        }
        .primary-cta {
          background: linear-gradient(90deg, #ffd54a, #ffb300);
          color: #07122a;
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 999px;
          font-weight: 700;
          box-shadow: 0 8px 28px rgba(255, 181, 0, 0.18);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .primary-cta:hover {
          transform: translateY(-3px);
        }
        .ghost-cta {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: rgba(255, 255, 255, 0.95);
          padding: 0.6rem 1rem;
          border-radius: 10px;
          font-weight: 600;
        }

        /* Section headings */
        .section-title {
          font-size: 1.6rem;
          font-weight: 700;
          margin-top: 8px;
        }
        .section-sub {
          color: #6b7280;
          max-width: 780px;
          margin: 6px auto 18px;
        }

        /* Course cards */
        .course-card {
          border-radius: 14px;
          overflow: visible;
          position: relative;
        }

        .media-wrap {
          overflow: hidden;
          border-top-left-radius: 14px;
          border-top-right-radius: 14px;
        }

        .course-img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          transition: transform 0.6s ease;
          display: block;
        }

        .course-card:hover .course-img {
          transform: scale(1.06);
        }

        .course-body {
          padding: 1.1rem 1.25rem 1.25rem;
          display: flex;
          flex-direction: column;
        }

        .course-title {
          margin: 0 0 8px;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f1724;
        }

        .course-description {
          color: #374151;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .btn-enroll {
          background: linear-gradient(90deg, #6366f1, #4f46e5);
          color: #fff;
          border: none;
          padding: 8px 14px;
          border-radius: 10px;
          font-weight: 700;
          box-shadow: 0 8px 26px rgba(79, 70, 229, 0.14);
        }

        .btn-enroll:hover {
          transform: translateY(-3px);
        }

        .learn-more {
          color: #4f46e5;
          font-weight: 600;
          text-decoration: none;
          margin-left: 8px;
        }

        .ribbon {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(90deg, #ffef9a, #ffd6a5);
          color: #1f2937;
          padding: 6px 10px;
          font-weight: 700;
          border-radius: 999px;
          font-size: 0.75rem;
          transform: rotate(-6deg);
          box-shadow: 0 8px 20px rgba(2,6,23,0.06);
        }

        /* Responsive */
        @media (max-width: 992px) {
          .course-img {
            height: 200px;
          }
        }
        @media (max-width: 576px) {
          .display-4 {
            font-size: 1.6rem;
          }
          .course-img {
            height: 180px;
          }
        }

        /* Dark mode */
        body.dark-mode .hero-courses {
          background: linear-gradient(135deg, #042f2e 0%, #0b5261 100%);
        }
        body.dark-mode .section-sub {
          color: #94a3b8;
        }
        body.dark-mode .course-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.04);
        }
        body.dark-mode .course-title {
          color: #e6f8ff;
        }
        body.dark-mode .course-description {
          color: #cbd5e1;
        }
        body.dark-mode .primary-cta {
          background: linear-gradient(90deg, #00e5ff, #00bcd4);
          color: #012024;
        }
        body.dark-mode .btn-enroll {
          background: linear-gradient(90deg, #00bcd4, #00a3c4);
          box-shadow: 0 8px 26px rgba(0,188,212,0.12);
        }
      `}</style>
    </>
  );
}
