import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { toast } from 'react-toastify';
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
  HiOutlineCheckCircle
} from 'react-icons/hi';
import './Institution.css';

const IssueCredential = () => {
  const { isConnected, account, formatAddress } = useWeb3();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    studentWallet: '',
    credentialType: '',
    course: '',
    grade: '',
    issueDate: '',
    expiryDate: '',
    description: '',
  });

  const sidebarLinks = [
    { path: '/institution', icon: <HiOutlineHome />, label: 'Dashboard' },
    { path: '/institution/issue', icon: <HiOutlineDocumentAdd />, label: 'Issue Credential' },
    { path: '/institution/manage', icon: <HiOutlineCollection />, label: 'Manage Credentials' },
  ];

  const credentialTypes = [
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Diploma',
    'Certificate',
    'Transcript',
    'Course Completion',
    'Professional Certification'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.studentName || !formData.studentWallet || !formData.credentialType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Credential issued successfully!');
      setFormData({
        studentName: '',
        studentWallet: '',
        credentialType: '',
        course: '',
        grade: '',
        issueDate: '',
        expiryDate: '',
        description: '',
      });
    } catch (error) {
      toast.error('Failed to issue credential');
    } finally {
      setIsSubmitting(false);
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
              <h3>Institution Portal</h3>
              <p className="wallet-address">{formatAddress(account)}</p>
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
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Issue New Credential</h1>
            <p>Create and issue a new credential on the blockchain</p>
          </div>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="credential-form">
            {/* Student Information */}
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
                </div>
              </div>
            </div>

            {/* Credential Details */}
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
                    {credentialTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Course / Program</label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Computer Science & Engineering"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Grade / CGPA</label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., 8.5 CGPA or First Class"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Additional details"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="form-section">
              <h3 className="form-section-title">
                <HiOutlineCalendar />
                Validity Period
              </h3>
              
              <div className="form-row">
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
                
                <div className="form-group">
                  <label className="form-label">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="form-section">
              <h3 className="form-section-title">
                <HiOutlinePhotograph />
                Upload Document (Optional)
              </h3>
              
              <div className="upload-zone">
                <HiOutlineUpload className="upload-icon" />
                <p>Drag and drop your document here, or click to browse</p>
                <span>Supported formats: PDF, PNG, JPG (Max 10MB)</span>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" hidden />
              </div>
            </div>

            {/* Preview */}
            <div className="form-section preview-section">
              <h3 className="form-section-title">
                <HiOutlineClipboard />
                Credential Preview
              </h3>
              
              <div className="credential-preview">
                <div className="preview-header">
                  <HiOutlineAcademicCap />
                  <span className="preview-badge">Preview</span>
                </div>
                <h4>{formData.credentialType || 'Credential Type'}</h4>
                <p className="preview-course">{formData.course || 'Course / Program'}</p>
                <div className="preview-details">
                  <div className="preview-item">
                    <span className="label">Student</span>
                    <span className="value">{formData.studentName || '—'}</span>
                  </div>
                  <div className="preview-item">
                    <span className="label">Grade</span>
                    <span className="value">{formData.grade || '—'}</span>
                  </div>
                  <div className="preview-item">
                    <span className="label">Issue Date</span>
                    <span className="value">{formData.issueDate || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setFormData({
                studentName: '',
                studentWallet: '',
                credentialType: '',
                course: '',
                grade: '',
                issueDate: '',
                expiryDate: '',
                description: '',
              })}>
                Clear Form
              </button>
              <button 
                type="submit" 
                className="btn btn-primary btn-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner-sm"></span>
                    Issuing Credential...
                  </>
                ) : (
                  <>
                    <HiOutlineCheckCircle />
                    Issue Credential
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default IssueCredential;
