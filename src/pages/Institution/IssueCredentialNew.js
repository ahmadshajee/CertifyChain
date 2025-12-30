import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { toast } from 'react-toastify';
import contractService from '../../services/contractService';
import ipfsService from '../../services/ipfsService';
import { 
  HiOutlineDocumentAdd,
  HiOutlineCollection,
  HiOutlineHome,
  HiOutlineUpload,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineClipboard,
  HiOutlinePhotograph,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import './Institution.css';

const IssueCredential = () => {
  const { isConnected, account, formatAddress, provider } = useWeb3();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [institutionInfo, setInstitutionInfo] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState('');
  
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    studentWallet: '',
    credentialType: '',
    course: '',
    grade: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    description: '',
  });

  const sidebarLinks = [
    { path: '/institution', icon: <HiOutlineHome />, label: 'Dashboard' },
    { path: '/institution/issue', icon: <HiOutlineDocumentAdd />, label: 'Issue Credential' },
    { path: '/institution/manage', icon: <HiOutlineCollection />, label: 'Manage Credentials' },
  ];

  const credentialTypes = [
    { value: 'degree', label: 'Bachelor\'s Degree' },
    { value: 'masters', label: 'Master\'s Degree' },
    { value: 'phd', label: 'PhD' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'transcript', label: 'Transcript' },
    { value: 'course', label: 'Course Completion' },
    { value: 'professional', label: 'Professional Certification' }
  ];

  // Initialize contract service and get institution info
  useEffect(() => {
    const initializeContract = async () => {
      if (provider && account) {
        await contractService.initialize(provider);
        const result = await contractService.getInstitution(account);
        if (result.success && result.data.name) {
          setInstitutionInfo(result.data);
        }
      }
    };
    initializeContract();
  }, [provider, account]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setDocumentFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const validateForm = () => {
    if (!formData.studentName.trim()) {
      toast.error('Student name is required');
      return false;
    }
    if (!formData.studentId.trim()) {
      toast.error('Student ID is required');
      return false;
    }
    if (!formData.studentWallet.trim() || !formData.studentWallet.startsWith('0x')) {
      toast.error('Valid student wallet address is required');
      return false;
    }
    if (!formData.credentialType) {
      toast.error('Credential type is required');
      return false;
    }
    if (!formData.course.trim()) {
      toast.error('Course/Program name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!institutionInfo?.isVerified) {
      toast.error('Your institution must be verified to issue credentials');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('Preparing credential data...');
    
    try {
      // Step 1: Upload document to IPFS (if provided)
      let documentHash = '';
      if (documentFile) {
        setUploadProgress('Uploading document to IPFS...');
        const docResult = await ipfsService.uploadCredentialDocument(documentFile, {
          studentId: formData.studentId,
          credentialType: formData.credentialType,
          institutionAddress: account,
        });
        
        if (!docResult.success) {
          throw new Error('Failed to upload document to IPFS');
        }
        documentHash = docResult.ipfsHash;
        toast.success('Document uploaded to IPFS');
      }

      // Step 2: Create and upload metadata to IPFS
      setUploadProgress('Creating credential metadata...');
      const credentialMetadata = {
        credentialType: formData.credentialType,
        courseName: formData.course,
        studentName: formData.studentName,
        studentId: formData.studentId,
        institutionName: institutionInfo.name,
        institutionAddress: account,
        grade: formData.grade,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        description: formData.description,
        documentHash: documentHash,
      };

      const metadataResult = await ipfsService.uploadCredentialMetadata(credentialMetadata);
      
      if (!metadataResult.success) {
        throw new Error('Failed to upload metadata to IPFS');
      }
      
      toast.success('Metadata uploaded to IPFS');

      // Step 3: Issue credential on blockchain
      setUploadProgress('Issuing credential on blockchain...');
      
      const expiryTimestamp = formData.expiryDate 
        ? Math.floor(new Date(formData.expiryDate).getTime() / 1000)
        : 0;

      const txResult = await contractService.issueCredential({
        studentAddress: formData.studentWallet,
        credentialType: formData.credentialType,
        courseName: formData.course,
        studentName: formData.studentName,
        studentId: formData.studentId,
        expiryDate: expiryTimestamp,
        ipfsHash: documentHash || metadataResult.ipfsHash,
        grade: formData.grade || 'N/A',
        metadataURI: metadataResult.pinataUrl,
      });

      if (!txResult.success) {
        throw new Error(txResult.error || 'Failed to issue credential on blockchain');
      }

      setUploadProgress('');
      toast.success(
        <div>
          <strong>Credential Issued Successfully!</strong>
          <br />
          Token ID: {txResult.tokenId}
          <br />
          <a 
            href={`https://sepolia.etherscan.io/tx/${txResult.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#10b981' }}
          >
            View Transaction
          </a>
        </div>,
        { autoClose: 10000 }
      );

      // Reset form
      setFormData({
        studentName: '',
        studentId: '',
        studentWallet: '',
        credentialType: '',
        course: '',
        grade: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        description: '',
      });
      setDocumentFile(null);
      setCurrentStep(1);

    } catch (error) {
      console.error('Issue credential error:', error);
      toast.error(error.message || 'Failed to issue credential');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  if (!isConnected) {
    return (
      <div className="connect-prompt">
        <div className="connect-card">
          <div className="connect-icon">🔐</div>
          <h2>Connect Your Wallet</h2>
          <p>Please connect your MetaMask wallet to access the Institution Dashboard</p>
          <Link to="/" className="btn btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="institution-info">
            <div className="institution-avatar">🏛️</div>
            <div>
              <h3>{institutionInfo?.name || 'Institution Portal'}</h3>
              <p className="wallet-address">{formatAddress(account)}</p>
              {institutionInfo?.isVerified ? (
                <span className="verified-badge">
                  <HiOutlineCheckCircle /> Verified
                </span>
              ) : (
                <span className="unverified-badge">
                  <HiOutlineExclamationCircle /> Not Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-nav-item ${window.location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {institutionInfo && (
          <div className="sidebar-stats">
            <div className="stat-item">
              <span className="stat-value">{institutionInfo.credentialsIssued}</span>
              <span className="stat-label">Credentials Issued</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Issue New Credential</h1>
            <p>Create and issue a new credential on the blockchain</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Student Info</span>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Credential Details</span>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Upload & Issue</span>
          </div>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="credential-form">
            {/* Step 1: Student Information */}
            {currentStep === 1 && (
              <div className="form-section">
                <h3 className="form-section-title">
                  <HiOutlineUser />
                  Student Information
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Student Name *</label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter student's full name"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Student ID *</label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g., STU2024001"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Student Wallet Address *</label>
                  <input
                    type="text"
                    name="studentWallet"
                    value={formData.studentWallet}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="0x..."
                    required
                  />
                  <small className="form-hint">
                    The credential NFT will be minted to this address
                  </small>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.studentName || !formData.studentId || !formData.studentWallet}
                  >
                    Next: Credential Details
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Credential Details */}
            {currentStep === 2 && (
              <div className="form-section">
                <h3 className="form-section-title">
                  <HiOutlineAcademicCap />
                  Credential Details
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Credential Type *</label>
                    <select
                      name="credentialType"
                      value={formData.credentialType}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="">Select credential type</option>
                      {credentialTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Course/Program Name *</label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Grade/GPA</label>
                    <input
                      type="text"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g., A+ or 3.9"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Issue Date *</label>
                    <input
                      type="date"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                    <small className="form-hint">
                      Leave empty for credentials that don't expire
                    </small>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-input form-textarea"
                    placeholder="Additional details about the credential..."
                    rows={3}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setCurrentStep(3)}
                    disabled={!formData.credentialType || !formData.course}
                  >
                    Next: Upload & Issue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Upload Document & Issue */}
            {currentStep === 3 && (
              <div className="form-section">
                <h3 className="form-section-title">
                  <HiOutlineUpload />
                  Upload Document & Issue
                </h3>

                {/* Summary */}
                <div className="credential-summary">
                  <h4>Credential Summary</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">Student:</span>
                      <span className="summary-value">{formData.studentName}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Student ID:</span>
                      <span className="summary-value">{formData.studentId}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Type:</span>
                      <span className="summary-value">
                        {credentialTypes.find(t => t.value === formData.credentialType)?.label}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Course:</span>
                      <span className="summary-value">{formData.course}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Grade:</span>
                      <span className="summary-value">{formData.grade || 'N/A'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Recipient:</span>
                      <span className="summary-value">{formatAddress(formData.studentWallet)}</span>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="form-group">
                  <label className="form-label">Upload Credential Document (Optional)</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="documentFile"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="file-input"
                    />
                    <label htmlFor="documentFile" className="file-upload-label">
                      <HiOutlinePhotograph className="upload-icon" />
                      {documentFile ? (
                        <span>{documentFile.name}</span>
                      ) : (
                        <>
                          <span>Click to upload or drag and drop</span>
                          <small>PDF, JPG, PNG (max 10MB)</small>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Progress */}
                {uploadProgress && (
                  <div className="upload-progress">
                    <div className="progress-spinner"></div>
                    <span>{uploadProgress}</span>
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setCurrentStep(2)}
                    disabled={isSubmitting}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-issue"
                    disabled={isSubmitting || !institutionInfo?.isVerified}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="btn-spinner"></span>
                        Issuing...
                      </>
                    ) : (
                      <>
                        <HiOutlineCheckCircle />
                        Issue Credential on Blockchain
                      </>
                    )}
                  </button>
                </div>

                {!institutionInfo?.isVerified && (
                  <div className="warning-banner">
                    <HiOutlineExclamationCircle />
                    <span>Your institution must be verified before you can issue credentials.</span>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default IssueCredential;
