import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationCircle,
  HiOutlineArrowLeft,
  HiOutlineExternalLink,
  HiOutlineDownload,
  HiOutlinePrinter,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlineDocumentText,
  HiOutlineClock
} from 'react-icons/hi';
import { FaEthereum } from 'react-icons/fa';
import { SiIpfs } from 'react-icons/si';
import './Verifier.css';

const VerifyCredential = () => {
  const { hash } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    // Simulate blockchain verification
    const verifyCredential = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification result
      if (hash && hash.startsWith('0x')) {
        setVerificationResult({
          isValid: true,
          status: 'verified',
          credential: {
            type: 'Bachelor of Technology',
            course: 'Computer Science & Engineering',
            studentName: 'John Doe',
            studentWallet: '0x1234...5678',
            institution: 'Indian Institute of Technology Delhi',
            institutionWallet: '0x9876...4321',
            issueDate: '2024-06-15',
            expiryDate: null,
            grade: '8.5 CGPA',
            description: 'Successfully completed 4-year B.Tech program',
            hash: hash,
            ipfsHash: 'QmX7b2kH9dF3jK4mN5pQ6rS8tU9vW0xY1zA2bC3dE4fG5hI6jK7',
            transactionHash: '0xabcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzab5678',
            blockNumber: 18234567,
            timestamp: '2024-06-15 14:32:45 UTC',
            gasUsed: '145,234'
          },
          verificationHistory: [
            { date: '2024-12-28', by: 'Google HR', location: 'Bangalore, India' },
            { date: '2024-12-25', by: 'Microsoft Recruiter', location: 'Hyderabad, India' },
            { date: '2024-12-20', by: 'Amazon Hiring', location: 'Chennai, India' },
          ]
        });
      } else {
        setVerificationResult({
          isValid: false,
          status: 'not-found',
          message: 'No credential found with this hash'
        });
      }
      
      setIsLoading(false);
    };

    verifyCredential();
  }, [hash]);

  if (isLoading) {
    return (
      <div className="verification-page">
        <div className="container">
          <div className="verification-loading">
            <div className="loading-animation">
              <div className="loading-ring"></div>
              <FaEthereum className="loading-icon" />
            </div>
            <h2>Verifying Credential</h2>
            <p>Querying the Ethereum blockchain...</p>
            <div className="loading-steps">
              <div className="loading-step active">
                <HiOutlineCheckCircle /> Connecting to blockchain
              </div>
              <div className="loading-step active">
                <HiOutlineCheckCircle /> Fetching credential data
              </div>
              <div className="loading-step">
                <HiOutlineClock /> Validating authenticity
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!verificationResult?.isValid) {
    return (
      <div className="verification-page">
        <div className="container">
          <Link to="/verify" className="back-link">
            <HiOutlineArrowLeft /> Back to Verification
          </Link>
          
          <div className="verification-failed">
            <div className="failed-icon">
              <HiOutlineXCircle />
            </div>
            <h1>Credential Not Found</h1>
            <p>No credential exists with hash:</p>
            <code className="hash-display">{hash}</code>
            <div className="failed-reasons">
              <h3>Possible reasons:</h3>
              <ul>
                <li>The hash may be incorrect or incomplete</li>
                <li>The credential may have been revoked</li>
                <li>The credential may not exist on this network</li>
              </ul>
            </div>
            <Link to="/verify" className="btn btn-primary">
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { credential, verificationHistory } = verificationResult;

  return (
    <div className="verification-page">
      <div className="container">
        <Link to="/verify" className="back-link">
          <HiOutlineArrowLeft /> Back to Verification
        </Link>

        {/* Verification Status Banner */}
        <div className="verification-banner success">
          <div className="banner-icon">
            <HiOutlineCheckCircle />
          </div>
          <div className="banner-content">
            <h2>Credential Verified ✓</h2>
            <p>This credential is authentic and has been verified on the Ethereum blockchain</p>
          </div>
          <div className="banner-actions">
            <button className="btn btn-secondary btn-sm">
              <HiOutlinePrinter /> Print
            </button>
            <button className="btn btn-secondary btn-sm">
              <HiOutlineDownload /> Download
            </button>
          </div>
        </div>

        <div className="verification-content">
          {/* Main Credential Card */}
          <div className="verified-credential-card">
            <div className="credential-header-section">
              <div className="credential-type-badge">
                <HiOutlineAcademicCap />
                {credential.type}
              </div>
              <div className="verified-stamp">
                <HiOutlineCheckCircle />
                VERIFIED
              </div>
            </div>

            <h1 className="credential-title">{credential.course}</h1>
            
            <div className="credential-main-info">
              <div className="info-row">
                <div className="info-item">
                  <div className="info-icon"><HiOutlineUser /></div>
                  <div className="info-content">
                    <span className="info-label">Student</span>
                    <span className="info-value">{credential.studentName}</span>
                    <code className="info-wallet">{credential.studentWallet}</code>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-icon"><HiOutlineOfficeBuilding /></div>
                  <div className="info-content">
                    <span className="info-label">Issuing Institution</span>
                    <span className="info-value">{credential.institution}</span>
                    <code className="info-wallet">{credential.institutionWallet}</code>
                  </div>
                </div>
              </div>

              <div className="info-row">
                <div className="info-item">
                  <div className="info-icon"><HiOutlineCalendar /></div>
                  <div className="info-content">
                    <span className="info-label">Issue Date</span>
                    <span className="info-value">{credential.issueDate}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-icon"><HiOutlineDocumentText /></div>
                  <div className="info-content">
                    <span className="info-label">Grade</span>
                    <span className="info-value">{credential.grade}</span>
                  </div>
                </div>
              </div>
            </div>

            {credential.description && (
              <div className="credential-description">
                <p>{credential.description}</p>
              </div>
            )}
          </div>

          {/* Blockchain Details */}
          <div className="blockchain-details">
            <h3>Blockchain Details</h3>
            
            <div className="detail-grid">
              <div className="detail-card">
                <div className="detail-header">
                  <FaEthereum />
                  <span>Credential Hash</span>
                </div>
                <code>{credential.hash}</code>
                <a href={`https://etherscan.io/tx/${credential.hash}`} target="_blank" rel="noopener noreferrer" className="external-link">
                  View on Etherscan <HiOutlineExternalLink />
                </a>
              </div>

              <div className="detail-card">
                <div className="detail-header">
                  <SiIpfs />
                  <span>IPFS Hash</span>
                </div>
                <code>{credential.ipfsHash}</code>
                <a href={`https://ipfs.io/ipfs/${credential.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="external-link">
                  View on IPFS <HiOutlineExternalLink />
                </a>
              </div>

              <div className="detail-card">
                <div className="detail-header">
                  <HiOutlineDocumentText />
                  <span>Transaction Details</span>
                </div>
                <div className="tx-details">
                  <div className="tx-item">
                    <span>Block Number</span>
                    <span>{credential.blockNumber}</span>
                  </div>
                  <div className="tx-item">
                    <span>Timestamp</span>
                    <span>{credential.timestamp}</span>
                  </div>
                  <div className="tx-item">
                    <span>Gas Used</span>
                    <span>{credential.gasUsed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verification History */}
          <div className="verification-history">
            <h3>Verification History</h3>
            <p className="history-subtitle">This credential has been verified {verificationHistory.length + 1} times</p>
            
            <div className="history-timeline">
              <div className="timeline-item current">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-date">Just now</span>
                  <p>Verified by you</p>
                </div>
              </div>
              {verificationHistory.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <span className="timeline-date">{item.date}</span>
                    <p>{item.by}</p>
                    <span className="timeline-location">{item.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warning for employers */}
        <div className="employer-notice">
          <HiOutlineExclamationCircle />
          <div>
            <strong>For Employers:</strong> Always verify credentials directly through this portal. 
            Do not rely on screenshots or PDFs provided by candidates.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCredential;
