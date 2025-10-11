import React from "react";
import { motion } from "framer-motion";
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";
import img4 from "../assets/img4.jpg";
import img5 from "../assets/img5.jpg";

export default function CarouselComp() {
  const slides = [
    {
      src: img1,
      title: "John Doe",
      text: "John improved his grades dramatically in Mathematics with our personalized tutoring sessions.",
    },
    {
      src: img2,
      title: "Jane Smith",
      text: "Jane's performance in Science and English excelled thanks to our interactive learning methods.",
    },
    {
      src: img3,
      title: "Michael Brown",
      text: "Michael gained confidence in his studies and achieved top marks in his recent exams.",
    },
    {
      src: img4,
      title: "Emily Davis",
      text: "Emily's understanding of complex topics improved significantly with our tailored support.",
    },
    {
      src: img5,
      title: "Daniel Wilson",
      text: "Daniel excelled in his board exams with our rigorous practice and focused tutoring sessions.",
    },
  ];

  return (
    <section className="carousel-section py-5">
      <motion.h2
        className="text-center mb-5 section-title"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        What Our Students <span>Say</span>
      </motion.h2>

      <div
        id="carouselExampleCaptions"
        className="carousel slide"
        data-bs-ride="carousel"
        data-bs-interval="3000"
      >
        <div className="carousel-indicators">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              data-bs-target="#carouselExampleCaptions"
              data-bs-slide-to={i}
              className={i === 0 ? "active" : ""}
              aria-current={i === 0}
              aria-label={`Slide ${i + 1}`}
            ></button>
          ))}
        </div>

        <div className="carousel-inner rounded-3 shadow-lg">
          {slides.map((s, idx) => (
            <div
              key={idx}
              className={`carousel-item ${idx === 0 ? "active" : ""}`}
            >
              <div className="image-container">
                <img
                  src={s.src}
                  className="d-block w-100"
                  alt={s.title}
                />
                <div className="overlay"></div>
              </div>
              <div className="carousel-caption d-md-block">
                <motion.h5
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {s.title}
                </motion.h5>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {s.text}
                </motion.p>
              </div>
            </div>
          ))}
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>

        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* 🎨 Scoped Carousel Styles */}
      <style jsx>{`
        .carousel-section {
          background: linear-gradient(135deg, #f5f9ff 0%, #e8faff 100%);
          color: #333;
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

        .carousel-inner {
          border-radius: 15px;
          overflow: hidden;
        }

        .image-container {
          position: relative;
          overflow: hidden;
        }

        .image-container img {
          height: 400px;
          object-fit: cover;
          transition: transform 0.8s ease;
        }

        .image-container:hover img {
          transform: scale(1.08);
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.5),
            rgba(0, 0, 0, 0.1)
          );
        }

        .carousel-caption {
          background: rgba(0, 0, 0, 0.45);
          padding: 1rem 1.5rem;
          border-radius: 10px;
          max-width: 700px;
          margin: 0 auto 30px;
        }

        .carousel-caption h5 {
          font-size: 1.8rem;
          font-weight: 700;
          color: #fff;
        }

        .carousel-caption p {
          font-size: 1rem;
          color: #f1f1f1;
        }

        /* 🌙 Dark Mode */
        .dark-mode .carousel-section {
          background: linear-gradient(135deg, #121212 0%, #1e1e1e 100%);
        }

        .dark-mode .carousel-caption {
          background: rgba(255, 255, 255, 0.1);
        }

        .dark-mode .section-title {
          color: #00bcd4;
        }

        .dark-mode .section-title span {
          color: #ffc107;
        }

        .dark-mode .carousel-caption h5,
        .dark-mode .carousel-caption p {
          color: #e0e0e0;
        }
      `}</style>
    </section>
  );
}
