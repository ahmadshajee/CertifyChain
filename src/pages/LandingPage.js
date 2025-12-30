import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { 
  HiOutlineShieldCheck, 
  HiOutlineLightningBolt,
  HiOutlineGlobe,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineBadgeCheck,
  HiOutlineUserGroup,
  HiOutlineArrowRight,
  HiOutlineCheckCircle
} from 'react-icons/hi';
import { FaEthereum } from 'react-icons/fa';
import { SiIpfs } from 'react-icons/si';
import './LandingPage.css';

const LandingPage = () => {
  const { connectWallet, isConnected } = useWeb3();

  const features = [
    {
      icon: <HiOutlineShieldCheck />,
      title: 'Immutable Records',
      description: 'Credentials stored on blockchain cannot be altered or forged, ensuring permanent authenticity.'
    },
    {
      icon: <HiOutlineLightningBolt />,
      title: 'Instant Verification',
      description: 'Verify any credential in seconds, eliminating weeks of manual verification processes.'
    },
    {
      icon: <HiOutlineGlobe />,
      title: 'Global Access',
      description: 'Access and verify credentials from anywhere in the world, 24/7 availability.'
    },
    {
      icon: <HiOutlineDocumentText />,
      title: 'Complete Privacy',
      description: 'Students control who can access their credentials with granular permission settings.'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Credentials Issued' },
    { value: '500+', label: 'Institutions' },
    { value: '50K+', label: 'Verifications' },
    { value: '99.9%', label: 'Uptime' }
  ];

  const steps = [
    {
      number: '01',
      title: 'Institution Issues',
      description: 'Authorized institutions issue credentials directly to student wallets on the blockchain.'
    },
    {
      number: '02',
      title: 'Student Receives',
      description: 'Students receive credentials in their wallet and can view, manage, and share them.'
    },
    {
      number: '03',
      title: 'Employer Verifies',
      description: 'Employers instantly verify credentials using the unique hash or QR code.'
    }
  ];

  const useCases = [
    {
      icon: <HiOutlineAcademicCap />,
      title: 'Universities',
      description: 'Issue degrees, transcripts, and certificates that can be verified instantly.'
    },
    {
      icon: <HiOutlineBadgeCheck />,
      title: 'Professional Bodies',
      description: 'Issue and manage professional certifications and licenses.'
    },
    {
      icon: <HiOutlineUserGroup />,
      title: 'Employers',
      description: 'Verify candidate credentials in seconds, not weeks.'
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-grid"></div>
        </div>
        
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <FaEthereum />
              <span>Powered by Ethereum & IPFS</span>
            </div>
            
            <h1 className="hero-title">
              The Future of
              <span className="text-gradient"> Academic Credentials</span>
              <br />is on Blockchain
            </h1>
            
            <p className="hero-description">
              AccredChain revolutionizes credential verification with blockchain technology. 
              Issue tamper-proof certificates, empower students with ownership, 
              and enable instant verification for employers worldwide.
            </p>
            
            <div className="hero-actions">
              {!isConnected ? (
                <button className="btn btn-primary btn-lg" onClick={connectWallet}>
                  <FaEthereum />
                  Connect Wallet to Start
                </button>
              ) : (
                <Link to="/institution" className="btn btn-primary btn-lg">
                  Go to Dashboard
                  <HiOutlineArrowRight />
                </Link>
              )}
              <Link to="/verify" className="btn btn-secondary btn-lg">
                Verify a Credential
              </Link>
            </div>

            <div className="hero-trust">
              <span>Trusted by leading institutions</span>
              <div className="trust-logos">
                <div className="trust-logo">IIT</div>
                <div className="trust-logo">NIT</div>
                <div className="trust-logo">BITS</div>
                <div className="trust-logo">VIT</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="credential-card floating">
              <div className="credential-header">
                <HiOutlineAcademicCap />
                <div className="credential-badge verified">
                  <HiOutlineCheckCircle /> Verified
                </div>
              </div>
              <h3>Bachelor of Technology</h3>
              <p>Computer Science & Engineering</p>
              <div className="credential-details">
                <div className="detail">
                  <span className="label">Student</span>
                  <span className="value">John Doe</span>
                </div>
                <div className="detail">
                  <span className="label">Institution</span>
                  <span className="value">IIT Delhi</span>
                </div>
                <div className="detail">
                  <span className="label">Year</span>
                  <span className="value">2024</span>
                </div>
              </div>
              <div className="credential-hash">
                <SiIpfs />
                <span>QmX7b2...k9Fj</span>
              </div>
            </div>
            
            <div className="visual-elements">
              <div className="orbit-ring ring-1"></div>
              <div className="orbit-ring ring-2"></div>
              <div className="floating-icon icon-1"><FaEthereum /></div>
              <div className="floating-icon icon-2"><SiIpfs /></div>
              <div className="floating-icon icon-3"><HiOutlineShieldCheck /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid-home">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <h3 className="stat-value text-gradient">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why AccredChain?</span>
            <h2>Built for Trust, <span className="text-gradient">Designed for Speed</span></h2>
            <p>Our blockchain-powered platform eliminates credential fraud and streamlines verification.</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Simple Process</span>
            <h2>How It <span className="text-gradient">Works</span></h2>
            <p>Three simple steps to issue and verify credentials on blockchain.</p>
          </div>

          <div className="steps-container">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="use-cases-section section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Use Cases</span>
            <h2>Who Can <span className="text-gradient">Benefit?</span></h2>
            <p>AccredChain serves institutions, students, and employers alike.</p>
          </div>

          <div className="use-cases-grid">
            {useCases.map((useCase, index) => (
              <div key={index} className="use-case-card">
                <div className="use-case-icon">{useCase.icon}</div>
                <h3>{useCase.title}</h3>
                <p>{useCase.description}</p>
                <Link to="/how-it-works" className="learn-more">
                  Learn More <HiOutlineArrowRight />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Ready to Transform Credential Verification?</h2>
              <p>Join thousands of institutions already using blockchain for secure credential management.</p>
              <div className="cta-actions">
                <Link to="/institution" className="btn btn-primary btn-lg">
                  Get Started
                  <HiOutlineArrowRight />
                </Link>
                <Link to="/about" className="btn btn-secondary btn-lg">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="cta-visual">
              <div className="cta-icon-grid">
                <FaEthereum />
                <SiIpfs />
                <HiOutlineShieldCheck />
                <HiOutlineAcademicCap />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
