import React from "react";
import { motion } from "framer-motion";

export default function Contact() {
  return (
    <section id="contact-us" className="contact-us py-5">
      <div className="container">
        <motion.h2
          className="section-title text-center mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Get in <span>Touch</span>
        </motion.h2>

        <motion.p
          className="intro text-center mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Have questions or want to enroll? Reach out using the options below — we’d love to help.
        </motion.p>

        <div className="row gy-4 align-items-stretch">
          {/* Contact Cards */}
          <motion.div
            className="col-md-4"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="contact-card">
              <div className="icon" aria-hidden>
                {/* Phone SVG */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16.5v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.18 19.48 19.48 0 0 1-6-6A19.86 19.86 0 0 1 2.5 5.18 2 2 0 0 1 4.5 3h3a1 1 0 0 1 1 .75c.12.6.35 1.2.68 1.77a1 1 0 0 1-.24 1.09L8.7 7.7a14.01 14.01 0 0 0 6 6l.09-.07a1 1 0 0 1 1.09-.24c.57.33 1.17.56 1.77.68A1 1 0 0 1 21 16.5z" fill="currentColor"/>
                </svg>
              </div>

              <h3>Call Us</h3>
              <p className="muted">Quick answers over the phone — mornings are best.</p>
              <p className="contact-line">
                <a href="tel:+11234567890" className="contact-link">+1 (123) 456-7890</a>
              </p>
              <div className="actions">
                <a href="tel:+11234567890" className="btn btn-outline">Call Now</a>
                <a href="sms:+11234567890" className="btn btn-ghost">Send SMS</a>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="col-md-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            viewport={{ once: true }}
          >
            <div className="contact-card">
              <div className="icon" aria-hidden>
                {/* Email SVG */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75zM5 7.5l7 4.25L19 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h3>Email</h3>
              <p className="muted">Send us details — we typically reply within 24 hours.</p>
              <p className="contact-line">
                <a href="mailto:info@example.com" className="contact-link">info@example.com</a>
              </p>
              <div className="actions">
                <a href="mailto:info@example.com" className="btn btn-outline">Email Us</a>
                <a href="mailto:info@example.com?subject=Enquiry" className="btn btn-ghost">Send Enquiry</a>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="col-md-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="contact-card">
              <div className="icon" aria-hidden>
                {/* Location SVG */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" fill="currentColor"/>
                  <circle cx="12" cy="9" r="2.2" fill="#fff"/>
                </svg>
              </div>

              <h3>Visit Us</h3>
              <p className="muted">Walk-ins welcome during office hours.</p>
              <p className="contact-line">Bright Learning Path<br/>123 Learning St., City</p>
              <div className="actions">
                <a href="https://maps.google.com?q=Bright+Learning+Path" className="btn btn-outline" target="_blank" rel="noreferrer">Open Map</a>
                <a href="#contact-us" className="btn btn-ghost">Get Directions</a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Office hours + small map placeholder */}
        <div className="meta row mt-4 gx-4 align-items-center">
          <div className="col-md-6">
            <div className="hours-card">
              <h4>Office Hours</h4>
              <ul>
                <li><strong>Mon – Fri:</strong> 9:00 AM – 6:00 PM</li>
                <li><strong>Sat:</strong> 9:00 AM – 1:00 PM</li>
                <li><strong>Sun:</strong> Closed</li>
              </ul>
            </div>
          </div>

          <div className="col-md-6">
            <div className="map-placeholder" role="img" aria-label="Map placeholder">
              <div className="map-text">
                <strong>Map Placeholder</strong>
                <small>Replace with Google Maps / OpenStreetMap iframe</small>
              </div>
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="socials mt-4 text-center">
          <span className="follow">Follow us:</span>
          <a className="social" href="#" aria-label="Facebook">FB</a>
          <a className="social" href="#" aria-label="Instagram">IG</a>
          <a className="social" href="#" aria-label="YouTube">YT</a>
        </div>
      </div>

      {/* Scoped styles */}
      <style jsx>{`
        .contact-us {
          background: linear-gradient(135deg, #f7fbff 0%, #e8f7ff 100%);
          color: #0b2540;
          transition: background 0.3s ease;
        }

        .section-title {
          font-size: 2.25rem;
          font-weight: 800;
          color: #007bff;
          display: inline-block;
        }

        .section-title span { color: #ff9800; }

        .intro { color: #334155; max-width: 800px; margin: 0 auto; }

        .contact-card {
          background: rgba(255,255,255,0.98);
          border-radius: 14px;
          padding: 22px;
          height: 100%;
          box-shadow: 0 10px 30px rgba(7, 40, 80, 0.08);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .contact-card .icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, rgba(0,123,255,0.12), rgba(255,152,0,0.06));
          color: #007bff;
          box-shadow: 0 6px 18px rgba(0,123,255,0.06);
        }

        .contact-card h3 {
          margin: 0;
          font-size: 1.15rem;
          color: #08306b;
        }

        .muted { color: #64748b; font-size: 0.95rem; margin-bottom: 8px; }

        .contact-line { margin: 0; font-weight: 600; color: #0b2540; }

        .contact-link { color: #0b2540; text-decoration: none; }
        .contact-link:hover { text-decoration: underline; }

        .actions { display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap; }
        .btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 10px; text-decoration: none; font-weight: 700; }
        .btn-outline { border: 1px solid rgba(11,37,64,0.08); background: white; color: #0b2540; box-shadow: 0 6px 18px rgba(10, 40, 80, 0.04); }
        .btn-ghost { background: transparent; border: 1px dashed rgba(11,37,64,0.06); color: #0b2540; }

        .meta { margin-top: 26px; }
        .hours-card { background: rgba(255,255,255,0.98); padding: 18px; border-radius: 12px; box-shadow: 0 8px 20px rgba(7,40,80,0.06); }
        .hours-card h4 { margin: 0 0 8px 0; color: #08306b; }
        .hours-card ul { list-style: none; padding: 0; margin: 0; color: #334155; line-height: 1.7; }

        .map-placeholder {
          height: 120px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(0,123,255,0.06), rgba(0,188,212,0.03));
          border: 1px dashed rgba(11,37,64,0.04);
          color: #075985;
        }
        .map-text small { display: block; color: #075985; opacity: 0.85; }

        .socials { display: flex; align-items: center; justify-content: center; gap: 14px; color: #334155; }
        .socials .follow { margin-right: 8px; color: #64748b; }
        .social { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 8px; background: rgba(11,37,64,0.04); text-decoration: none; color: #0b2540; font-weight: 700; }
        .social:hover { transform: translateY(-3px); }

        /* Responsive */
        @media (max-width: 767px) {
          .section-title { font-size: 1.6rem; }
          .actions { justify-content: flex-start; }
        }

        /* Dark mode */
        .dark-mode .contact-us {
          background: linear-gradient(135deg, #071023 0%, #071826 100%);
          color: #dbeefe;
        }

        .dark-mode .contact-card,
        .dark-mode .hours-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          box-shadow: 0 8px 25px rgba(0,0,0,0.6);
          color: #cfeff6;
        }

        .dark-mode .contact-card .icon { background: linear-gradient(180deg, rgba(0,188,212,0.08), rgba(0,123,255,0.03)); color: #8be0ea; }
        .dark-mode .contact-card h3 { color: #8be0ea; }
        .dark-mode .muted { color: #9fb4bf; }
        .dark-mode .contact-line, .dark-mode .contact-link { color: #dff7fb; }
        .dark-mode .btn-outline { background: transparent; color: #dff7fb; border: 1px solid rgba(255,255,255,0.04); }
        .dark-mode .btn-ghost { border: 1px dashed rgba(255,255,255,0.04); color: #dff7fb; }

        .dark-mode .map-placeholder { background: linear-gradient(135deg, rgba(0,0,0,0.5), rgba(255,255,255,0.02)); color: #9ad7e5; border: 1px dashed rgba(255,255,255,0.04); }
        .dark-mode .social { background: rgba(255,255,255,0.02); color: #8be0ea; }

      `}</style>
    </section>
  );
}
