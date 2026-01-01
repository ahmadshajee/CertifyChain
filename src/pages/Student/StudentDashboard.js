import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { 
  HiOutlineHome,
  HiOutlineCollection,
  HiOutlineShare,
  HiOutlineDocumentDownload,
  HiOutlineQrcode,
  HiOutlineEye,
  HiOutlineBadgeCheck,
  HiOutlineClock,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import './Student.css';

const StudentDashboard = () => {
  const location = useLocation();
  const { isConnected, account, formatAddress } = useWeb3();

  // For testing: skip wallet requirement
  const testMode = true;

  const sidebarLinks = [
    { path: '/student', icon: <HiOutlineHome />, label: 'Dashboard' },
    { path: '/student/credentials', icon: <HiOutlineCollection />, label: 'My Credentials' },
  ];

  const stats = [
    { icon: <HiOutlineBadgeCheck />, value: '5', label: 'Total Credentials', color: 'blue' },
    { icon: <HiOutlineEye />, value: '127', label: 'Total Views', color: 'green' },
    { icon: <HiOutlineShare />, value: '12', label: 'Times Shared', color: 'purple' },
    { icon: <HiOutlineClock />, value: '3', label: 'Pending', color: 'orange' },
  ];

  const credentials = [
    { 
      id: 1, 
      type: 'Bachelor of Technology', 
      course: 'Computer Science & Engineering',
      institution: 'IIT Delhi',
      date: '2024-06-15',
      status: 'verified',
      hash: '0x7f8a...3d2e'
    },
    { 
      id: 2, 
      type: 'Machine Learning Certificate', 
      course: 'Advanced ML Course',
      institution: 'Coursera - Stanford',
      date: '2024-03-20',
      status: 'verified',
      hash: '0x9c4b...7a1f'
    },
    { 
      id: 3, 
      type: 'Internship Certificate', 
      course: 'Software Engineering Intern',
      institution: 'Google India',
      date: '2023-12-01',
      status: 'verified',
      hash: '0x3e5d...8b2c'
    },
    { 
      id: 4, 
      type: 'AWS Cloud Practitioner', 
      course: 'Cloud Certification',
      institution: 'Amazon Web Services',
      date: '2024-01-10',
      status: 'pending',
      hash: '0x6f2a...4c9d'
    },
  ];

  if (!isConnected && !testMode) {
    return (
      <div className="connect-prompt">
        <div className="connect-card">
          <div className="connect-icon">🎓</div>
          <h2>Connect Your Wallet</h2>
          <p>Please connect your MetaMask wallet to access your credentials</p>
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
              className={`sidebar-nav-item ${location.pathname === link.path ? 'active' : ''}`}
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
            <h1>Welcome Back! 🎓</h1>
            <p>Manage and share your blockchain-verified credentials</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className={`stat-icon ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* My Credentials */}
        <div className="credentials-section">
          <div className="section-header-row">
            <h2>My Credentials</h2>
            <Link to="/student/credentials" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>

          <div className="credentials-grid">
            {credentials.map((cred) => (
              <div key={cred.id} className="credential-card-student">
                <div className="credential-card-header">
                  <div className={`status-indicator ${cred.status}`}>
                    {cred.status === 'verified' ? (
                      <><HiOutlineBadgeCheck /> Verified</>
                    ) : (
                      <><HiOutlineClock /> Pending</>
                    )}
                  </div>
                  <button className="more-btn">•••</button>
                </div>
                
                <h3>{cred.type}</h3>
                <p className="credential-course">{cred.course}</p>
                
                <div className="credential-meta">
                  <span className="institution">{cred.institution}</span>
                  <span className="date">{cred.date}</span>
                </div>

                <div className="credential-hash-display">
                  <code>{cred.hash}</code>
                </div>

                <div className="credential-actions">
                  <Link to={`/student/share/${cred.id}`} className="btn btn-primary btn-sm">
                    <HiOutlineShare /> Share
                  </Link>
                  <button className="btn btn-secondary btn-sm">
                    <HiOutlineQrcode /> QR Code
                  </button>
                  <button className="btn btn-secondary btn-sm">
                    <HiOutlineDocumentDownload /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon blue">
                <HiOutlineEye />
              </div>
              <div className="activity-content">
                <p><strong>Google HR</strong> viewed your B.Tech Certificate</p>
                <span>2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon green">
                <HiOutlineBadgeCheck />
              </div>
              <div className="activity-content">
                <p>New credential <strong>ML Certificate</strong> issued by Coursera</p>
                <span>1 day ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon purple">
                <HiOutlineShare />
              </div>
              <div className="activity-content">
                <p>You shared <strong>B.Tech Certificate</strong> with Microsoft</p>
                <span>3 days ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon orange">
                <HiOutlineExclamationCircle />
              </div>
              <div className="activity-content">
                <p><strong>AWS Certificate</strong> verification pending</p>
                <span>5 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
