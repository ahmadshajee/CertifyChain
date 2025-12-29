import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import { 
  HiOutlineHome,
  HiOutlineCollection,
  HiOutlineShare,
  HiOutlineLink,
  HiOutlineClipboard,
  HiOutlineMail,
  HiOutlineCalendar,
  HiOutlineUserCircle,
  HiOutlineBadgeCheck,
  HiOutlineArrowLeft
} from 'react-icons/hi';
import { FaLinkedin, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import './Student.css';

const ShareCredential = () => {
  const { id } = useParams();
  const { isConnected, account, formatAddress } = useWeb3();
  const [shareMethod, setShareMethod] = useState('link');
  const [expiryDays, setExpiryDays] = useState('7');
  const [recipientEmail, setRecipientEmail] = useState('');

  const sidebarLinks = [
    { path: '/student', icon: <HiOutlineHome />, label: 'Dashboard' },
    { path: '/student/credentials', icon: <HiOutlineCollection />, label: 'My Credentials' },
  ];

  // Mock credential data
  const credential = {
    id: 1,
    type: 'Bachelor of Technology',
    course: 'Computer Science & Engineering',
    institution: 'IIT Delhi',
    date: '2024-06-15',
    status: 'verified',
    hash: '0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
    grade: '8.5 CGPA',
    studentName: 'John Doe'
  };

  const shareLink = `https://certifychain.io/verify/${credential.hash}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard!');
  };

  const handleEmailShare = (e) => {
    e.preventDefault();
    if (!recipientEmail) {
      toast.error('Please enter recipient email');
      return;
    }
    toast.success(`Credential shared with ${recipientEmail}`);
    setRecipientEmail('');
  };

  if (!isConnected) {
    return (
      <div className="connect-prompt">
        <div className="connect-card">
          <div className="connect-icon">🎓</div>
          <h2>Connect Your Wallet</h2>
          <p>Please connect your MetaMask wallet to share credentials</p>
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
          <div className="student-profile">
            <div className="profile-avatar">🎓</div>
            <div>
              <h3>Student Portal</h3>
              <p className="wallet-address">{formatAddress(account)}</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-nav-item`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <Link to="/student/credentials" className="back-link">
          <HiOutlineArrowLeft /> Back to Credentials
        </Link>

        <div className="dashboard-header">
          <div>
            <h1>Share Credential</h1>
            <p>Share your verified credential securely</p>
          </div>
        </div>

        <div className="share-container">
          {/* Credential Preview */}
          <div className="share-preview">
            <div className="preview-card">
              <div className="preview-status">
                <HiOutlineBadgeCheck /> Verified on Blockchain
              </div>
              
              <h2>{credential.type}</h2>
              <p className="preview-course">{credential.course}</p>
              
              <div className="preview-details">
                <div className="detail-row">
                  <HiOutlineUserCircle />
                  <span>{credential.studentName}</span>
                </div>
                <div className="detail-row">
                  <HiOutlineBadgeCheck />
                  <span>{credential.institution}</span>
                </div>
                <div className="detail-row">
                  <HiOutlineCalendar />
                  <span>Issued: {credential.date}</span>
                </div>
              </div>

              <div className="preview-hash">
                <span>Credential Hash</span>
                <code>{credential.hash}</code>
              </div>

              <div className="qr-section">
                <QRCodeSVG 
                  value={shareLink}
                  size={180}
                  bgColor="#16213e"
                  fgColor="#ffffff"
                  level="H"
                  includeMargin={true}
                />
                <p>Scan to verify</p>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="share-options">
            <div className="share-tabs">
              <button 
                className={`share-tab ${shareMethod === 'link' ? 'active' : ''}`}
                onClick={() => setShareMethod('link')}
              >
                <HiOutlineLink /> Share Link
              </button>
              <button 
                className={`share-tab ${shareMethod === 'email' ? 'active' : ''}`}
                onClick={() => setShareMethod('email')}
              >
                <HiOutlineMail /> Email
              </button>
              <button 
                className={`share-tab ${shareMethod === 'social' ? 'active' : ''}`}
                onClick={() => setShareMethod('social')}
              >
                <HiOutlineShare /> Social
              </button>
            </div>

            <div className="share-content">
              {shareMethod === 'link' && (
                <div className="share-link-section">
                  <h3>Share via Link</h3>
                  <p>Copy this link to share your credential</p>
                  
                  <div className="link-input-group">
                    <input 
                      type="text" 
                      value={shareLink} 
                      readOnly 
                      className="form-input"
                    />
                    <button className="btn btn-primary" onClick={copyToClipboard}>
                      <HiOutlineClipboard /> Copy
                    </button>
                  </div>

                  <div className="expiry-setting">
                    <label>Link expires in</label>
                    <select 
                      value={expiryDays} 
                      onChange={(e) => setExpiryDays(e.target.value)}
                      className="form-input"
                    >
                      <option value="1">1 day</option>
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              )}

              {shareMethod === 'email' && (
                <div className="share-email-section">
                  <h3>Share via Email</h3>
                  <p>Send credential directly to an employer or verifier</p>
                  
                  <form onSubmit={handleEmailShare}>
                    <div className="form-group">
                      <label className="form-label">Recipient Email</label>
                      <input 
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="hr@company.com"
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Message (Optional)</label>
                      <textarea 
                        placeholder="Add a personal message..."
                        className="form-input form-textarea"
                        rows={4}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg">
                      <HiOutlineMail /> Send Credential
                    </button>
                  </form>
                </div>
              )}

              {shareMethod === 'social' && (
                <div className="share-social-section">
                  <h3>Share on Social Media</h3>
                  <p>Showcase your achievement on social platforms</p>
                  
                  <div className="social-buttons">
                    <button className="social-share-btn linkedin">
                      <FaLinkedin /> Share on LinkedIn
                    </button>
                    <button className="social-share-btn twitter">
                      <FaTwitter /> Share on Twitter
                    </button>
                    <button className="social-share-btn whatsapp">
                      <FaWhatsapp /> Share on WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Share History */}
            <div className="share-history">
              <h3>Recent Shares</h3>
              <div className="history-list">
                <div className="history-item">
                  <div className="history-icon blue"><HiOutlineMail /></div>
                  <div className="history-content">
                    <p>Shared with <strong>hr@google.com</strong></p>
                    <span>2 days ago • Viewed 3 times</span>
                  </div>
                </div>
                <div className="history-item">
                  <div className="history-icon green"><HiOutlineLink /></div>
                  <div className="history-content">
                    <p>Link shared</p>
                    <span>5 days ago • Viewed 12 times</span>
                  </div>
                </div>
                <div className="history-item">
                  <div className="history-icon purple"><FaLinkedin /></div>
                  <div className="history-content">
                    <p>Posted on LinkedIn</p>
                    <span>1 week ago • 45 impressions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShareCredential;
