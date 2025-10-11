import React from "react";

export default function Footer() {
  const handleSubscribe = (e) => {
    e.preventDefault();
    // Replace with real API call if desired
    alert("Thanks for subscribing! (demo)");
  };

  return (
    <footer className="site-footer py-5">
      <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
        <div className="brand">
          <p className="mb-0 site-title">
            <strong>Bright Learning Path</strong>
          </p>
          <small className="muted">&copy; 2025 Bright Learning Path. All rights reserved.</small>
        </div>

        <nav aria-label="footer navigation" className="footer-links">
          <a href="#courses" className="footer-link">Courses</a>
          <span className="sep" aria-hidden="true">•</span>
          <a href="#about" className="footer-link">About</a>
          <span className="sep" aria-hidden="true">•</span>
          <a href="#contact-us" className="footer-link">Contact</a>
          <span className="sep" aria-hidden="true">•</span>
          <a href="#privacy" className="footer-link">Privacy</a>
        </nav>

        <form className="subscribe-form d-flex align-items-center" onSubmit={handleSubscribe} aria-label="Subscribe to newsletter">
          <label htmlFor="footer-email" className="visually-hidden">Email</label>
          <input id="footer-email" type="email" required placeholder="Your email" className="subscribe-input" />
          <button type="submit" className="subscribe-btn" aria-label="Subscribe">Subscribe</button>
        </form>
      </div>

      <div className="container mt-3 border-top pt-3 d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div className="social">
          <a href="#" className="social-link" aria-label="Facebook">
            {/* Facebook SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2v-2.9h2.2V9.1c0-2.2 1.3-3.4 3.3-3.4.96 0 1.97.17 1.97.17v2.2h-1.13c-1.12 0-1.47.7-1.47 1.42v1.7h2.5l-.4 2.9h-2.1v7A10 10 0 0022 12z"/></svg>
          </a>
          <a href="#" className="social-link" aria-label="Instagram">
            {/* Instagram SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.2A3.8 3.8 0 1015.8 12 3.8 3.8 0 0012 8.2zm6.4-2.6a1.1 1.1 0 11-1.1-1.1 1.1 1.1 0 011.1 1.1z"/></svg>
          </a>
          <a href="#" className="social-link" aria-label="YouTube">
            {/* YouTube SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 7.1a3 3 0 00-2.1-2.1C19.5 4.5 12 4.5 12 4.5s-7.5 0-8.9.5A3 3 0 001 7.1 31.3 31.3 0 000 12a31.3 31.3 0 001 4.9 3 3 0 002.1 2.1c1.4.5 8.9.5 8.9.5s7.5 0 8.9-.5A3 3 0 0023 16.9 31.1 31.1 0 0024 12a31.1 31.1 0 00-1-4.9zM9.8 15.5V8.5l6.4 3.5-6.4 3.5z"/></svg>
          </a>
        </div>

        <div className="policy mt-2 mt-md-0">
          <small className="muted">Built with care • <a href="#terms" className="footer-link">Terms</a></small>
        </div>
      </div>

      {/* Scoped footer styles */}
      <style jsx>{`
        .site-footer {
          background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
          color: #222;
          font-size: 0.95rem;
        }

        .site-title {
          margin: 0;
          font-size: 1.05rem;
        }

        .muted {
          color: #6c757d;
        }

        .footer-links {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .footer-link {
          color: #007bff;
          text-decoration: none;
          padding: 6px 8px;
          border-radius: 6px;
        }

        .footer-link:hover,
        .footer-link:focus {
          background: rgba(0, 123, 255, 0.08);
          text-decoration: none;
        }

        .sep {
          color: #adb5bd;
          margin: 0 6px;
        }

        .subscribe-form {
          gap: 8px;
        }

        .subscribe-input {
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #dbe9ff;
          min-width: 180px;
        }

        .subscribe-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(0,123,255,0.12);
          border-color: #007bff;
        }

        .subscribe-btn {
          padding: 8px 14px;
          margin-left: 6px;
          border-radius: 8px;
          border: none;
          background: #007bff;
          color: #fff;
          font-weight: 600;
        }

        .subscribe-btn:hover {
          filter: brightness(0.95);
          transform: translateY(-1px);
        }

        .social {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .social-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.04);
          color: #0b57d0;
          text-decoration: none;
          transition: transform 0.18s ease, background 0.18s ease;
        }

        .social-link:hover {
          transform: translateY(-3px);
          background: rgba(0, 123, 255, 0.12);
        }

        .policy a {
          color: #007bff;
          text-decoration: none;
        }

        /* Responsive */
        @media (max-width: 767px) {
          .container { gap: 12px; }
          .footer-links { justify-content: center; }
        }

        /* Dark mode */
        .dark-mode .site-footer {
          background: linear-gradient(180deg, #0b1220 0%, #0f1724 100%);
          color: #dfeff6;
        }

        .dark-mode .footer-link {
          color: #8be0ea;
        }

        .dark-mode .muted {
          color: #9fb4bf;
        }

        .dark-mode .subscribe-input {
          background: #0b1220;
          color: #dfeef6;
          border: 1px solid rgba(255,255,255,0.04);
        }

        .dark-mode .subscribe-btn {
          background: #00bcd4;
          color: #022026;
        }

        .dark-mode .social-link {
          background: rgba(255,255,255,0.03);
          color: #8be0ea;
        }

        .visually-hidden {
          position: absolute !important;
          height: 1px; width: 1px;
          overflow: hidden;
          clip: rect(1px, 1px, 1px, 1px);
          white-space: nowrap;
        }
      `}</style>
    </footer>
  );
}
