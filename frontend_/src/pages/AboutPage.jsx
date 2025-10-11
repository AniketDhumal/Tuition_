// AboutPage.jsx
import React from "react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

// Replace with your local images if you have them
const teamImages = [
  "https://via.placeholder.com/400x400?text=John+Doe",
  "https://via.placeholder.com/400x400?text=Jane+Smith",
  "https://via.placeholder.com/400x400?text=Emily+Johnson",
];

export default function AboutPage() {
  const timeline = [
    { year: "2010", text: "Bright Learning Path was founded with the goal of providing quality education and support to students." },
    { year: "2015", text: "We expanded our offerings to include online resources and interactive tools for students and parents." },
    { year: "2020", text: "Launched a new platform with enhanced features and personalized learning experiences." },
    { year: "2024", text: "Continued growth and innovation, helping thousands of students achieve academic success." },
  ];

  return (
    <div className="about-page">
      {/* HERO */}
      <header className="hero-about">
        <div className="container hero-inner">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="display-4"
          >
            About Us
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="lead"
          >
            Learn more about our mission, vision, and team.
          </motion.p>
        </div>
      </header>

      {/* MISSION / VISION */}
      <section className="container section">
        <div className="row two-cols">
          <motion.div
            className="col"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Our Mission</h2>
            <p>
              At Bright Learning Path, our mission is to provide high-quality education and support to students from 1st to 10th grade.
              We aim to foster a love for learning and help students achieve their full potential through innovative teaching methods and personalized guidance.
            </p>
          </motion.div>

          <motion.div
            className="col"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Our Vision</h2>
            <p>
              We envision a world where every student has access to the resources and support they need to succeed academically and personally.
              Our goal is to be a leading educational platform that inspires curiosity and supports lifelong learning.
            </p>
          </motion.div>
        </div>
      </section>

      {/* TEAM */}
      <section className="container section">
        <h2 className="text-center">Meet Our Team</h2>

        <div className="team-grid">
          {[
            {
              img: teamImages[0],
              name: "John Doe",
              role: "Founder & CEO",
              bio: "John has over 15 years of experience in education and is passionate about helping students reach their full potential. Under his leadership, Bright Learning Path has grown into a trusted educational platform.",
            },
            {
              img: teamImages[1],
              name: "Jane Smith",
              role: "Head of Curriculum",
              bio: "Jane is an expert in curriculum development and ensures that our educational materials are up-to-date and effective. She is dedicated to creating engaging and impactful learning experiences for students.",
            },
            {
              img: teamImages[2],
              name: "Emily Johnson",
              role: "Student Support Specialist",
              bio: "Emily provides personalized support to students and parents, helping them navigate the learning process and address any challenges. Her empathetic approach ensures that every student feels valued and supported.",
            },
          ].map((t, idx) => (
            <motion.div
              key={idx}
              className="team-member"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <img src={t.img} alt={t.name} className="team-img" />
              <h4 className="team-name">{t.name}</h4>
              <p className="team-role">{t.role}</p>
              <p className="team-bio">{t.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TIMELINE */}
      <section className="container section">
        <h2 className="text-center">Our Journey</h2>

        <div className="timeline">
          {timeline.map((item, i) => (
            <motion.div
              key={i}
              className="timeline-item"
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <h5 className="timeline-date">{item.year}</h5>
              <div className="timeline-content"><p>{item.text}</p></div>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="mt-5">
              <Footer />
            </footer>

      {/* Scoped styles (light + dark mode) */}
      <style jsx>{`
        /* page container */

        body.dark-mode .two-cols .col p {
  color: #ffffff !important;
}

        .about-page {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          background: var(--bg, #fff);
          color: var(--text, #111827);
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 18px;
        }

        /* HERO */
        .hero-about {
          background-image: linear-gradient(135deg, #ff7248 30%, #3682f4 100%);
          color: #fff;
          padding: 110px 0 70px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero-about::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.28);
          z-index: 1;
        }

        .hero-inner { position: relative; z-index: 2; }

        .display-4 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 12px;
        }

        .lead {
          font-size: 1.125rem;
          margin: 0 auto;
          max-width: 820px;
          color: rgba(255,255,255,0.95);
        }

        /* sections */
        .section { padding: 56px 0; }
        .section h2 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 18px;
          text-align: center;
          position: relative;
        }
        .section h2::after {
          content: "";
          display: block;
          width: 72px;
          height: 4px;
          background: #ff5722;
          margin: 10px auto 0;
        }

        .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
        .two-cols .col p { color: #374151; line-height: 1.7; }

        @media (max-width: 880px) {
          .two-cols { grid-template-columns: 1fr; }
          .display-4 { font-size: 1.9rem; }
          .lead { font-size: 1rem; padding: 0 10px; }
        }

        /* Team grid */
        .team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 16px; }
        .team-member {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(2,6,23,0.06);
          display: flex;
          flex-direction: column;
          text-align: center;
          padding-bottom: 18px;
        }

        .team-img { width: 100%; height: 300px; object-fit: cover; border-bottom: 1px solid #e6e6e6; }
        .team-name { font-size: 1.15rem; margin: 14px 0 6px; color: #111827; }
        .team-role { color: #6b7280; margin: 0 0 8px; font-size: 0.98rem; }
        .team-bio { color: #4b5563; padding: 0 14px; font-size: 0.95rem; line-height: 1.6; flex: 1; }

        @media (max-width: 880px) {
          .team-grid { grid-template-columns: 1fr; }
          .team-img { height: 280px; }
        }

        /* Timeline */
        .timeline { position: relative; padding: 24px 0 0; margin-top: 8px; }
        .timeline::before { content: ""; position: absolute; left: 36px; top: 0; bottom: 0; width: 3px; background: #ff5722; border-radius: 2px; }
        .timeline-item { position: relative; margin-bottom: 28px; padding-left: 100px; }
        .timeline-date { position: absolute; left: -6px; top: 0; font-weight: 700; color: #ff5722; font-size: 1rem; }
        .timeline-content {
          background: #f9fafb;
          padding: 14px 16px;
          border-radius: 8px;
          box-shadow: 0 6px 18px rgba(2,6,23,0.04);
          color: #374151;
        }

        @media (max-width: 680px) {
          .timeline::before { left: 18px; }
          .timeline-item { padding-left: 14px; margin-left: 6px; }
          .timeline-date { position: relative; left: 0; margin-bottom: 8px; display: block; }
        }

        /* Footer */
        .footer { margin-top: 24px; }

        /* Dark mode support — expects 'dark-mode' on body */
        body.dark-mode .about-page { --bg: #0f1720; --text: #e6eef2; }
        body.dark-mode .team-member { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.04); box-shadow: 0 8px 30px rgba(0,0,0,0.6); }
        body.dark-mode .team-name { color: #dff7fb; }
        body.dark-mode .team-role, body.dark-mode .team-bio { color: #cbd5e1; }
        body.dark-mode .hero-about { background-image: linear-gradient(135deg, #1c1c1c 30%, #3a3a3a 100%); color: #e0e0e0; }
        body.dark-mode .hero-about::before { background: rgba(0,0,0,0.7); }
        body.dark-mode .timeline::before { background: #bb86fc; }
        body.dark-mode .timeline-content { background: #2c2c2c; color: #e0e0e0; box-shadow: 0 6px 18px rgba(0,0,0,0.6); }
        body.dark-mode .section h2::after { background: #bb86fc; }

      `}</style>
    </div>
  );
}
