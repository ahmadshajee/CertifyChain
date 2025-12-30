import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import contractService from '../../services/contractService';
import ipfsService from '../../services/ipfsService';
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
  HiOutlineClock,
  HiOutlineRefresh
} from 'react-icons/hi';
import { FaEthereum } from 'react-icons/fa';
import { SiIpfs } from 'react-icons/si';
import './Verifier.css';

const VerifyCredential = () => {
  const { hash } = useParams();
  const { provider } = useWeb3();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loadingStep, setLoadingStep] = useState(1);

  useEffect(() => {
    verifyCredential();
  }, [hash, provider]);

  const verifyCredential = async () => {
    setIsLoading(true);
    setLoadingStep(1);

    try {
      // Initialize contract service
      if (provider) {
        await contractService.initialize(provider);
      }

      setLoadingStep(2);

      let result;
      
      // Check if it's a token ID or IPFS hash
      if (hash && !isNaN(hash)) {
        // It's a token ID
        result = await contractService.verifyCredential(parseInt(hash));
      } else if (hash && hash.startsWith('Qm')) {
        // It's an IPFS hash
        const hashResult = await contractService.getCredentialByHash(hash);
        if (hashResult.success) {
          result = await contractService.verifyCredential(hashResult.data.tokenId);
        } else {
          result = { success: false, error: 'Credential not found' };
        }
      } else {
        result = { success: false, error: 'Invalid credential identifier' };
      }

      setLoadingStep(3);

      if (result.success) {
        // Fetch institution details
        const institutionResult = await contractService.getInstitution(result.data.credential.institution);
        
        // Try to fetch metadata from IPFS
        let metadata = null;
        if (result.data.credential.ipfsHash) {
          const ipfsResult = await ipfsService.getFromIPFS(result.data.credential.ipfsHash);
          if (ipfsResult.success && ipfsResult.type === 'json') {
            metadata = ipfsResult.data;
          }
        }

        setVerificationResult({
          isValid: result.data.isValid,
          status: result.data.isValid ? 'verified' : getStatusFromCode(result.data.credential.status),
          credential: {
            tokenId: result.data.credential.tokenId,
            type: result.data.credential.credentialType,
            course: result.data.credential.courseName,
            studentName: result.data.credential.studentName,
            studentId: result.data.credential.studentId,
            studentWallet: result.data.credential.student,
            institution: institutionResult.success ? institutionResult.data.name : 'Unknown',
            institutionWallet: result.data.credential.institution,
            institutionVerified: result.data.institution.isVerified,
            issueDate: contractService.formatDate(result.data.credential.issueDate),
            expiryDate: result.data.credential.expiryDate ? contractService.formatDate(result.data.credential.expiryDate) : 'No Expiry',
            grade: result.data.credential.grade,
            ipfsHash: result.data.credential.ipfsHash,
            status: contractService.getStatusString(result.data.credential.status),
            metadata: metadata,
          },
          institution: result.data.institution,
        });
      } else {
        setVerificationResult({
          isValid: false,
          status: 'not-found',
          message: result.error || 'Credential not found on the blockchain'
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        isValid: false,
        status: 'error',
        message: error.message || 'Failed to verify credential'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusFromCode = (code) => {
    switch (code) {
      case 1: return 'revoked';
      case 2: return 'expired';
      default: return 'invalid';
    }
  };

  const getStatusIcon = () => {
    if (!verificationResult) return null;
    
    switch (verificationResult.status) {
      case 'verified':
        return <HiOutlineCheckCircle className="status-icon verified" />;
      case 'revoked':
        return <HiOutlineXCircle className="status-icon revoked" />;
      case 'expired':
        return <HiOutlineExclamationCircle className="status-icon expired" />;
      default:
        return <HiOutlineXCircle className="status-icon not-found" />;
    }
  };

  const getStatusMessage = () => {
    if (!verificationResult) return '';
    
    switch (verificationResult.status) {
      case 'verified':
        return 'This credential is valid and verified on the blockchain';
      case 'revoked':
        return 'This credential has been revoked by the issuing institution';
      case 'expired':
        return 'This credential has expired';
      case 'not-found':
        return 'No credential found with this identifier';
      default:
        return 'Unable to verify this credential';
    }
  };

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
              <div className={`loading-step ${loadingStep >= 1 ? 'active' : ''}`}>
                <HiOutlineCheckCircle /> Connecting to blockchain
              </div>
              <div className={`loading-step ${loadingStep >= 2 ? 'active' : ''}`}>
                <HiOutlineCheckCircle /> Fetching credential data
              </div>
              <div className={`loading-step ${loadingStep >= 3 ? 'active' : ''}`}>
                {loadingStep >= 3 ? <HiOutlineCheckCircle /> : <HiOutlineClock />} Validating authenticity
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-page">
      <div className="container">
        {/* Back Link */}
        <Link to="/verifier" className="back-link">
          <HiOutlineArrowLeft />
          Back to Verification Portal
        </Link>

        {/* Verification Result Card */}
        <div className={`verification-result-card ${verificationResult?.status}`}>
          <div className="result-header">
            {getStatusIcon()}
            <div>
              <h2 className="result-title">
                {verificationResult?.status === 'verified' ? 'Credential Verified' :
                 verificationResult?.status === 'revoked' ? 'Credential Revoked' :
                 verificationResult?.status === 'expired' ? 'Credential Expired' :
                 'Verification Failed'}
              </h2>
              <p className="result-message">{getStatusMessage()}</p>
            </div>
          </div>

          {verificationResult?.isValid && verificationResult?.credential && (
            <>
              {/* Credential Details */}
              <div className="credential-details-grid">
                <div className="detail-section">
                  <h3>
                    <HiOutlineAcademicCap />
                    Credential Information
                  </h3>
                  <div className="detail-item">
                    <span className="detail-label">Token ID</span>
                    <span className="detail-value">#{verificationResult.credential.tokenId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type</span>
                    <span className="detail-value">{verificationResult.credential.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Course/Program</span>
                    <span className="detail-value">{verificationResult.credential.course}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Grade</span>
                    <span className="detail-value">{verificationResult.credential.grade || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`status-badge ${verificationResult.credential.status.toLowerCase()}`}>
                      {verificationResult.credential.status}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>
                    <HiOutlineUser />
                    Student Information
                  </h3>
                  <div className="detail-item">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{verificationResult.credential.studentName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Student ID</span>
                    <span className="detail-value">{verificationResult.credential.studentId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Wallet Address</span>
                    <span className="detail-value wallet-address">
                      {verificationResult.credential.studentWallet}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>
                    <HiOutlineOfficeBuilding />
                    Issuing Institution
                  </h3>
                  <div className="detail-item">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{verificationResult.credential.institution}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`status-badge ${verificationResult.credential.institutionVerified ? 'verified' : 'unverified'}`}>
                      {verificationResult.credential.institutionVerified ? 'Verified Institution' : 'Unverified'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Wallet Address</span>
                    <span className="detail-value wallet-address">
                      {verificationResult.credential.institutionWallet}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>
                    <HiOutlineCalendar />
                    Dates
                  </h3>
                  <div className="detail-item">
                    <span className="detail-label">Issue Date</span>
                    <span className="detail-value">{verificationResult.credential.issueDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Expiry Date</span>
                    <span className="detail-value">{verificationResult.credential.expiryDate}</span>
                  </div>
                </div>
              </div>

              {/* Blockchain Info */}
              <div className="blockchain-info">
                <h3>
                  <FaEthereum />
                  Blockchain Record
                </h3>
                <div className="blockchain-links">
                  {verificationResult.credential.ipfsHash && (
                    <a
                      href={ipfsService.getGatewayUrl(verificationResult.credential.ipfsHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="blockchain-link"
                    >
                      <SiIpfs />
                      View on IPFS
                      <HiOutlineExternalLink />
                    </a>
                  )}
                  <a
                    href={`https://sepolia.etherscan.io/token/${process.env.REACT_APP_CREDENTIAL_NFT_ADDRESS}?a=${verificationResult.credential.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="blockchain-link"
                  >
                    <FaEthereum />
                    View on Etherscan
                    <HiOutlineExternalLink />
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className="verification-actions">
                <button className="btn btn-secondary" onClick={() => window.print()}>
                  <HiOutlinePrinter />
                  Print Report
                </button>
                <button className="btn btn-secondary" onClick={verifyCredential}>
                  <HiOutlineRefresh />
                  Re-verify
                </button>
              </div>
            </>
          )}

          {!verificationResult?.isValid && (
            <div className="error-details">
              <p>{verificationResult?.message}</p>
              <div className="error-actions">
                <Link to="/verifier" className="btn btn-primary">
                  Try Another Search
                </Link>
                <button className="btn btn-secondary" onClick={verifyCredential}>
                  <HiOutlineRefresh />
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyCredential;
