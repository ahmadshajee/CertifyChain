import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineAcademicCap,
  HiOutlineMail,
  HiOutlineLocationMarker
} from 'react-icons/hi';
import { 
  FaTwitter, 
  FaGithub, 
  FaLinkedin, 
  FaDiscord 
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-section">
            <Link to="/" className="footer-logo">
              <div className="logo-icon">
                <HiOutlineAcademicCap />
              </div>
              <span>AccredChain</span>
            </Link>
            <p className="footer-description">
              A research project exploring blockchain-based academic credential verification. 
              Secure, transparent, and immutable.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/verify">Verify Credential</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div className="footer-section">
            <h4>Portals</h4>
            <ul>
              <li><Link to="/institution">Institution Portal</Link></li>
              <li><Link to="/student">Student Portal</Link></li>
              <li><Link to="/verify">Verifier Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} AccredChain. All rights reserved.</p>
          <div className="footer-social">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaTwitter />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaGithub />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaLinkedin />
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaDiscord />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
