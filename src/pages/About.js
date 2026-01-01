import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineAcademicCap,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineGlobe,
  HiOutlineUsers,
  HiOutlineCode,
  HiOutlineArrowRight
} from 'react-icons/hi';
import { FaEthereum, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { SiIpfs, SiSolidity } from 'react-icons/si';
import './Pages.css';

const About = () => {
  const team = [
    {
      name: 'Your Name',
      role: 'Full Stack Developer',
      image: '👨‍💻',
      links: { github: '#', linkedin: '#', twitter: '#' }
    }
  ];

  const techStack = [
    { icon: <FaEthereum />, name: 'Ethereum', desc: 'Blockchain Platform' },
    { icon: <SiSolidity />, name: 'Solidity', desc: 'Smart Contracts' },
    { icon: <SiIpfs />, name: 'IPFS', desc: 'Decentralized Storage' },
    { icon: <HiOutlineCode />, name: 'React', desc: 'Frontend Framework' },
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <span className="page-tag">About Us</span>
            <h1>
              Revolutionizing Credential
              <span className="text-gradient"> Verification</span>
            </h1>
            <p>
              AccredChain is a research project exploring blockchain technology to eliminate credential 
              fraud and streamline the verification process for academic institutions, 
              students, and employers.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-content">
              <span className="section-tag">Our Mission</span>
              <h2>Making Credentials <span className="text-gradient">Trustworthy</span></h2>
              <p>
                We believe that every academic achievement should be verifiable, 
                secure, and accessible. Our mission is to build a transparent 
                ecosystem where credentials can be trusted instantly, eliminating 
                the need for lengthy manual verification processes.
              </p>
              <div className="mission-stats">
                <div className="mission-stat">
                  <h3>30%</h3>
                  <p>of resumes contain some form of credential fraud</p>
                </div>
                <div className="mission-stat">
                  <h3>2-4 Weeks</h3>
                  <p>typical time for manual credential verification</p>
                </div>
                <div className="mission-stat">
                  <h3>$600B</h3>
                  <p>annual cost of credential fraud globally</p>
                </div>
              </div>
            </div>
            <div className="mission-visual">
              <div className="visual-card">
                <HiOutlineShieldCheck className="visual-icon" />
                <h3>Secure</h3>
                <p>Blockchain-powered immutability</p>
              </div>
              <div className="visual-card">
                <HiOutlineLightningBolt className="visual-icon" />
                <h3>Fast</h3>
                <p>Instant verification</p>
              </div>
              <div className="visual-card">
                <HiOutlineGlobe className="visual-icon" />
                <h3>Global</h3>
                <p>Accessible worldwide</p>
              </div>
              <div className="visual-card">
                <HiOutlineUsers className="visual-icon" />
                <h3>Open</h3>
                <p>Open-source research</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="problem-solution section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">The Problem We Solve</span>
            <h2>Traditional Verification is <span className="text-gradient">Broken</span></h2>
          </div>

          <div className="comparison-grid">
            <div className="comparison-card problem">
              <h3>❌ Traditional System</h3>
              <ul>
                <li>Manual verification takes weeks</li>
                <li>Paper credentials easily forged</li>
                <li>No standardized verification process</li>
                <li>Expensive for institutions</li>
                <li>No ownership for students</li>
                <li>Limited global accessibility</li>
              </ul>
            </div>
            <div className="comparison-card solution">
              <h3>✓ AccredChain Solution</h3>
              <ul>
                <li>Instant blockchain verification</li>
                <li>Tamper-proof credentials</li>
                <li>Standardized, universal process</li>
                <li>Cost-effective for all parties</li>
                <li>Full student ownership</li>
                <li>Global 24/7 accessibility</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="tech-stack-section section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Technology</span>
            <h2>Built with <span className="text-gradient">Cutting-Edge Tech</span></h2>
            <p>Our platform leverages the latest in blockchain and web technologies</p>
          </div>

          <div className="tech-grid">
            {techStack.map((tech, index) => (
              <div key={index} className="tech-card">
                <div className="tech-icon">{tech.icon}</div>
                <h3>{tech.name}</h3>
                <p>{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">The Team</span>
            <h2>Meet the <span className="text-gradient">Developer</span></h2>
            <p>Building the future of credential verification</p>
          </div>

          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-avatar">{member.image}</div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
                <div className="team-social">
                  <a href={member.links.github}><FaGithub /></a>
                  <a href={member.links.linkedin}><FaLinkedin /></a>
                  <a href={member.links.twitter}><FaTwitter /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta section">
        <div className="container">
          <div className="cta-box">
            <HiOutlineAcademicCap className="cta-icon" />
            <h2>Explore Our Research</h2>
            <p>Discover how blockchain can transform credential verification</p>
            <div className="cta-buttons">
              <Link to="/institution" className="btn btn-primary btn-lg">
                Try Demo <HiOutlineArrowRight />
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary btn-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
