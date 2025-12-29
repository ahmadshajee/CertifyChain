import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineAcademicCap,
  HiOutlineDocumentAdd,
  HiOutlineUpload,
  HiOutlineBadgeCheck,
  HiOutlineShare,
  HiOutlineQrcode,
  HiOutlineSearch,
  HiOutlineCheckCircle,
  HiOutlineArrowRight
} from 'react-icons/hi';
import { FaEthereum } from 'react-icons/fa';
import { SiIpfs } from 'react-icons/si';
import './Pages.css';

const HowItWorks = () => {
  const institutionSteps = [
    {
      icon: <HiOutlineDocumentAdd />,
      title: 'Create Credential',
      description: 'Fill in student details and credential information through the institution portal.'
    },
    {
      icon: <HiOutlineUpload />,
      title: 'Upload to IPFS',
      description: 'Credential document is uploaded to IPFS and receives a unique content hash.'
    },
    {
      icon: <FaEthereum />,
      title: 'Record on Blockchain',
      description: 'Credential hash is recorded on Ethereum blockchain with institution signature.'
    },
    {
      icon: <HiOutlineBadgeCheck />,
      title: 'Issue to Student',
      description: 'Student receives the credential in their wallet and can access it anytime.'
    }
  ];

  const studentSteps = [
    {
      icon: <HiOutlineAcademicCap />,
      title: 'Receive Credential',
      description: 'Credentials appear automatically in your wallet when issued by institutions.'
    },
    {
      icon: <HiOutlineShare />,
      title: 'Share Securely',
      description: 'Generate shareable links or QR codes with optional expiry settings.'
    },
    {
      icon: <HiOutlineQrcode />,
      title: 'Track Access',
      description: 'See who viewed your credentials and when with complete transparency.'
    }
  ];

  const verifierSteps = [
    {
      icon: <HiOutlineSearch />,
      title: 'Enter Hash/Scan QR',
      description: 'Input the credential hash or scan the QR code from the certificate.'
    },
    {
      icon: <FaEthereum />,
      title: 'Blockchain Query',
      description: 'System queries the Ethereum blockchain to retrieve credential data.'
    },
    {
      icon: <HiOutlineCheckCircle />,
      title: 'View Results',
      description: 'See complete credential details, issuer information, and verification status.'
    }
  ];

  const faqs = [
    {
      question: 'What blockchain does CertifyChain use?',
      answer: 'CertifyChain is built on Ethereum, utilizing smart contracts for secure credential management. We also support Layer 2 solutions for reduced gas costs.'
    },
    {
      question: 'How much does it cost to issue a credential?',
      answer: 'The cost depends on Ethereum gas prices. Typically, issuing a credential costs between $0.50-$5 depending on network congestion. Batch issuance reduces per-credential costs significantly.'
    },
    {
      question: 'Can credentials be revoked?',
      answer: 'Yes, authorized institutions can revoke credentials if necessary (e.g., academic misconduct). Revoked credentials are clearly marked during verification.'
    },
    {
      question: 'Is student data stored on the blockchain?',
      answer: 'Only credential hashes are stored on-chain. Actual documents are stored on IPFS, and personal details are encrypted. Students control access to their full information.'
    },
    {
      question: 'What if an institution loses access to their wallet?',
      answer: 'We recommend institutions use multi-signature wallets with proper backup procedures. Already-issued credentials remain valid on the blockchain.'
    },
    {
      question: 'Can I verify credentials without connecting a wallet?',
      answer: 'Yes! Verification is completely free and doesn\'t require a wallet connection. Anyone can verify credentials using the hash or QR code.'
    }
  ];

  return (
    <div className="how-it-works-page">
      {/* Hero */}
      <section className="hiw-hero">
        <div className="container">
          <div className="hiw-hero-content">
            <span className="page-tag">How It Works</span>
            <h1>
              Simple, Secure, and
              <span className="text-gradient"> Decentralized</span>
            </h1>
            <p>
              Learn how CertifyChain leverages blockchain technology to make 
              credential verification instant, tamper-proof, and accessible worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="architecture-section section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Architecture</span>
            <h2>System <span className="text-gradient">Overview</span></h2>
          </div>

          <div className="architecture-diagram">
            <div className="arch-node institution">
              <div className="node-icon">🏛️</div>
              <span>Institution</span>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-node smart-contract">
              <div className="node-icon"><FaEthereum /></div>
              <span>Smart Contract</span>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-node storage">
              <div className="node-icon"><SiIpfs /></div>
              <span>IPFS Storage</span>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-node student">
              <div className="node-icon">🎓</div>
              <span>Student Wallet</span>
            </div>
          </div>
        </div>
      </section>

      {/* For Institutions */}
      <section className="role-section section">
        <div className="container">
          <div className="role-header">
            <div className="role-icon institution">🏛️</div>
            <div>
              <h2>For Institutions</h2>
              <p>Issue tamper-proof credentials in minutes</p>
            </div>
          </div>

          <div className="steps-grid">
            {institutionSteps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{index + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>

          <div className="role-cta">
            <Link to="/institution" className="btn btn-primary">
              Access Institution Portal <HiOutlineArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* For Students */}
      <section className="role-section section alt-bg">
        <div className="container">
          <div className="role-header">
            <div className="role-icon student">🎓</div>
            <div>
              <h2>For Students</h2>
              <p>Own and share your credentials securely</p>
            </div>
          </div>

          <div className="steps-grid three-cols">
            {studentSteps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{index + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>

          <div className="role-cta">
            <Link to="/student" className="btn btn-primary">
              Access Student Portal <HiOutlineArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* For Verifiers */}
      <section className="role-section section">
        <div className="container">
          <div className="role-header">
            <div className="role-icon verifier">🔍</div>
            <div>
              <h2>For Employers & Verifiers</h2>
              <p>Verify credentials instantly</p>
            </div>
          </div>

          <div className="steps-grid three-cols">
            {verifierSteps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{index + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>

          <div className="role-cta">
            <Link to="/verify" className="btn btn-primary">
              Verify a Credential <HiOutlineArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="faq-section section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">FAQ</span>
            <h2>Frequently Asked <span className="text-gradient">Questions</span></h2>
          </div>

          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-card">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hiw-cta section">
        <div className="container">
          <div className="cta-box gradient">
            <h2>Ready to experience the future of credentials?</h2>
            <p>Get started with CertifyChain today</p>
            <div className="cta-buttons">
              <Link to="/institution" className="btn btn-primary btn-lg">
                Get Started <HiOutlineArrowRight />
              </Link>
              <Link to="/about" className="btn btn-secondary btn-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
