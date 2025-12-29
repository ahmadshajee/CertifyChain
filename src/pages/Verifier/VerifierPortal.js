import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineSearch,
  HiOutlineQrcode,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineGlobe,
  HiOutlineDocumentText
} from 'react-icons/hi';
import './Verifier.css';

const VerifierPortal = () => {
  const navigate = useNavigate();
  const [credentialHash, setCredentialHash] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!credentialHash.trim()) return;
    
    setIsSearching(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSearching(false);
    
    navigate(`/verify/${credentialHash}`);
  };

  const features = [
    {
      icon: <HiOutlineLightningBolt />,
      title: 'Instant Verification',
      description: 'Verify any credential in seconds, not days'
    },
    {
      icon: <HiOutlineShieldCheck />,
      title: 'Tamper-Proof',
      description: 'Blockchain ensures credentials cannot be forged'
    },
    {
      icon: <HiOutlineGlobe />,
      title: 'Global Access',
      description: 'Verify credentials from anywhere, anytime'
    },
    {
      icon: <HiOutlineDocumentText />,
      title: 'Complete Details',
      description: 'View full credential information and history'
    }
  ];

  const recentVerifications = [
    { hash: '0x7f8a...3d2e', type: 'B.Tech Certificate', institution: 'IIT Delhi', result: 'verified' },
    { hash: '0x9c4b...7a1f', type: 'M.Tech Certificate', institution: 'NIT Trichy', result: 'verified' },
    { hash: '0x3e5d...8b2c', type: 'Course Certificate', institution: 'Coursera', result: 'verified' },
    { hash: '0x6f2a...4c9d', type: 'Diploma', institution: 'Unknown', result: 'not-found' },
  ];

  return (
    <div className="verifier-portal">
      {/* Hero Section */}
      <section className="verify-hero">
        <div className="verify-hero-bg">
          <div className="verify-gradient"></div>
        </div>
        
        <div className="container">
          <div className="verify-hero-content">
            <h1>
              Verify Credentials
              <span className="text-gradient"> Instantly</span>
            </h1>
            <p>
              Enter a credential hash or scan a QR code to verify the authenticity 
              of any blockchain-issued academic credential.
            </p>

            <form onSubmit={handleVerify} className="verify-search-form">
              <div className="search-input-wrapper">
                <HiOutlineSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Enter credential hash (0x...) or certificate ID"
                  value={credentialHash}
                  onChange={(e) => setCredentialHash(e.target.value)}
                  className="verify-input"
                />
                <button type="button" className="qr-scan-btn" title="Scan QR Code">
                  <HiOutlineQrcode />
                </button>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-lg verify-btn"
                disabled={isSearching || !credentialHash.trim()}
              >
                {isSearching ? (
                  <>
                    <span className="loading-spinner-sm"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <HiOutlineShieldCheck />
                    Verify Credential
                  </>
                )}
              </button>
            </form>

            <div className="verify-hint">
              <span>Try sample:</span>
              <button 
                className="sample-hash"
                onClick={() => setCredentialHash('0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a')}
              >
                0x7f8a9b2c...7f8a
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="verify-features section">
        <div className="container">
          <div className="features-grid verify-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="verify-feature-card">
                <div className="feature-icon-verify">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="verify-how-it-works section">
        <div className="container">
          <div className="section-header">
            <h2>How Verification <span className="text-gradient">Works</span></h2>
            <p>Simple, fast, and secure credential verification</p>
          </div>

          <div className="verify-steps">
            <div className="verify-step">
              <div className="step-num">1</div>
              <h3>Enter Hash or Scan QR</h3>
              <p>Input the credential's unique blockchain hash or scan the QR code</p>
            </div>
            <div className="step-connector-line"></div>
            <div className="verify-step">
              <div className="step-num">2</div>
              <h3>Blockchain Lookup</h3>
              <p>System queries the Ethereum blockchain for credential data</p>
            </div>
            <div className="step-connector-line"></div>
            <div className="verify-step">
              <div className="step-num">3</div>
              <h3>View Results</h3>
              <p>See complete credential details and verification status</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Verifications */}
      <section className="recent-verifications section">
        <div className="container">
          <div className="section-header">
            <h2>Recent <span className="text-gradient">Verifications</span></h2>
            <p>Latest credentials verified on our platform</p>
          </div>

          <div className="verifications-table">
            <table className="table">
              <thead>
                <tr>
                  <th>Credential Hash</th>
                  <th>Type</th>
                  <th>Institution</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {recentVerifications.map((item, index) => (
                  <tr key={index}>
                    <td><code className="hash-code">{item.hash}</code></td>
                    <td>{item.type}</td>
                    <td>{item.institution}</td>
                    <td>
                      <span className={`badge badge-${item.result === 'verified' ? 'success' : 'danger'}`}>
                        {item.result === 'verified' ? '✓ Verified' : '✗ Not Found'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="trust-banner">
        <div className="container">
          <div className="trust-content">
            <HiOutlineShieldCheck className="trust-icon" />
            <div>
              <h3>Trusted by 500+ Institutions Worldwide</h3>
              <p>Join thousands of employers using blockchain verification</p>
            </div>
            <button className="btn btn-primary">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VerifierPortal;
